// === デジタルアーカイブ体験 ===
// Supabase（DB + Storage）に保存する共有アーカイブ。
// 投稿は全員に公開。編集・削除は「作成した端末」だけに表示（localStorageで判定）。
// 表示は DOM 構築（textContent）で行い、ユーザー入力由来の XSS を回避する。
(function () {
  'use strict';

  const cfg = window.ARCHIVE_CONFIG || {};
  const BUCKET = cfg.BUCKET || 'archive-images';
  const MINE_KEY = 'archive-mine-v1';
  const MAX_DIM = 1600;
  const JPEG_QUALITY = 0.82;

  const DC_FIELDS = [
    { key: 'dc_title',       label: 'タイトル',         el: 'dc:title' },
    { key: 'dc_creator',     label: '作成者・撮影者',   el: 'dc:creator' },
    { key: 'dc_date',        label: '日付',             el: 'dc:date' },
    { key: 'dc_description', label: '説明',             el: 'dc:description' },
    { key: 'dc_subject',     label: '主題・キーワード', el: 'dc:subject', isSubject: true },
    { key: 'dc_coverage',    label: '場所・範囲',       el: 'dc:coverage' },
    { key: 'dc_type',        label: '資源タイプ',       el: 'dc:type' },
    { key: 'dc_rights',      label: '権利',             el: 'dc:rights' }
  ];

  // メディア種別ごとのアイコン（拡張子から判定）
  const TYPE_ICON = { image: '🖼️', video: '🎬', audio: '🎵', text: '📄', file: '📎' };
  const MAX_FILE_BYTES = 50 * 1024 * 1024; // 画像以外のアップロード上限の目安（Supabaseの既定値に合わせる）

  let sb = null;
  let selectedFile = null;
  let previewUrl = null;

  const state = {
    archives: [],
    countByArchive: {},
    coverByArchive: {},
    currentArchive: null,
    items: [],
    search: '',
    subject: null
  };

  const $ = (id) => document.getElementById(id);
  let el = {};

  // ---------- DOM 構築ヘルパー（innerHTML を使わない） ----------
  function h(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      for (const k in props) {
        const v = props[k];
        if (v == null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'onclick') node.addEventListener('click', v);
        else node.setAttribute(k, v);
      }
    }
    (children || []).forEach((c) => {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  // ---------- helpers ----------
  function configured() {
    const u = cfg.SUPABASE_URL || '';
    const k = cfg.SUPABASE_ANON_KEY || '';
    return u && !/YOUR-/.test(u) && k && !/YOUR-/.test(k);
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function splitSubjects(s) {
    if (!s) return [];
    const seen = new Set();
    return s.split(/[,、\s/]+/).map((x) => x.trim()).filter((x) => {
      if (!x || seen.has(x)) return false;
      seen.add(x);
      return true;
    });
  }

  function publicUrl(path) {
    if (!path || !sb) return null;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  // 保存パスの拡張子からメディア種別を判定
  function mediaTypeOf(path) {
    if (!path) return 'file';
    const ext = (path.split('.').pop() || '').toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif', 'heic', 'heif'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov', 'm4v', 'ogv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'm4a', 'aac', 'ogg', 'oga', 'opus', 'weba', 'flac'].includes(ext)) return 'audio';
    if (['txt', 'md', 'csv', 'tsv', 'json', 'log', 'rtf', 'xml', 'html', 'htm'].includes(ext)) return 'text';
    return 'file';
  }

  // アップロードするファイルのメディア種別（MIME/拡張子から）
  function fileMediaType(file) {
    const t = file.type || '';
    if (t.startsWith('image/')) return 'image';
    if (t.startsWith('video/')) return 'video';
    if (t.startsWith('audio/')) return 'audio';
    if (t.startsWith('text/') || /\.(txt|md|csv|tsv|json|log|rtf|xml|html?)$/i.test(file.name)) return 'text';
    return 'file';
  }

  // 保存用の拡張子を決める
  function extOf(name, mime) {
    const m = (name || '').match(/\.([a-z0-9]+)$/i);
    if (m) return m[1].toLowerCase();
    const map = {
      'text/plain': 'txt', 'application/json': 'json', 'audio/mpeg': 'mp3', 'audio/wav': 'wav',
      'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'video/mp4': 'mp4', 'video/webm': 'webm',
      'video/quicktime': 'mov', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp'
    };
    return map[mime] || 'bin';
  }

  // メディア種別 → dc:type の自動候補
  function dcTypeFor(mt) {
    return { image: '静止画（写真）', video: '動画（映像）', audio: '音声', text: 'テキスト（文書）', file: 'その他' }[mt] || 'その他';
  }

  function setNotice(children, type) {
    el.notice.replaceChildren.apply(el.notice, children);
    el.notice.className = 'archive-notice' + (type ? ' ' + type : '');
    el.notice.hidden = false;
  }
  function clearNotice() { el.notice.hidden = true; el.notice.replaceChildren(); }

  function showView(name) {
    el.galleryView.hidden = name !== 'gallery';
    el.createView.hidden = name !== 'create';
    el.detailView.hidden = name !== 'detail';
  }

  // ---------- パーマリンク（URLハッシュによるディープリンク） ----------
  // URL例： archive.html#a=アーカイブID            … そのアーカイブを開く
  //         archive.html#a=アーカイブID&i=資料ID   … その資料の詳細まで開く
  function parseHash() {
    const raw = (location.hash || '').replace(/^#/, '');
    const out = {};
    raw.split('&').forEach((kv) => {
      const eq = kv.indexOf('=');
      if (eq === -1) return;
      const k = kv.slice(0, eq);
      const v = kv.slice(eq + 1);
      if (k === 'a') out.a = v;
      else if (k === 'i') out.i = v;
    });
    return out;
  }

  function buildHash(archiveId, itemId) {
    if (!archiveId) return '';
    let s = 'a=' + archiveId;
    if (itemId) s += '&i=' + itemId;
    return s;
  }

  // 画面遷移はハッシュの更新に集約し、route() が実際の表示を担う（戻る/進むにも対応）。
  function setHash(archiveId, itemId) {
    const next = buildHash(archiveId, itemId);
    const cur = (location.hash || '').replace(/^#/, '');
    if (cur === next) return;
    if (next) {
      location.hash = next; // hashchange → route()
    } else {
      // ハッシュを消す（末尾に「#」を残さない）。replaceState は hashchange を発火しないので手動で route。
      history.replaceState(null, '', location.pathname + location.search);
      route();
    }
  }

  function permalinkFor(archiveId, itemId) {
    return location.origin + location.pathname + '#' + buildHash(archiveId, itemId);
  }

  function copyLink(btn, url) {
    const ok = () => {
      const original = btn.textContent;
      btn.textContent = '✓ コピーしました';
      setTimeout(() => { btn.textContent = original; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(ok).catch(() => window.prompt('このリンクをコピーしてください：', url));
    } else {
      window.prompt('このリンクをコピーしてください：', url);
    }
  }

  // 実URLを表示する読み取り専用欄＋「コピー」ボタン（タップで全選択 → 手動コピーも可）
  function permalinkBox(url) {
    const input = h('input', { type: 'text', class: 'permalink-input', readonly: '', 'aria-label': '共有リンク' });
    input.value = url;
    const selectAll = () => { try { input.select(); } catch (e) {} };
    input.addEventListener('focus', selectAll);
    input.addEventListener('click', selectAll);
    const btn = h('button', { type: 'button', class: 'btn-secondary permalink-copy', text: 'コピー' });
    btn.addEventListener('click', () => copyLink(btn, url));
    return h('div', { class: 'permalink-box' }, [input, btn]);
  }

  function closeItemModalNav() {
    closeModal(el.itemModal);
    if (state.currentArchive) setHash(state.currentArchive.id); // URLから資料IDを外す
  }

  // ハッシュを唯一の遷移源とするルーター（初期表示・hashchange の両方から呼ばれる）
  async function route() {
    if (!sb) return;
    const { a, i } = parseHash();
    if (!a) {
      closeModal(el.itemModal);
      closeModal(el.addItemModal);
      showView('gallery');
      await loadGallery();
      return;
    }
    if (!state.currentArchive || state.currentArchive.id !== a) {
      const opened = await openArchive(a);
      if (!opened) { setHash(''); return; } // 見つからない等 → 一覧へ
    }
    if (i) {
      closeModal(el.addItemModal);
      openItemModal(i);
    } else {
      closeModal(el.itemModal);
    }
  }

  function fail(msg, err) {
    if (err) console.error(err);
    setNotice([h('h3', { text: 'エラーが発生しました' }), h('p', { text: msg })], 'error');
  }

  // ---------- 端末ベースの所有判定 ----------
  function loadMine() {
    try { return JSON.parse(localStorage.getItem(MINE_KEY)) || { archives: [], items: [] }; }
    catch (e) { return { archives: [], items: [] }; }
  }
  function saveMine(m) { try { localStorage.setItem(MINE_KEY, JSON.stringify(m)); } catch (e) {} }
  function isMineArchive(id) { return loadMine().archives.includes(id); }
  function isMineItem(id) { return loadMine().items.includes(id); }
  function rememberArchive(id) { const m = loadMine(); if (!m.archives.includes(id)) { m.archives.push(id); saveMine(m); } }
  function rememberItem(id) { const m = loadMine(); if (!m.items.includes(id)) { m.items.push(id); saveMine(m); } }
  function forgetArchive(id) { const m = loadMine(); m.archives = m.archives.filter((x) => x !== id); saveMine(m); }
  function forgetItem(id) { const m = loadMine(); m.items = m.items.filter((x) => x !== id); saveMine(m); }

  // ---------- 一覧 ----------
  async function loadGallery() {
    if (!sb) return;
    clearNotice();
    el.galleryLoading.hidden = false;
    el.galleryEmpty.hidden = true;
    el.archiveGrid.replaceChildren();
    try {
      const { data: archives, error } = await sb
        .from('archives').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const { data: items, error: e2 } = await sb
        .from('items').select('id, archive_id, image_path, created_at')
        .order('created_at', { ascending: true });
      if (e2) throw e2;

      state.archives = archives || [];
      state.countByArchive = {};
      state.coverByArchive = {};
      (items || []).forEach((it) => {
        state.countByArchive[it.archive_id] = (state.countByArchive[it.archive_id] || 0) + 1;
        if (!state.coverByArchive[it.archive_id] && it.image_path && mediaTypeOf(it.image_path) === 'image') {
          state.coverByArchive[it.archive_id] = it.image_path;
        }
      });
      renderGallery();
    } catch (err) {
      fail('アーカイブ一覧を読み込めませんでした。Supabaseの設定（テーブル・ポリシー）を確認してください。', err);
    } finally {
      el.galleryLoading.hidden = true;
    }
  }

  function renderGallery() {
    if (!state.archives.length) {
      el.archiveGrid.replaceChildren();
      el.galleryEmpty.hidden = false;
      return;
    }
    el.galleryEmpty.hidden = true;
    const cards = state.archives.map((a) => {
      const count = state.countByArchive[a.id] || 0;
      const cover = state.coverByArchive[a.id];
      const coverNode = cover
        ? h('img', { class: 'archive-cover', src: publicUrl(cover), alt: '', loading: 'lazy' })
        : h('div', { class: 'archive-cover placeholder', text: '🗂️' });
      const body = h('div', { class: 'archive-card-body' }, [
        h('p', { class: 'archive-card-title', text: a.title }),
        h('span', { class: 'archive-card-owner', text: '作成者：' + a.owner_name }),
        h('div', { class: 'archive-card-foot' }, [
          h('span', { text: fmtDate(a.created_at) }),
          h('span', { class: 'archive-card-count', text: count + '件' })
        ])
      ]);
      return h('button', { type: 'button', class: 'archive-card', 'data-id': a.id }, [coverNode, body]);
    });
    el.archiveGrid.replaceChildren.apply(el.archiveGrid, cards);
  }

  // ---------- 詳細 ----------
  async function openArchive(id) {
    clearNotice();
    try {
      const { data: arch, error } = await sb.from('archives').select('*').eq('id', id).single();
      if (error || !arch) throw error || new Error('not found');
      const { data: items, error: e2 } = await sb
        .from('items').select('*').eq('archive_id', id).order('created_at', { ascending: true });
      if (e2) throw e2;
      state.currentArchive = arch;
      state.items = items || [];
      state.search = '';
      state.subject = null;
      el.itemSearch.value = '';
      renderDetail();
      showView('detail');
      window.scrollTo(0, 0);
      return true;
    } catch (err) {
      fail('アーカイブを開けませんでした。', err);
      return false;
    }
  }

  function renderDetail() {
    const a = state.currentArchive;
    if (!a) return;
    el.detailTitle.textContent = a.title;
    el.detailMeta.textContent = '作成者：' + a.owner_name + ' ／ ' + fmtDate(a.created_at) + ' ／ ' + state.items.length + '件';
    el.detailDesc.textContent = a.description || '';
    el.detailDesc.hidden = !a.description;
    // 共有アーカイブのため操作欄は常に表示。「資料を追加」「削除」とも誰でも可（授業運用のため）。
    el.detailOwnerActions.hidden = false;
    el.addItemBtn.hidden = false;
    el.archivePermalink.replaceChildren(
      h('span', { class: 'permalink-label', text: '🔗 このアーカイブの共有リンク' }),
      permalinkBox(permalinkFor(a.id))
    );
    renderSubjects();
    renderItems();
  }

  function renderSubjects() {
    const all = new Set();
    state.items.forEach((it) => splitSubjects(it.dc_subject).forEach((s) => all.add(s)));
    const subjects = Array.from(all);
    if (!subjects.length) { el.subjectFilters.replaceChildren(); return; }
    const chips = subjects.map((s) =>
      h('button', {
        type: 'button',
        class: 'subject-chip' + (state.subject === s ? ' active' : ''),
        'data-subject': s,
        text: s
      })
    );
    el.subjectFilters.replaceChildren.apply(el.subjectFilters, chips);
  }

  function matchesSearch(it) {
    if (!state.search) return true;
    const q = state.search.toLowerCase();
    const parts = DC_FIELDS.map((f) => it[f.key] || '');
    if (it.custom && typeof it.custom === 'object') {
      Object.keys(it.custom).forEach((k) => { parts.push(k); parts.push(it.custom[k]); });
    }
    return parts.join('  ').toLowerCase().indexOf(q) !== -1;
  }

  function renderItems() {
    let list = state.items.filter(matchesSearch);
    if (state.subject) {
      list = list.filter((it) => splitSubjects(it.dc_subject).includes(state.subject));
    }
    if (!list.length) {
      el.itemGrid.replaceChildren();
      el.detailEmpty.hidden = false;
      el.detailEmpty.textContent = state.items.length
        ? '条件に合う資料がありません。'
        : 'まだ資料がありません。「＋ 資料を追加」から登録しましょう。';
      return;
    }
    el.detailEmpty.hidden = true;
    const cards = list.map((it) => {
      const url = publicUrl(it.image_path);
      const mt = mediaTypeOf(it.image_path);
      const thumb = (mt === 'image' && url)
        ? h('img', { class: 'item-thumb', src: url, alt: '', loading: 'lazy' })
        : h('div', { class: 'item-thumb placeholder', text: TYPE_ICON[mt] || '📎' });
      const sub = [it.dc_creator, it.dc_date].filter(Boolean).join(' ／ ');
      const body = h('div', { class: 'item-card-body' }, [
        h('p', { class: 'item-card-title', text: it.dc_title }),
        sub ? h('p', { class: 'item-card-sub', text: sub }) : null
      ]);
      return h('button', { type: 'button', class: 'item-card', 'data-id': it.id }, [thumb, body]);
    });
    el.itemGrid.replaceChildren.apply(el.itemGrid, cards);
  }

  async function refreshCurrentItems() {
    const { data, error } = await sb
      .from('items').select('*').eq('archive_id', state.currentArchive.id)
      .order('created_at', { ascending: true });
    if (error) { fail('資料を再読み込みできませんでした。', error); return; }
    state.items = data || [];
    renderDetail();
  }

  // ---------- 資料詳細モーダル ----------
  function openItemModal(id) {
    const it = state.items.find((x) => x.id === id);
    if (!it) return;
    const body = [];
    const url = publicUrl(it.image_path);
    const mt = mediaTypeOf(it.image_path);
    if (url) {
      if (mt === 'image') {
        body.push(h('img', { class: 'item-detail-img', src: url, alt: it.dc_title || '' }));
      } else if (mt === 'video') {
        body.push(h('video', { class: 'item-detail-media', src: url, controls: '', preload: 'metadata' }));
      } else if (mt === 'audio') {
        body.push(h('audio', { class: 'item-detail-audio', src: url, controls: '', preload: 'metadata' }));
      } else if (mt === 'text') {
        const pre = h('pre', { class: 'text-preview', text: '読み込み中…' });
        body.push(pre);
        fetch(url)
          .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
          .then((t) => { pre.textContent = t.length > 20000 ? t.slice(0, 20000) + '\n…（以下省略）' : t; })
          .catch(() => { pre.textContent = '（プレビューを読み込めませんでした。下のリンクから開いてください。）'; });
      }
      if (mt !== 'image') {
        body.push(h('p', { class: 'open-link-row' }, [
          h('a', { class: 'open-link', href: url, target: '_blank', rel: 'noopener', text: (TYPE_ICON[mt] || '📎') + ' ファイルを開く / ダウンロード' })
        ]));
      }
    }

    const dl = h('dl', { class: 'dc-list' });
    DC_FIELDS.forEach((f) => {
      const v = it[f.key];
      if (!v) return;
      dl.appendChild(h('dt', {}, [f.label, h('br'), h('span', { class: 'dc-element', text: f.el })]));
      if (f.isSubject) {
        const tags = splitSubjects(v).map((s) => h('span', { class: 'pill', text: s }));
        dl.appendChild(h('dd', {}, [h('span', { class: 'dc-subject-tags' }, tags)]));
      } else {
        dl.appendChild(h('dd', { text: v }));
      }
    });
    if (it.custom && typeof it.custom === 'object') {
      Object.keys(it.custom).forEach((k) => {
        const cv = it.custom[k];
        if (!k || cv === '' || cv == null) return;
        dl.appendChild(h('dt', {}, [k, h('br'), h('span', { class: 'dc-element', text: '自由項目' })]));
        dl.appendChild(h('dd', { text: cv }));
      });
    }
    body.push(dl);
    body.push(h('div', { class: 'permalink-wrap' }, [
      h('span', { class: 'permalink-label', text: '🔗 この資料の共有リンク' }),
      permalinkBox(permalinkFor(state.currentArchive.id, it.id))
    ]));
    el.itemModalBody.replaceChildren.apply(el.itemModalBody, body);

    // 共有アーカイブのため削除は誰でも可（タッチ端末では右クリックが使えないので、ボタンは常に表示）。
    const actions = [
      h('button', {
        type: 'button', class: 'btn-danger', text: 'この資料を削除',
        onclick: () => deleteItem(it)
      })
    ];
    el.itemModalActions.replaceChildren.apply(el.itemModalActions, actions);
    openModal(el.itemModal);
  }

  // ---------- 画像リサイズ ----------
  function loadViaImg(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }

  async function resizeImage(file) {
    let src;
    try {
      src = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (e) {
      try { src = await createImageBitmap(file); }
      catch (e2) { src = await loadViaImg(file); }
    }
    const iw = src.naturalWidth || src.width;
    const ih = src.naturalHeight || src.height;
    const scale = Math.min(1, MAX_DIM / Math.max(iw, ih));
    const w = Math.max(1, Math.round(iw * scale));
    const hgt = Math.max(1, Math.round(ih * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = hgt;
    canvas.getContext('2d').drawImage(src, 0, 0, w, hgt);
    if (src.close) src.close();
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', JPEG_QUALITY));
    if (!blob) throw new Error('画像の変換に失敗しました');
    return blob;
  }

  // ---------- 自由項目 ----------
  function addCustomFieldRow(label, value) {
    const labelInput = h('input', { type: 'text', class: 'cf-label', maxlength: '40', placeholder: '項目名（例：素材）' });
    const valueInput = h('input', { type: 'text', class: 'cf-value', maxlength: '200', placeholder: '値（例：木製）' });
    if (label) labelInput.value = label;
    if (value) valueInput.value = value;
    const remove = h('button', { type: 'button', class: 'btn-delete cf-remove', 'aria-label': '削除', text: '×' });
    const row = h('div', { class: 'custom-field-row' }, [labelInput, valueInput, remove]);
    remove.addEventListener('click', () => row.remove());
    el.customFields.appendChild(row);
  }

  function collectCustom() {
    const out = {};
    el.customFields.querySelectorAll('.custom-field-row').forEach((row) => {
      const k = row.querySelector('.cf-label').value.trim();
      const v = row.querySelector('.cf-value').value.trim();
      if (k && v) out[k] = v;
    });
    return out;
  }

  // ---------- モーダル制御 ----------
  function openModal(node) { node.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeModal(node) { node.hidden = true; document.body.style.overflow = ''; }

  function resetItemForm() {
    el.itemForm.reset();
    el.customFields.replaceChildren();
    selectedFile = null;
    if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
    el.itemPreview.replaceChildren();
    el.itemPreview.hidden = true;
  }

  function openAddItem() {
    resetItemForm();
    if (state.currentArchive) {
      el.itemForm.elements['dc_creator'].value = state.currentArchive.owner_name || '';
    }
    openModal(el.addItemModal);
  }

  // ---------- 作成・追加・削除 ----------
  async function createArchive(e) {
    e.preventDefault();
    const f = el.archiveForm.elements;
    const owner_name = f['owner_name'].value.trim();
    const title = f['title'].value.trim();
    const description = f['description'].value.trim();
    if (!owner_name || !title) return;
    const btn = el.archiveForm.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = '作成中…';
    try {
      const { data, error } = await sb.from('archives')
        .insert({ owner_name, title, description: description || null })
        .select().single();
      if (error) throw error;
      rememberArchive(data.id);
      el.archiveForm.reset();
      setHash(data.id); // 作成したアーカイブを開く（URLも更新）
    } catch (err) {
      fail('アーカイブを作成できませんでした。', err);
    } finally {
      btn.disabled = false; btn.textContent = '作成して資料を追加する';
    }
  }

  async function addItem(e) {
    e.preventDefault();
    if (!selectedFile) { alert('資料ファイルを選んでください。'); return; }
    const f = el.itemForm.elements;
    const dc_title = f['dc_title'].value.trim();
    if (!dc_title) return;
    const btn = el.itemSubmitBtn;
    btn.disabled = true; btn.textContent = '登録中…';
    el.itemForm.classList.add('busy');
    try {
      let blob, ext, contentType;
      if (fileMediaType(selectedFile) === 'image') {
        blob = await resizeImage(selectedFile);   // 写真は縮小してJPEG化
        ext = 'jpg';
        contentType = 'image/jpeg';
      } else {
        blob = selectedFile;                       // 動画・音声・テキスト等はそのまま
        ext = extOf(selectedFile.name, selectedFile.type);
        contentType = selectedFile.type || 'application/octet-stream';
      }
      const path = state.currentArchive.id + '/' + uuid() + '.' + ext;
      const up = await sb.storage.from(BUCKET).upload(path, blob, { contentType: contentType, upsert: false });
      if (up.error) throw up.error;
      const record = {
        archive_id: state.currentArchive.id,
        image_path: path,
        dc_title: dc_title,
        dc_creator: f['dc_creator'].value.trim() || null,
        dc_date: f['dc_date'].value.trim() || null,
        dc_description: f['dc_description'].value.trim() || null,
        dc_subject: f['dc_subject'].value.trim() || null,
        dc_coverage: f['dc_coverage'].value.trim() || null,
        dc_type: f['dc_type'].value || null,
        dc_rights: f['dc_rights'].value.trim() || null,
        custom: collectCustom()
      };
      const { data, error } = await sb.from('items').insert(record).select().single();
      if (error) throw error;
      rememberItem(data.id);
      closeModal(el.addItemModal);
      resetItemForm();
      await refreshCurrentItems();
    } catch (err) {
      console.error(err);
      alert('資料を登録できませんでした。' + (err && err.message ? '\n' + err.message : ''));
    } finally {
      btn.disabled = false; btn.textContent = 'この資料を登録';
      el.itemForm.classList.remove('busy');
    }
  }

  async function deleteItem(it) {
    if (!confirm('この資料を削除します。よろしいですか？')) return;
    try {
      // DBの行だけ削除し、ストレージのファイルは残す（＝Ctrl+Z で復元できるように）。
      const { error } = await sb.from('items').delete().eq('id', it.id);
      if (error) throw error;
      forgetItem(it.id);
      pushUndo({ kind: 'item', record: itemInsertRecord(it), paths: it.image_path ? [it.image_path] : [] });
      closeModal(el.itemModal);
      await refreshCurrentItems();
      if (state.currentArchive) setHash(state.currentArchive.id); // URLから削除済み資料IDを外す
      showUndoToast('資料を削除しました');
    } catch (err) {
      console.error(err);
      alert('資料を削除できませんでした。' + (err && err.message ? '\n' + err.message : ''));
    }
  }

  // 詳細画面の「削除」ボタン用（現在開いているアーカイブを削除）
  function deleteArchive() {
    const a = state.currentArchive;
    if (!a) return;
    deleteArchiveById(a.id, a.title);
  }

  // アーカイブを資料ごと削除する（ID指定。ボタン／右クリックの両方から使う）。
  // DBの行だけ削除し、ストレージのファイルは残す（＝Ctrl+Z で丸ごと復元できるように）。失敗は alert で通知。
  async function deleteArchiveById(id, title) {
    if (!id) return;
    const label = title ? '「' + title + '」' : 'このアーカイブ';
    if (!confirm(label + 'をアーカイブごと削除します。中の資料もすべて削除されます。よろしいですか？')) return;
    try {
      // 1) このアーカイブの資料行を全カラム取得（復元用に丸ごと控える）
      const { data: rows, error: e1 } = await sb
        .from('items').select('*').eq('archive_id', id);
      if (e1) throw e1;
      const items = rows || [];

      // 2) アーカイブ本体のレコードも控える（開いていればそれを、なければ取得）
      let archiveRec = (state.currentArchive && state.currentArchive.id === id) ? state.currentArchive : null;
      if (!archiveRec) {
        const { data: arc } = await sb.from('archives').select('*').eq('id', id).single();
        archiveRec = arc;
      }

      // 3) 資料行を明示的に削除（cascade に依存しない）
      const { error: e2 } = await sb.from('items').delete().eq('archive_id', id);
      if (e2) throw e2;

      // 4) アーカイブ本体を削除（ストレージのファイルは残す）
      const { error: e3 } = await sb.from('archives').delete().eq('id', id);
      if (e3) throw e3;

      // 5) この端末の所有記録を整理
      forgetArchive(id);
      items.forEach((it) => forgetItem(it.id));

      // 6) アンドゥ用に控える（アーカイブ＋資料を丸ごと）
      pushUndo({
        kind: 'archive',
        archive: archiveInsertRecord(archiveRec),
        items: items.map(itemInsertRecord),
        paths: items.map((it) => it.image_path).filter(Boolean)
      });

      // 7) 画面遷移：開いていたアーカイブなら一覧へ、一覧からの削除なら再読み込み
      if (state.currentArchive && state.currentArchive.id === id) {
        state.currentArchive = null;
        setHash('');
      } else {
        await loadGallery();
      }
      showUndoToast(label + 'を削除しました');
    } catch (err) {
      console.error(err);
      alert('アーカイブを削除できませんでした。' + (err && err.message ? '\n' + err.message : ''));
    }
  }

  // ---------- 元に戻す（アンドゥ：削除の取り消し） ----------
  // 削除時は「DBの行だけ削除・ストレージのファイルは保持」しておき、
  // Ctrl+Z（または「元に戻す」ボタン）で同じID・日時のまま行を入れ直して復元する。
  const UNDO_MAX = 20;          // 戻せる履歴の上限（これを超えた古い削除はファイルも片付ける）
  let undoStack = [];

  // 入れ直し用に、テーブルのカラムだけを取り出す（同じID・作成日時で復元＝パーマリンク維持）。
  function archiveInsertRecord(a) {
    if (!a) return null;
    return {
      id: a.id, created_at: a.created_at,
      owner_name: a.owner_name, title: a.title, description: a.description
    };
  }
  function itemInsertRecord(it) {
    return {
      id: it.id, archive_id: it.archive_id, created_at: it.created_at,
      image_path: it.image_path,
      dc_title: it.dc_title, dc_creator: it.dc_creator, dc_date: it.dc_date,
      dc_description: it.dc_description, dc_subject: it.dc_subject,
      dc_coverage: it.dc_coverage, dc_type: it.dc_type, dc_rights: it.dc_rights,
      custom: it.custom || {}
    };
  }

  function pushUndo(entry) {
    undoStack.push(entry);
    while (undoStack.length > UNDO_MAX) finalizeEntry(undoStack.shift());
  }
  // 戻せる範囲を超えた（＝もう取り消さない）削除のファイルを片付ける。失敗は無視。
  function finalizeEntry(entry) {
    if (!entry || !entry.paths || !entry.paths.length) return;
    try { sb.storage.from(BUCKET).remove(entry.paths); } catch (e) {}
  }

  async function undoLast() {
    if (!undoStack.length) { showToast('元に戻せる操作はありません'); return; }
    const entry = undoStack.pop();
    try {
      if (entry.kind === 'item') {
        const { error } = await sb.from('items').insert(entry.record);
        if (error) throw error;
        rememberItem(entry.record.id);
        if (state.currentArchive && state.currentArchive.id === entry.record.archive_id) {
          await refreshCurrentItems();
        } else {
          await loadGallery();
        }
      } else if (entry.kind === 'archive') {
        if (entry.archive) {
          const { error: eA } = await sb.from('archives').insert(entry.archive);
          if (eA) throw eA;
          rememberArchive(entry.archive.id);
        }
        if (entry.items && entry.items.length) {
          const { error: eI } = await sb.from('items').insert(entry.items);
          if (eI) throw eI;
          entry.items.forEach((r) => rememberItem(r.id));
        }
        await loadGallery();
      }
      showToast('元に戻しました');
    } catch (err) {
      console.error(err);
      undoStack.push(entry); // 失敗したら積み直して再試行できるように
      alert('元に戻せませんでした。' + (err && err.message ? '\n' + err.message : ''));
    }
  }

  // ---------- トースト（画面下の通知。削除時は「元に戻す」ボタン付き） ----------
  let toastEl = null;
  let toastTimer = null;
  function getToast() {
    if (toastEl) return toastEl;
    toastEl = h('div', { class: 'undo-toast', role: 'status', 'aria-live': 'polite', hidden: '' });
    document.body.appendChild(toastEl);
    return toastEl;
  }
  function hideToast() {
    if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
    if (toastEl) { toastEl.hidden = true; toastEl.replaceChildren(); }
  }
  function showToast(message) {
    const t = getToast();
    t.replaceChildren(h('span', { class: 'undo-toast-msg', text: message }));
    t.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 2600);
  }
  function showUndoToast(message) {
    const t = getToast();
    const btn = h('button', { type: 'button', class: 'undo-toast-btn', text: '元に戻す' });
    btn.addEventListener('click', () => { hideToast(); undoLast(); });
    t.replaceChildren(
      h('span', { class: 'undo-toast-msg', text: message }),
      btn,
      h('span', { class: 'undo-toast-hint', text: 'Ctrl+Z' })
    );
    t.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 8000);
  }

  // ---------- 右クリック（コンテキストメニュー） ----------
  let ctxMenu = null;
  function getCtxMenu() {
    if (ctxMenu) return ctxMenu;
    ctxMenu = h('div', { class: 'ctx-menu', hidden: '' });
    document.body.appendChild(ctxMenu);
    return ctxMenu;
  }
  function hideCtxMenu() {
    if (ctxMenu) { ctxMenu.hidden = true; ctxMenu.replaceChildren(); }
  }
  // actions: [{ label, danger, run }]
  function showCtxMenu(x, y, actions) {
    const menu = getCtxMenu();
    const nodes = actions.map((a) => {
      const item = h('button', {
        type: 'button',
        class: 'ctx-item' + (a.danger ? ' danger' : ''),
        text: a.label
      });
      item.addEventListener('click', () => { hideCtxMenu(); a.run(); });
      return item;
    });
    menu.replaceChildren.apply(menu, nodes);
    menu.hidden = false;
    // 画面端で切れないように位置を調整
    const mw = menu.offsetWidth || 200;
    const mh = menu.offsetHeight || 48;
    const px = Math.min(x, window.innerWidth - mw - 8);
    const py = Math.min(y, window.innerHeight - mh - 8);
    menu.style.left = Math.max(8, px) + 'px';
    menu.style.top = Math.max(8, py) + 'px';
  }

  // ---------- イベント ----------
  function bindEvents() {
    el.newArchiveBtn.addEventListener('click', () => {
      clearNotice();
      el.archiveForm.reset();
      showView('create');
      window.scrollTo(0, 0);
    });

    document.querySelectorAll('[data-back]').forEach((node) => {
      node.addEventListener('click', (e) => {
        e.preventDefault();
        if (parseHash().a) {
          setHash('');           // 詳細 → 一覧（route が再読み込み）
        } else {
          showView('gallery');   // 作成フォーム → 一覧（ハッシュは元々空）
          loadGallery();
        }
        window.scrollTo(0, 0);
      });
    });

    el.archiveForm.addEventListener('submit', createArchive);

    el.archiveGrid.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      if (card) setHash(card.getAttribute('data-id'));
    });

    el.itemGrid.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      if (card && state.currentArchive) setHash(state.currentArchive.id, card.getAttribute('data-id'));
    });

    // 一覧カードを右クリック → そのアーカイブを削除
    el.archiveGrid.addEventListener('contextmenu', (e) => {
      const card = e.target.closest('[data-id]');
      if (!card) return;
      e.preventDefault();
      const id = card.getAttribute('data-id');
      const a = state.archives.find((x) => x.id === id);
      showCtxMenu(e.clientX, e.clientY, [
        { label: '🗑 このアーカイブを削除', danger: true, run: () => deleteArchiveById(id, a && a.title) }
      ]);
    });

    // 資料カードを右クリック → その資料を削除
    el.itemGrid.addEventListener('contextmenu', (e) => {
      const card = e.target.closest('[data-id]');
      if (!card) return;
      e.preventDefault();
      const id = card.getAttribute('data-id');
      const it = state.items.find((x) => x.id === id);
      if (!it) return;
      showCtxMenu(e.clientX, e.clientY, [
        { label: '🗑 この資料を削除', danger: true, run: () => deleteItem(it) }
      ]);
    });

    // メニュー以外を触ったら閉じる
    document.addEventListener('click', (e) => {
      if (ctxMenu && !ctxMenu.hidden && !ctxMenu.contains(e.target)) hideCtxMenu();
    });
    window.addEventListener('scroll', hideCtxMenu, true);
    window.addEventListener('resize', hideCtxMenu);

    el.subjectFilters.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-subject]');
      if (!chip) return;
      const s = chip.getAttribute('data-subject');
      state.subject = state.subject === s ? null : s;
      renderSubjects();
      renderItems();
    });

    el.itemSearch.addEventListener('input', () => {
      state.search = el.itemSearch.value.trim();
      renderItems();
    });

    el.addItemBtn.addEventListener('click', openAddItem);
    el.deleteArchiveBtn.addEventListener('click', deleteArchive);
    el.itemForm.addEventListener('submit', addItem);
    el.addCustomField.addEventListener('click', () => addCustomFieldRow());

    el.itemImage.addEventListener('change', () => {
      const file = el.itemImage.files && el.itemImage.files[0];
      if (!file) return;
      const mt = fileMediaType(file);
      if (mt !== 'image' && file.size > MAX_FILE_BYTES) {
        alert('ファイルが大きすぎます（目安 50MB まで）。短い動画・音声に変えるか、Supabaseの上限設定を上げてください。');
        el.itemImage.value = '';
        return;
      }
      selectedFile = file;
      if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
      el.itemPreview.replaceChildren();
      if (mt === 'image') {
        previewUrl = URL.createObjectURL(file);
        el.itemPreview.appendChild(h('img', { class: 'upload-preview-img', src: previewUrl, alt: '' }));
      } else if (mt === 'video') {
        previewUrl = URL.createObjectURL(file);
        el.itemPreview.appendChild(h('video', { class: 'upload-preview-img', src: previewUrl, controls: '' }));
      } else if (mt === 'audio') {
        previewUrl = URL.createObjectURL(file);
        el.itemPreview.appendChild(h('audio', { class: 'upload-preview-audio', src: previewUrl, controls: '' }));
      } else {
        el.itemPreview.appendChild(h('p', { class: 'upload-file-name', text: '選択中：' + file.name }));
      }
      el.itemPreview.hidden = false;
      // 資源タイプ(dc:type)を自動で選んでおく（後から変更可）
      const sel = el.itemForm.elements['dc_type'];
      if (sel) sel.value = dcTypeFor(mt);
    });

    document.querySelectorAll('[data-close-add]').forEach((n) =>
      n.addEventListener('click', () => closeModal(el.addItemModal)));
    document.querySelectorAll('[data-close-item]').forEach((n) =>
      n.addEventListener('click', closeItemModalNav));

    el.addItemModal.addEventListener('click', (e) => { if (e.target === el.addItemModal) closeModal(el.addItemModal); });
    el.itemModal.addEventListener('click', (e) => { if (e.target === el.itemModal) closeItemModalNav(); });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      hideCtxMenu();
      if (!el.addItemModal.hidden) closeModal(el.addItemModal);
      if (!el.itemModal.hidden) closeItemModalNav();
    });

    // Ctrl+Z（Mac は ⌘+Z）で直前の削除を元に戻す。
    document.addEventListener('keydown', (e) => {
      const isUndo = (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'z' || e.key === 'Z');
      if (!isUndo) return;
      // テキスト入力中は通常の文字アンドゥを優先（フォーム編集を邪魔しない）
      const t = e.target;
      const tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
      if (!undoStack.length) return;
      e.preventDefault();
      undoLast();
    });
  }

  // ---------- 初期化 ----------
  function init() {
    el = {
      notice: $('notice'),
      galleryView: $('galleryView'), createView: $('createView'), detailView: $('detailView'),
      newArchiveBtn: $('newArchiveBtn'), archiveGrid: $('archiveGrid'),
      galleryEmpty: $('galleryEmpty'), galleryLoading: $('galleryLoading'),
      archiveForm: $('archiveForm'),
      detailTitle: $('detailTitle'), detailMeta: $('detailMeta'), detailDesc: $('detailDesc'),
      detailOwnerActions: $('detailOwnerActions'), addItemBtn: $('addItemBtn'), deleteArchiveBtn: $('deleteArchiveBtn'),
      archivePermalink: $('archivePermalink'),
      itemSearch: $('itemSearch'), subjectFilters: $('subjectFilters'),
      itemGrid: $('itemGrid'), detailEmpty: $('detailEmpty'),
      addItemModal: $('addItemModal'), itemForm: $('itemForm'),
      itemImage: $('itemImage'), itemPreview: $('itemPreview'),
      customFields: $('customFields'), addCustomField: $('addCustomField'), itemSubmitBtn: $('itemSubmitBtn'),
      itemModal: $('itemModal'), itemModalBody: $('itemModalBody'), itemModalActions: $('itemModalActions')
    };

    bindEvents();

    if (!window.supabase || !window.supabase.createClient) {
      el.galleryLoading.hidden = true;
      el.newArchiveBtn.disabled = true;
      setNotice([
        h('h3', { text: 'ライブラリを読み込めませんでした' }),
        h('p', { text: 'インターネット接続を確認し、ページを再読み込みしてください。' })
      ], 'error');
      return;
    }

    if (!configured()) {
      el.galleryLoading.hidden = true;
      el.newArchiveBtn.disabled = true;
      setNotice([
        h('h3', { text: 'Supabase に未接続です（準備中）' }),
        h('p', { text: '共有アーカイブを使うには、次の設定が必要です。' }),
        h('ol', {}, [
          h('li', { text: 'Supabase でプロジェクトを作成' }),
          h('li', {}, ['同梱の ', h('code', { text: 'supabase-setup.sql' }), ' を SQL Editor で実行（テーブル・ポリシー・バケット作成）']),
          h('li', {}, [h('code', { text: 'archive-config.js' }), ' に Project URL と anon キーを記入'])
        ])
      ], 'warn');
      return;
    }

    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    window.addEventListener('hashchange', route); // 戻る/進む・リンク貼り付けに対応
    route();                                       // 初期表示（ハッシュがあればそこへ直接ジャンプ）
  }

  init();
})();
