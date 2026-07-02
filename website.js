const SAMPLE_HTML = {
  blank: '',
  minimal: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ページのタイトル</title>
</head>
<body>
  <h1>見出し</h1>
  <p>本文です。</p>
</body>
</html>`,
  homepage: `<header>
  <h1>大学図書館ガイド</h1>
  <p>学習と研究を支えるサービスを紹介します。</p>
</header>

<main>
  <section>
    <h2>利用できるサービス</h2>
    <ul>
      <li>資料検索と貸出</li>
      <li>レポート作成の相談</li>
      <li>電子ジャーナルの利用</li>
    </ul>
  </section>

  <section>
    <h2>開館時間</h2>
    <p>平日 9:00-20:00 ／ 土曜 10:00-17:00</p>
  </section>
</main>

<footer>
  <p>図書館情報技術論 サンプルページ</p>
</footer>`
};

const CSS_PRESETS = {
  plain: {
    label: '基本',
    canvas: '#ffffff',
    surface: '#ffffff',
    text: '#263241',
    muted: '#58677a',
    accent: '#166088',
    border: '#d7e2ea',
    shadow: 'none',
    maxWidth: 'none',
    settings: { fontSize: 16, lineHeight: 1.6, space: 24, radius: 8, border: 1 },
    extra: `
.preview-page h1,
.preview-page h2 {
  color: #166088;
}
.preview-page a {
  color: #166088;
  font-weight: 700;
}`
  },
  card: {
    label: 'カード',
    canvas: '#eef6f8',
    surface: '#ffffff',
    text: '#24313d',
    muted: '#5e6a75',
    accent: '#c2410c',
    border: '#f2b37a',
    shadow: '0 18px 45px rgba(30, 64, 86, 0.16)',
    maxWidth: '820px',
    settings: { fontSize: 17, lineHeight: 1.65, space: 32, radius: 16, border: 2 },
    extra: `
.preview-page header,
.preview-page section,
.preview-page footer {
  background: #fffaf5;
  border: 1px solid #f3d4b3;
  border-radius: 12px;
  padding: 1rem;
}
.preview-page h1,
.preview-page h2 {
  color: #9a3412;
}
.preview-page a {
  color: #0f766e;
  font-weight: 800;
}`
  },
  article: {
    label: '記事',
    canvas: '#f6f3ea',
    surface: '#fffdf7',
    text: '#243129',
    muted: '#687168',
    accent: '#216e4e',
    border: '#d7c9aa',
    shadow: '0 8px 24px rgba(70, 59, 38, 0.08)',
    maxWidth: '760px',
    settings: { fontSize: 18, lineHeight: 1.8, space: 38, radius: 4, border: 1 },
    extra: `
.preview-page h1 {
  border-bottom: 3px solid #216e4e;
  padding-bottom: 0.35rem;
}
.preview-page h2 {
  color: #216e4e;
}
.preview-page p {
  max-width: 42rem;
}
.preview-page a {
  color: #8a5a00;
  text-underline-offset: 0.18em;
}`
  }
};

const TEACHER_SAMPLE_HTML = `<article class="demo-page">
  <header class="site-hero">
    <p class="label">HTML5 sample</p>
    <h1>お知らせパネル</h1>
    <p>HTML5は、見出し・本文・フォーム・ボタンなど、ページの部品と構造を表します。</p>
  </header>

  <main>
    <section class="message-panel" id="messagePanel">
      <h2 id="noticeTitle">図書館からのお知らせ</h2>
      <p>ボタンや入力欄はHTMLで置かれています。JavaScriptが有効なときだけ、操作に反応して内容が変わります。</p>
      <button id="toggleDetail" type="button">詳しい説明を表示</button>
      <p id="detailText" hidden>詳細テキストが表示されました。これはJavaScriptがHTMLの表示状態を書き換えた結果です。</p>
      <label>見出しに入れる言葉
        <input id="titleInput" type="text" placeholder="例: 開館時間">
      </label>
      <p id="liveMessage">入力すると、この下の説明ではなく見出しそのものが変化します。</p>
    </section>
  </main>

  <footer>
    <p>CSSを外すと見た目の指定が消え、JavaScriptを外すとボタンや入力への反応が止まります。</p>
  </footer>
</article>`;

const TEACHER_SAMPLE_CSS = `
body {
  margin: 0;
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;
  color: #263241;
  font-family: -apple-system, "Hiragino Sans", "Yu Gothic", sans-serif;
}
.demo-page {
  max-width: 720px;
  margin: 0 auto;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #d7e2ea;
  border-radius: 10px;
}
.site-hero {
  padding: 28px;
  color: #ffffff;
  background: #166088;
}
.label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}
h1,
h2 {
  margin-top: 0;
}
main {
  padding: 24px;
}
.message-panel {
  padding: 18px;
  border: 1px solid #d7e2ea;
  border-radius: 8px;
  background: #f8fbff;
}
.message-panel[data-state="open"] {
  background: #fffaf0;
  border-color: #f2b37a;
}
.message-panel h2 {
  color: #166088;
}
.message-panel[data-state="open"] h2 {
  color: #c2410c;
}
button {
  min-height: 42px;
  padding: 0 16px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  background: #166088;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}
button:hover {
  background: #0f4d6f;
}
label {
  display: block;
  margin-top: 16px;
  font-weight: 700;
}
input {
  display: block;
  width: 100%;
  min-height: 40px;
  margin-top: 6px;
  padding: 8px 10px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font: inherit;
}
#detailText {
  padding: 12px;
  border-left: 4px solid #c2410c;
  background: #fff8ed;
}
footer {
  padding: 18px 24px;
  background: #f3f7fa;
  color: #58677a;
}`;

const TEACHER_SAMPLE_JS = `
const messagePanel = document.getElementById('messagePanel');
const toggleDetail = document.getElementById('toggleDetail');
const detailText = document.getElementById('detailText');
const titleInput = document.getElementById('titleInput');
const noticeTitle = document.getElementById('noticeTitle');
const liveMessage = document.getElementById('liveMessage');

