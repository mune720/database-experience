// === サンプルアーカイブ作成ツール（管理用・受講生の参考用サンプルを1つ生成） ===
// 既存の archives / items テーブルと Storage バケットに、花のサンプルを登録する。
// 花の画像は canvas で描画（外部画像に依存せず、著作権の心配もなし）。
// 一度きりの利用を想定。作成後はこの archive-seed.html / archive-seed.js を削除して構わない。
(function () {
  'use strict';

  const cfg = window.ARCHIVE_CONFIG || {};
  const BUCKET = cfg.BUCKET || 'archive-images';
  const MINE_KEY = 'archive-mine-v1';
  const ARCHIVE_TITLE = '春から秋の花だより（サンプル）';
  const OWNER = '図書 花子（サンプル）';
  const DESC = 'これは「デジタルアーカイブ作成」の参考用サンプルです。'
    + 'タイトル・説明・主題（キーワード）・場所・権利などメタデータの記入例として参考にしてください。'
    + '各資料を開くと、ダブリンコアの各項目がどのように書かれているか確認できます。';

  let sb = null;
  const $ = (id) => document.getElementById(id);

  function line(msg, cls) {
    const p = document.createElement('p');
    p.textContent = msg;
    if (cls) p.className = cls;
    $('seedStatus').appendChild(p);
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  // ---- この端末を所有者として記録（後で通常画面の「削除」から消せる） ----
  function loadMine() {
    try { return JSON.parse(localStorage.getItem(MINE_KEY)) || { archives: [], items: [] }; }
    catch (e) { return { archives: [], items: [] }; }
  }
  function saveMine(m) { try { localStorage.setItem(MINE_KEY, JSON.stringify(m)); } catch (e) {} }
  function rememberArchive(id) { const m = loadMine(); if (!m.archives.includes(id)) { m.archives.push(id); saveMine(m); } }
  function rememberItem(id) { const m = loadMine(); if (!m.items.includes(id)) { m.items.push(id); saveMine(m); } }

  // ---------- 花の描画 ----------
  const FLOWERS = {
    sunflower:     { bg: ['#dff0ff', '#bfe0ff'], petalCount: 26, petalLen: 175, petalWid: 32, color: '#f6b600', center: '#7a4a1e', centerR: 95, dots: true },
    cosmos:        { bg: ['#fbeef6', '#f4d2e6'], petalCount: 8,  petalLen: 165, petalWid: 60, color: '#ec7fb0', center: '#f5c518', centerR: 46 },
    sakura:        { bg: ['#eef6ff', '#d9e9ff'], petalCount: 5,  petalLen: 150, petalWid: 72, color: '#f7b7c8', center: '#f3d35e', centerR: 24, notch: true, notchColor: '#e6f0ff' },
    marguerite:    { bg: ['#eafaf0', '#cfeede'], petalCount: 18, petalLen: 170, petalWid: 32, color: '#ffffff', center: '#f5c518', centerR: 58, stroke: '#e3e3e3' },
    gerbera:       { bg: ['#fff3e6', '#ffd6a8'], petalCount: 30, petalLen: 178, petalWid: 22, color: '#f5731f', center: '#5a3210', centerR: 60, dots: true },
    chrysanthemum: { bg: ['#fbe9f1', '#f1c4da'], petalCount: 30, petalLen: 168, petalWid: 26, color: '#d23b78', center: '#a82a5f', centerR: 46, layered: true }
  };

  function petalRing(ctx, cx, cy, o, scale, rot) {
    const n = o.petalCount;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (rot || 0);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a);
      const L = o.petalLen * scale, W = o.petalWid * scale;
      ctx.fillStyle = o.color;
      ctx.beginPath();
      ctx.ellipse(L * 0.58, 0, L * 0.5, W, 0, 0, Math.PI * 2);
      ctx.fill();
      if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = 2; ctx.stroke(); }
      if (o.notch) {
        ctx.fillStyle = o.notchColor || '#ffffff';
        ctx.beginPath();
        ctx.ellipse(L * 1.05, 0, L * 0.14, W * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function radialFlower(ctx, cx, cy, o) {
    if (o.layered) {
      petalRing(ctx, cx, cy, o, 1.0, 0);
      petalRing(ctx, cx, cy, o, 0.68, Math.PI / o.petalCount);
    } else {
      petalRing(ctx, cx, cy, o, 1.0, 0);
    }
    ctx.fillStyle = o.center;
    ctx.beginPath();
    ctx.arc(cx, cy, o.centerR, 0, Math.PI * 2);
    ctx.fill();
    if (o.dots) {
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      for (let i = 0; i < 70; i++) {
        const rr = Math.sqrt(Math.random()) * o.centerR * 0.86;
        const aa = Math.random() * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawLeaf(ctx, x, y, dir) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(dir * 0.55);
    ctx.fillStyle = '#5bb060';
    ctx.beginPath();
    ctx.ellipse(dir * 80, 0, 95, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dir * 150, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawScene(ctx, W, H, o) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, o.bg[0]);
    g.addColorStop(1, o.bg[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // 地面のほのかな影
    ctx.fillStyle = 'rgba(95,160,95,0.20)';
    ctx.beginPath();
    ctx.ellipse(W / 2, H * 1.05, W * 0.75, H * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    const cx = W / 2, cy = H * 0.43;
    // 茎
    ctx.strokeStyle = '#4a9a55';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy + o.centerR * 0.5);
    ctx.quadraticCurveTo(cx - 18, H * 0.78, cx - 4, H * 1.02);
    ctx.stroke();
    drawLeaf(ctx, cx - 6, H * 0.66, -1);
    drawLeaf(ctx, cx - 2, H * 0.8, 1);
    // 花の下のやわらかい影
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, o.petalLen * 0.95, o.petalLen * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    radialFlower(ctx, cx, cy, o);
  }

  function drawToBlob(key) {
    const W = 1200, H = 900;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    drawScene(c.getContext('2d'), W, H, FLOWERS[key]);
    return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.85));
  }

  // ---------- サンプルの資料（メタデータの記入例） ----------
  const ITEMS = [
    { flower: 'sakura', dc_title: '満開のソメイヨシノ', dc_creator: '図書 花子', dc_date: '2026-04-02',
      dc_description: '入学式のころに満開を迎えた桜並木。淡いピンクの花びらと青空のコントラストが美しい。',
      dc_subject: '桜, ソメイヨシノ, 春', dc_coverage: '東京都・〇〇公園の桜並木',
      dc_type: '静止画（写真）', dc_rights: '撮影者本人（CC BY 4.0）', custom: { '天気': '快晴' } },
    { flower: 'marguerite', dc_title: '庭先のマーガレット', dc_creator: '図書 花子', dc_date: '2026-05-18',
      dc_description: '自宅の庭で育てているマーガレット。白い花びらと黄色い中心が清楚な印象。',
      dc_subject: 'マーガレット, 白, 初夏, 庭', dc_coverage: '千葉県・自宅の庭',
      dc_type: '静止画（写真）', dc_rights: '撮影者本人（CC BY 4.0）' },
    { flower: 'gerbera', dc_title: 'オレンジ色のガーベラ', dc_creator: '図書 花子', dc_date: '2026-06-08',
      dc_description: '花屋で見つけた鮮やかなオレンジのガーベラ。明るい色合いが元気をくれる。',
      dc_subject: 'ガーベラ, オレンジ, 切り花', dc_coverage: '神奈川県・自宅',
      dc_type: '静止画（写真）', dc_rights: '撮影者本人（CC BY 4.0）', custom: { '入手先': '近所の花屋' } },
    { flower: 'sunflower', dc_title: '青空に咲くひまわり', dc_creator: '図書 花子', dc_date: '2026-08-05',
      dc_description: '夏の青空に向かって咲く一輪のひまわり。見上げる角度で大きさを強調した。',
      dc_subject: 'ひまわり, 夏, 黄色', dc_coverage: '北海道・〇〇町のひまわり畑',
      dc_type: '静止画（写真）', dc_rights: '撮影者本人（CC BY 4.0）', custom: { '天気': '晴れ' } },
    { flower: 'cosmos', dc_title: '秋風に揺れるコスモス', dc_creator: '図書 花子', dc_date: '2026-10-12',
      dc_description: '河川敷いっぱいに咲いたピンクのコスモス。秋の柔らかな光のもとで撮影した。',
      dc_subject: 'コスモス, 秋桜, 秋, ピンク', dc_coverage: '埼玉県・〇〇河川敷',
      dc_type: '静止画（写真）', dc_rights: '撮影者本人（CC BY 4.0）' },
    { flower: 'chrysanthemum', dc_title: '菊花展の大輪', dc_creator: '図書 花子', dc_date: '2026-11-03',
      dc_description: '地域の菊花展で展示されていた大輪の菊。幾重にも重なる花びらが見事だった。',
      dc_subject: '菊, 大輪, 秋, 菊花展', dc_coverage: '京都府・〇〇神社の菊花展',
      dc_type: '静止画（写真）', dc_rights: '撮影者本人（CC BY 4.0）' }
  ];

  function showLink(id) {
    const a = document.createElement('a');
    a.href = 'archive.html#a=' + id;
    a.textContent = '→ 作成したサンプルアーカイブを開く';
    a.className = 'open-link';
    const wrap = document.createElement('p');
    wrap.style.marginTop = '1rem';
    wrap.appendChild(a);
    $('seedStatus').appendChild(wrap);
  }

  async function seed() {
    const btn = $('seedBtn');
    btn.disabled = true;
    try {
      line('既存のサンプルを確認中…');
      const ex = await sb.from('archives').select('id').eq('title', ARCHIVE_TITLE).limit(1);
      if (ex.error) throw ex.error;
      if (ex.data && ex.data.length) {
        line('すでにサンプルアーカイブが存在します。重複作成は行いませんでした。', 'ok');
        showLink(ex.data[0].id);
        return;
      }

      line('アーカイブを作成中…');
      const ins = await sb.from('archives')
        .insert({ owner_name: OWNER, title: ARCHIVE_TITLE, description: DESC })
        .select().single();
      if (ins.error) throw ins.error;
      const arch = ins.data;
      rememberArchive(arch.id);

      let n = 0;
      for (const it of ITEMS) {
        n++;
        line('(' + n + '/' + ITEMS.length + ') 「' + it.dc_title + '」の画像を生成・アップロード中…');
        const blob = await drawToBlob(it.flower);
        const path = arch.id + '/' + uuid() + '.jpg';
        const up = await sb.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: false });
        if (up.error) throw up.error;
        const rec = {
          archive_id: arch.id,
          image_path: path,
          dc_title: it.dc_title,
          dc_creator: it.dc_creator || null,
          dc_date: it.dc_date || null,
          dc_description: it.dc_description || null,
          dc_subject: it.dc_subject || null,
          dc_coverage: it.dc_coverage || null,
          dc_type: it.dc_type || '静止画（写真）',
          dc_rights: it.dc_rights || null,
          custom: it.custom || {}
        };
        const ir = await sb.from('items').insert(rec).select().single();
        if (ir.error) throw ir.error;
        rememberItem(ir.data.id);
      }

      line('完了しました！受講生の参考用サンプルを作成しました。', 'ok');
      showLink(arch.id);
    } catch (err) {
      console.error(err);
      line('エラー: ' + (err && err.message ? err.message : String(err)), 'err');
      line('Supabase の設定（テーブル・ポリシー・バケット）と接続をご確認ください。');
    } finally {
      btn.disabled = false;
    }
  }

  function init() {
    if (!window.supabase || !window.supabase.createClient) {
      line('supabase-js を読み込めませんでした。インターネット接続を確認してください。', 'err');
      $('seedBtn').disabled = true;
      return;
    }
    const u = cfg.SUPABASE_URL || '', k = cfg.SUPABASE_ANON_KEY || '';
    if (!u || /YOUR-/.test(u) || !k || /YOUR-/.test(k)) {
      line('archive-config.js が未設定です。URL と キーを設定してください。', 'err');
      $('seedBtn').disabled = true;
      return;
    }
    sb = window.supabase.createClient(u, k);
    $('seedBtn').addEventListener('click', seed);
  }

  init();
})();
