// === アーカイブ横断検索（ジャパンサーチ風ポータル） ===
// 全員が作った全アーカイブの資料を、まとめて検索する。
// ・検索対象：ダブリンコア各項目＋自由項目＋アーカイブ名／作成者名
// ・並び：キーワードあり＝一致度（関連度）順、なし＝新しい順
// ・絞り込み：メディア種別（写真／動画／音声／テキスト）
// 表示は DOM 構築（textContent）で行い、ユーザー入力由来の XSS を回避する。
(function () {
  'use strict';

  const cfg = window.ARCHIVE_CONFIG || {};
  const BUCKET = cfg.BUCKET || 'archive-images';

  const TYPE_ICON = { image: '🖼️', video: '🎬', audio: '🎵', text: '📄', file: '📎' };
  const TYPE_LABEL = { image: '写真', video: '動画', audio: '音声', text: 'テキスト', file: 'その他' };
  const MEDIA_ORDER = ['image', 'video', 'audio', 'text'];

  let sb = null;
  const state = { items: [], query: '', media: null };

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

  function publicUrl(path) {
    if (!path || !sb) return null;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  function mediaTypeOf(path) {
    if (!path) return 'file';
    const ext = (path.split('.').pop() || '').toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif', 'heic', 'heif'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov', 'm4v', 'ogv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'm4a', 'aac', 'ogg', 'oga', 'opus', 'weba', 'flac'].includes(ext)) return 'audio';
    if (['txt', 'md', 'csv', 'tsv', 'json', 'log', 'rtf', 'xml', 'html', 'htm'].includes(ext)) return 'text';
    return 'file';
  }

  function setNotice(children, type) {
    el.notice.replaceChildren.apply(el.notice, children);
    el.notice.className = 'archive-notice' + (type ? ' ' + type : '');
    el.notice.hidden = false;
  }

  // 検索用テキスト（小文字化してまとめる）
  function buildHaystack(it, archive) {
    const parts = [
      it.dc_title, it.dc_creator, it.dc_date, it.dc_description,
      it.dc_subject, it.dc_coverage, it.dc_type, it.dc_rights
    ];
    if (it.custom && typeof it.custom === 'object') {
      Object.keys(it.custom).forEach((k) => { parts.push(k); parts.push(it.custom[k]); });
    }
    if (archive) { parts.push(archive.title); parts.push(archive.owner_name); }
    return parts.filter(Boolean).join('  ').toLowerCase();
  }

  // ---------- データ読み込み ----------
  async function loadAll() {
    el.loading.hidden = false;
    try {
      const { data: archives, error: e1 } = await sb
        .from('archives').select('id, title, owner_name');
      if (e1) throw e1;
      const byId = {};
      (archives || []).forEach((a) => { byId[a.id] = a; });

      const { data: items, error: e2 } = await sb
        .from('items').select('*').order('created_at', { ascending: false });
      if (e2) throw e2;

      state.items = (items || []).map((it) => {
        const archive = byId[it.archive_id] || null;
        it._archive = archive;
        it._mt = mediaTypeOf(it.image_path);
        it._title = (it.dc_title || '').toLowerCase();
        it._hay = buildHaystack(it, archive);
        return it;
      });
      render();
    } catch (err) {
      console.error(err);
      setNotice([
        h('h3', { text: 'データを読み込めませんでした' }),
        h('p', { text: 'インターネット接続や Supabase の設定を確認し、ページを再読み込みしてください。' })
      ], 'error');
    } finally {
      el.loading.hidden = true;
    }
  }

  // ---------- 検索・採点 ----------
  function terms() {
    return state.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  }

  // AND 一致（すべての語を含む）。スコア＝出現回数の合計（タイトル一致は重み2）。
  function scoreItem(it, ts) {
    let score = 0;
    for (let i = 0; i < ts.length; i++) {
      const t = ts[i];
      const inHay = it._hay.split(t).length - 1;
      if (inHay === 0) return -1; // 1語でも無ければ除外
      const inTitle = it._title.split(t).length - 1;
      score += inHay + inTitle * 2;
    }
    return score;
  }

  function cmpNewest(a, b) {
    return new Date(b.created_at) - new Date(a.created_at);
  }

  // ---------- 描画 ----------
  function render() {
    const ts = terms();

    // 1) キーワードで絞り込み（メディアは未適用）＋スコア
    const scored = [];
    state.items.forEach((it) => {
      let sc = 0;
      if (ts.length) { sc = scoreItem(it, ts); if (sc < 0) return; }
      scored.push({ it: it, sc: sc });
    });

    // 2) メディア種別フィルタ（チップ＋件数）
    renderFacets(scored);

    // 3) メディアで絞り込み
    let list = scored;
    if (state.media) list = list.filter((x) => x.it._mt === state.media);

    // 4) 並び替え
    if (ts.length) list.sort((a, b) => (b.sc - a.sc) || cmpNewest(a.it, b.it));
    else list.sort((a, b) => cmpNewest(a.it, b.it));

    renderResults(list.map((x) => x.it), ts);
  }

  function facetChip(value, label, count, active) {
    const btn = h('button', {
      type: 'button',
      class: 'subject-chip' + (active ? ' active' : ''),
      'data-media': value == null ? '' : value
    }, [label]);
    btn.appendChild(h('span', { class: 'chip-count', text: '(' + count + ')' }));
    return btn;
  }

  function renderFacets(scored) {
    if (!state.items.length) { el.mediaFilters.replaceChildren(); return; }
    const counts = { image: 0, video: 0, audio: 0, text: 0, file: 0 };
    scored.forEach((x) => { counts[x.it._mt] = (counts[x.it._mt] || 0) + 1; });
    const chips = [facetChip(null, 'すべて', scored.length, state.media == null)];
    MEDIA_ORDER.forEach((m) => chips.push(facetChip(m, TYPE_LABEL[m], counts[m] || 0, state.media === m)));
    if (counts.file) chips.push(facetChip('file', TYPE_LABEL.file, counts.file, state.media === 'file'));
    el.mediaFilters.replaceChildren.apply(el.mediaFilters, chips);
  }

  function resultCard(it) {
    const url = publicUrl(it.image_path);
    const thumb = (it._mt === 'image' && url)
      ? h('img', { class: 'item-thumb', src: url, alt: '', loading: 'lazy' })
      : h('div', { class: 'item-thumb placeholder', text: TYPE_ICON[it._mt] || '📎' });
    const sub = [it.dc_creator, it.dc_date].filter(Boolean).join(' ／ ');
    const provText = '🗂️ ' + (it._archive ? it._archive.title : '（不明なアーカイブ）')
      + (it._archive && it._archive.owner_name ? '／' + it._archive.owner_name : '');
    const body = h('div', { class: 'item-card-body' }, [
      h('p', { class: 'item-card-title', text: it.dc_title || '（無題）' }),
      sub ? h('p', { class: 'item-card-sub', text: sub }) : null,
      h('span', { class: 'provider-badge', text: provText, title: provText })
    ]);
    // クリックで、その資料のアーカイブ画面（資料詳細）へ直接ジャンプ（既存のパーマリンクを利用）
    return h('a', {
      class: 'item-card',
      href: 'archive.html#a=' + it.archive_id + '&i=' + it.id
    }, [thumb, body]);
  }

  function renderResults(items, ts) {
    if (!items.length) {
      el.resultGrid.replaceChildren();
      el.summary.hidden = true;
      el.empty.hidden = false;
      if (!state.items.length) {
        el.empty.textContent = 'まだ公開された資料がありません。アーカイブに資料が登録されると、ここで横断検索できます。';
      } else if (ts.length) {
        el.empty.textContent = '「' + state.query.trim() + '」に一致する資料は見つかりませんでした。別のキーワードをお試しください。';
      } else {
        el.empty.textContent = '該当する資料がありません。';
      }
      return;
    }
    el.empty.hidden = true;
    el.summary.hidden = false;
    el.summary.textContent = ts.length
      ? '「' + state.query.trim() + '」の検索結果：' + items.length + '件（一致度の高い順）'
      : '全 ' + items.length + ' 件（新しい順）';
    el.resultGrid.replaceChildren.apply(el.resultGrid, items.map(resultCard));
  }

  // ---------- URLハッシュ同期（検索を共有・ブックマーク可能に） ----------
  function readHash() {
    const raw = (location.hash || '').replace(/^#/, '');
    const out = {};
    raw.split('&').forEach((kv) => {
      const i = kv.indexOf('=');
      if (i < 0) return;
      out[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
    });
    return out;
  }
  function writeHash() {
    const parts = [];
    if (state.query.trim()) parts.push('q=' + encodeURIComponent(state.query.trim()));
    if (state.media) parts.push('m=' + state.media);
    const next = parts.join('&');
    history.replaceState(null, '', location.pathname + location.search + (next ? '#' + next : ''));
  }

  // ---------- イベント ----------
  function bindEvents() {
    let timer = null;
    el.q.addEventListener('input', () => {
      state.query = el.q.value;
      clearTimeout(timer);
      timer = setTimeout(() => { writeHash(); render(); }, 200);
    });

    el.mediaFilters.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-media]');
      if (!chip) return;
      const v = chip.getAttribute('data-media') || null;
      state.media = (state.media === v) ? null : v; // 同じものを再クリックで解除
      writeHash();
      render();
    });
  }

  // ---------- 初期化 ----------
  function init() {
    el = {
      notice: $('notice'),
      q: $('q'),
      mediaFilters: $('mediaFilters'),
      summary: $('summary'),
      resultGrid: $('resultGrid'),
      empty: $('emptyState'),
      loading: $('loading')
    };

    bindEvents();

    if (!window.supabase || !window.supabase.createClient) {
      el.loading.hidden = true;
      setNotice([
        h('h3', { text: 'ライブラリを読み込めませんでした' }),
        h('p', { text: 'インターネット接続を確認し、ページを再読み込みしてください。' })
      ], 'error');
      return;
    }
    if (!configured()) {
      el.loading.hidden = true;
      setNotice([
        h('h3', { text: 'Supabase に未接続です' }),
        h('p', { text: 'archive-config.js に Project URL と anon キーを設定してください。' })
      ], 'warn');
      return;
    }

    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

    // ハッシュから初期状態を復元（共有リンク対応）
    const hs = readHash();
    state.query = hs.q || '';
    state.media = hs.m || null;
    el.q.value = state.query;

    loadAll();
  }

  init();
})();