let detailOpen = false;

toggleDetail.addEventListener('click', () => {
  detailOpen = !detailOpen;
  detailText.hidden = !detailOpen;
  messagePanel.dataset.state = detailOpen ? 'open' : 'closed';
  toggleDetail.textContent = detailOpen ? '詳しい説明を隠す' : '詳しい説明を表示';
  liveMessage.textContent = detailOpen
    ? 'ボタン操作で詳細テキストと色が変わりました。'
    : 'ボタン操作で詳細テキストを隠しました。';
});

titleInput.addEventListener('input', () => {
  const value = titleInput.value.trim();
  noticeTitle.textContent = value ? value + 'のお知らせ' : '図書館からのお知らせ';
  liveMessage.textContent = value
    ? '入力内容を使って見出しを書き換えています。'
    : '入力すると、この下の説明ではなく見出しそのものが変化します。';
});
`;

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

const htmlInput = document.getElementById('htmlInput');
const previewFrame = document.getElementById('previewFrame');
const tagBreakdown = document.getElementById('tagBreakdown');
const sampleSelect = document.getElementById('sampleSelect');
const insertSampleButton = document.getElementById('insertSample');
const resetButton = document.getElementById('resetPage');
const inlineColor = document.getElementById('inlineColor');
const inlineSize = document.getElementById('inlineSize');
const cssReadout = document.getElementById('cssReadout');
const presetButtons = Array.from(document.querySelectorAll('.css-preset'));
const websiteTabButtons = Array.from(document.querySelectorAll('[data-website-tab]'));
const websiteActivities = Array.from(document.querySelectorAll('.website-activity'));
const teacherCssToggle = document.getElementById('teacherCssToggle');
const teacherJsToggle = document.getElementById('teacherJsToggle');
const teacherFrame = document.getElementById('teacherFrame');
const teacherState = document.getElementById('teacherState');
const teacherHtmlCode = document.getElementById('teacherHtmlCode');

const cssControls = {
  fontSize: document.getElementById('fontSizeControl'),
  lineHeight: document.getElementById('lineHeightControl'),
  space: document.getElementById('spaceControl'),
  radius: document.getElementById('radiusControl'),
  border: document.getElementById('borderControl')
};

const cssValueLabels = {
  fontSize: document.getElementById('fontSizeValue'),
  lineHeight: document.getElementById('lineHeightValue'),
  space: document.getElementById('spaceValue'),
  radius: document.getElementById('radiusValue'),
  border: document.getElementById('borderValue')
};

let currentPreset = 'plain';

function getCssSettings() {
  return {
    fontSize: Number(cssControls.fontSize.value),
    lineHeight: Number(cssControls.lineHeight.value),
    space: Number(cssControls.space.value),
    radius: Number(cssControls.radius.value),
    border: Number(cssControls.border.value)
  };
}

function setCssSettings(settings) {
  Object.entries(settings).forEach(([key, value]) => {
    cssControls[key].value = value;
  });
}

function updateCssLabels(settings) {
  cssValueLabels.fontSize.textContent = `${settings.fontSize}px`;
  cssValueLabels.lineHeight.textContent = settings.lineHeight.toFixed(1);
  cssValueLabels.space.textContent = `${settings.space}px`;
  cssValueLabels.radius.textContent = `${settings.radius}px`;
  cssValueLabels.border.textContent = `${settings.border}px`;
}

function buildPreviewCss(settings, preset) {
  return `
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  min-height: 100vh;
  padding: 22px;
  background: ${preset.canvas};
  color: ${preset.text};
  font-family: -apple-system, "Hiragino Sans", "Yu Gothic", sans-serif;
}
.preview-page {
  width: 100%;
  max-width: ${preset.maxWidth};
  min-height: calc(100vh - 44px);
  margin: 0 auto;
  padding: ${settings.space}px;
  color: ${preset.text};
  background: ${preset.surface};
  border: ${settings.border}px solid ${preset.border};
  border-radius: ${settings.radius}px;
  box-shadow: ${preset.shadow};
  font-size: ${settings.fontSize}px;
  line-height: ${settings.lineHeight};
}
.preview-page > *:first-child {
  margin-top: 0;
}
.preview-page > *:last-child {
  margin-bottom: 0;
}
.preview-page h1 {
  margin: 0 0 0.75em;
  font-size: 2em;
  line-height: 1.2;
}
.preview-page h2 {
  margin: 1.35em 0 0.55em;
  font-size: 1.35em;
  line-height: 1.3;
}
.preview-page p,
.preview-page ul,
.preview-page ol {
  margin: 0.75em 0;
}
.preview-page li + li {
  margin-top: 0.35em;
}
.preview-page img {
  display: block;
  width: 100%;
  max-width: 560px;
  height: auto;
  margin: 1rem 0;
  border-radius: max(4px, ${settings.radius}px);
  border: ${Math.max(0, settings.border)}px solid ${preset.border};
}
.preview-page header,
.preview-page main,
.preview-page section,
.preview-page footer {
  margin: 0 0 1rem;
}
.preview-empty {
  display: grid;
  min-height: 220px;
  place-items: center;
  color: ${preset.muted};
  border: 1px dashed ${preset.border};
  border-radius: ${settings.radius}px;
}
${preset.extra}`;
}

function buildCssReadout(settings, preset) {
  return `.preview-page {
  font-size: ${settings.fontSize}px;
  line-height: ${settings.lineHeight};
  padding: ${settings.space}px;
  border-radius: ${settings.radius}px;
  border: ${settings.border}px solid ${preset.border};
  color: ${preset.text};
  background: ${preset.surface};
}`;
}

function getPreviewContent(source) {
  if (!source.trim()) {
    return '<div class="preview-empty">HTMLを入力すると表示されます</div>';
  }

  if (/<\/?\s*(html|head|body)\b/i.test(source)) {
    const documentContent = new DOMParser().parseFromString(source, 'text/html');
    return documentContent.body.innerHTML.trim() || '<div class="preview-empty">bodyタグの中身が表示されます</div>';
  }

  return source;
}

function renderPreview() {
  const settings = getCssSettings();
  const preset = CSS_PRESETS[currentPreset];
  const css = buildPreviewCss(settings, preset);
  const content = getPreviewContent(htmlInput.value);

  previewFrame.srcdoc = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${css}</style>
</head>
<body>
<div class="preview-page">
${content}
</div>
</body>
</html>`;

  updateCssLabels(settings);
  cssReadout.textContent = buildCssReadout(settings, preset);
}

function createBreakdownRow(type, label, code, note) {
  const row = document.createElement('div');
  row.className = `breakdown-row ${type}`;

  const labelElement = document.createElement('span');
  labelElement.className = 'breakdown-label';
  labelElement.textContent = label;

  const codeElement = document.createElement('code');
  codeElement.textContent = code;

  const noteElement = document.createElement('span');
  noteElement.className = 'breakdown-note';
  noteElement.textContent = note;

  row.append(labelElement, codeElement, noteElement);
  return row;
}

function getAttributes(tagText, tagName) {
  const body = tagText
    .replace(/^<\s*\/?\s*[a-zA-Z][\w-]*/, '')
    .replace(/\/?\s*>$/, '')
    .trim();

  if (!body) {
    return [];
  }

  const attributes = [];
  const attrPattern = /([^\s=/>]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let match = attrPattern.exec(body);

  while (match) {
    const name = match[1];
    const rawValue = match[2] || '';
    const value = match[3] || match[4] || match[5] || '';
    if (name !== tagName && !name.startsWith('<')) {
      attributes.push({ name, rawValue, value });
    }
    match = attrPattern.exec(body);
  }

  return attributes;
}

function renderTagBreakdown() {
  tagBreakdown.innerHTML = '';
  const source = htmlInput.value;

  if (!source.trim()) {
    tagBreakdown.innerHTML = '<p class="empty-state">HTMLを入力すると、開始タグ・属性・内容・終了タグに分解して表示します。</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  const tokenPattern = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/?[a-zA-Z][\w-]*(?:\s+[^<>]*?)?\s*\/?>|[^<]+/gi;
  let match = tokenPattern.exec(source);
  let hasRows = false;

  while (match) {
    const token = match[0];

    if (/^<!doctype/i.test(token)) {
      fragment.append(createBreakdownRow('doctype', '宣言', token, 'この文書がHTMLとして書かれていることをブラウザに伝えます。'));
      hasRows = true;
    } else if (token.startsWith('<!--')) {
      fragment.append(createBreakdownRow('comment', 'コメント', token, '画面には表示されないメモです。'));
      hasRows = true;
    } else if (token.startsWith('</')) {
      const tagName = token.match(/^<\/\s*([a-zA-Z][\w-]*)/)?.[1]?.toLowerCase() || '';
      fragment.append(createBreakdownRow('end', '終了タグ', token, `${tagName} 要素の範囲を閉じます。`));
      hasRows = true;
    } else if (token.startsWith('<')) {
      const tagName = token.match(/^<\s*([a-zA-Z][\w-]*)/)?.[1]?.toLowerCase() || '';
      const isVoid = VOID_TAGS.has(tagName) || /\/\s*>$/.test(token);
      fragment.append(createBreakdownRow(
        isVoid ? 'void' : 'start',
        isVoid ? '空要素' : '開始タグ',
        token,
        isVoid ? `${tagName} は内容をはさまず、タグ自体で意味を持ちます。` : `${tagName} 要素の始まりを示します。`
      ));

      getAttributes(token, tagName).forEach((attribute) => {
        const attrCode = attribute.rawValue ? `${attribute.name}=${attribute.rawValue}` : attribute.name;
        const attrNote = attribute.value
          ? `${attribute.name} 属性の値は「${attribute.value}」です。`
          : `${attribute.name} 属性が指定されています。`;
        fragment.append(createBreakdownRow('attr', '属性', attrCode, attrNote));
      });
      hasRows = true;
    } else if (token.trim()) {
      const compactText = token.replace(/\s+/g, ' ').trim();
      fragment.append(createBreakdownRow('content', '内容', compactText, '開始タグと終了タグにはさまれて、ページに表示される部分です。'));
      hasRows = true;
    }

    match = tokenPattern.exec(source);
  }

  if (!hasRows) {
    tagBreakdown.innerHTML = '<p class="empty-state">分解できるHTMLタグがまだありません。</p>';
    return;
  }

  tagBreakdown.append(fragment);
}

function updateAll() {
  renderPreview();
  renderTagBreakdown();
}

function setSelection(start, end) {
  htmlInput.focus();
  htmlInput.setSelectionRange(start, end);
}

function insertText(text, selectStartOffset = text.length, selectEndOffset = text.length) {
  const start = htmlInput.selectionStart;
  const end = htmlInput.selectionEnd;
  const before = htmlInput.value.slice(0, start);
  const after = htmlInput.value.slice(end);

  htmlInput.value = `${before}${text}${after}`;
  setSelection(start + selectStartOffset, start + selectEndOffset);
  updateAll();
}

function insertWrapped(openTag, closeTag, fallbackText) {
  const start = htmlInput.selectionStart;
  const end = htmlInput.selectionEnd;
  const selected = htmlInput.value.slice(start, end) || fallbackText;
  const text = `${openTag}${selected}${closeTag}`;
  insertText(text, openTag.length, openTag.length + selected.length);
}

function insertBlock(block) {
  const start = htmlInput.selectionStart;
  const prefix = start > 0 && !htmlInput.value.slice(0, start).endsWith('\n') ? '\n' : '';
  insertText(`${prefix}${block}`, prefix.length + block.length, prefix.length + block.length);
}

function handleInsertCommand(command) {
  const commands = {
    heading: () => insertWrapped('<h1>', '</h1>', '見出し'),
    bold: () => insertWrapped('<strong>', '</strong>', '強調する文字'),
    unorderedList: () => insertBlock(`<ul>
  <li>項目1</li>
  <li>項目2</li>
</ul>`),
    orderedList: () => insertBlock(`<ol>
  <li>手順1</li>
  <li>手順2</li>
</ol>`),
    lineBreak: () => insertText('<br>\n'),
    color: () => insertWrapped(`<span style="color: ${inlineColor.value};">`, '</span>', '色を変える文字'),
    size: () => insertWrapped(`<span style="font-size: ${inlineSize.value}px;">`, '</span>', 'サイズを変える文字')
  };

  commands[command]?.();
}

function applyPreset(presetId) {
  currentPreset = presetId;
  const preset = CSS_PRESETS[currentPreset];
  setCssSettings(preset.settings);

  presetButtons.forEach((button) => {
    const active = button.dataset.preset === presetId;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  updateAll();
}

function showWebsiteTab(tabId) {
  websiteTabButtons.forEach((button) => {
    const active = button.dataset.websiteTab === tabId;
    button.classList.toggle('active', active);
  });

  websiteActivities.forEach((panel) => {
    panel.hidden = panel.id !== tabId;
  });

  if (tabId === 'roleLab') {
    renderTeacherDemo();
  }
}

function renderTeacherState(cssEnabled, jsEnabled) {
  const cssText = cssEnabled
    ? '有効: 色、余白、枠、まとまりのある表示が反映されています。'
    : '無効: HTMLの構造は残りますが、見た目はブラウザ標準に戻ります。';
  const jsText = jsEnabled
    ? '有効: ボタンや入力に反応して、ページ内の表示が更新されます。'
    : '無効: ボタンを押しても詳細表示は切り替わらず、入力しても見出しは更新されません。';

  teacherState.innerHTML = `
    <p><strong>CSS</strong> ${cssText}</p>
    <p><strong>JavaScript</strong> ${jsText}</p>
  `;
}

function renderTeacherDemo() {
  const cssEnabled = teacherCssToggle.checked;
  const jsEnabled = teacherJsToggle.checked;
  const cssBlock = cssEnabled ? `<style>${TEACHER_SAMPLE_CSS}</style>` : '';
  const jsBlock = jsEnabled ? `<script>${TEACHER_SAMPLE_JS}</script>` : '';

  teacherFrame.srcdoc = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${cssBlock}
</head>
<body>
${TEACHER_SAMPLE_HTML}
${jsBlock}
</body>
</html>`;

  renderTeacherState(cssEnabled, jsEnabled);
  teacherHtmlCode.textContent = TEACHER_SAMPLE_HTML;
}

document.querySelectorAll('[data-command]').forEach((button) => {
  button.addEventListener('click', () => {
    handleInsertCommand(button.dataset.command);
  });
});

presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyPreset(button.dataset.preset);
  });
});

websiteTabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showWebsiteTab(button.dataset.websiteTab);
  });
});

teacherCssToggle.addEventListener('change', renderTeacherDemo);
teacherJsToggle.addEventListener('change', renderTeacherDemo);

Object.values(cssControls).forEach((control) => {
  control.addEventListener('input', updateAll);
});

htmlInput.addEventListener('input', updateAll);

insertSampleButton.addEventListener('click', () => {
  if (htmlInput.value.trim() && !window.confirm('現在のHTMLをサンプルで置き換えますか？')) {
    return;
  }

  htmlInput.value = SAMPLE_HTML[sampleSelect.value] || '';
  htmlInput.focus();
  htmlInput.setSelectionRange(0, 0);
  htmlInput.scrollTop = 0;
  updateAll();
});

resetButton.addEventListener('click', () => {
  if (htmlInput.value.trim() && !window.confirm('HTMLとCSS設定を初期状態に戻しますか？')) {
    return;
  }

  htmlInput.value = '';
  sampleSelect.value = 'blank';
  inlineColor.value = '#166088';
  htmlInput.scrollTop = 0;
  applyPreset('plain');
});

setCssSettings(CSS_PRESETS.plain.settings);
updateAll();
renderTeacherDemo();
