// === データベース体験アプリ ===
// localStorageを使った簡易リレーショナルDBシミュレータ

const STORAGE_KEY = 'db-experience-v4';

const ID_PREFIX = {
  authors: 'AID',
  books: 'BID',
  holdings: 'HID',
  loans: 'LID'
};

const LOCATIONS = ['本館1階', '本館2階', '分館', '新着図書'];

const DEFAULT_AUTHORS = [
  { id: 1, name: '夏目漱石', kana: 'ナツメ ソウセキ', roman: 'Natsume Soseki', aliases: '夏目金之助', birth: 1867, death: 1916 },
  { id: 2, name: '森鷗外', kana: 'モリ オウガイ', roman: 'Mori Ogai', aliases: '森林太郎、森鴎外', birth: 1862, death: 1922 },
  { id: 3, name: '樋口一葉', kana: 'ヒグチ イチヨウ', roman: 'Higuchi Ichiyo', aliases: '樋口奈津', birth: 1872, death: 1896 },
  { id: 4, name: '宮沢賢治', kana: 'ミヤザワ ケンジ', roman: 'Miyazawa Kenji', aliases: '', birth: 1896, death: 1933 },
  { id: 5, name: '村上春樹', kana: 'ムラカミ ハルキ', roman: 'Murakami Haruki', aliases: '', birth: 1949, death: null },
  { id: 6, name: '村上龍', kana: 'ムラカミ リュウ', roman: 'Murakami Ryu', aliases: '村上龍之助', birth: 1952, death: null },
  { id: 7, name: '柳田國男', kana: 'ヤナギタ クニオ', roman: 'Yanagita Kunio', aliases: '柳田国男', birth: 1875, death: 1962 },
  { id: 8, name: '中根千枝', kana: 'ナカネ チエ', roman: 'Nakane Chie', aliases: '', birth: 1926, death: 2021 },
  { id: 9, name: 'チャールズ・ダーウィン', kana: 'チャールズ ダーウィン', roman: 'Charles Darwin', aliases: 'Charles Robert Darwin', birth: 1809, death: 1882 },
  { id: 10, name: 'マックス・ヴェーバー', kana: 'マックス ヴェーバー', roman: 'Max Weber', aliases: 'Maximilian Carl Emil Weber', birth: 1864, death: 1920 }
];

const DEFAULT_BOOKS = [
  { id: 1, title: '吾輩は猫である', authorId: 1, publisher: '大倉書店', year: 1905 },
  { id: 2, title: '舞姫', authorId: 2, publisher: '民友社', year: 1890 },
  { id: 3, title: 'たけくらべ', authorId: 3, publisher: '博文館', year: 1895 },
  { id: 4, title: '銀河鉄道の夜', authorId: 4, publisher: '文圃堂', year: 1934 },
  { id: 5, title: 'ノルウェイの森', authorId: 5, publisher: '講談社', year: 1987 },
  { id: 6, title: '限りなく透明に近いブルー', authorId: 6, publisher: '講談社', year: 1976 },
  { id: 7, title: '遠野物語', authorId: 7, publisher: '聚精堂', year: 1910 },
  { id: 8, title: 'タテ社会の人間関係', authorId: 8, publisher: '講談社', year: 1967 },
  { id: 9, title: '種の起源', authorId: 9, publisher: 'John Murray', year: 1859 },
  { id: 10, title: 'プロテスタンティズムの倫理と資本主義の精神', authorId: 10, publisher: 'Archiv fuer Sozialwissenschaft und Sozialpolitik', year: 1905 },
  { id: 11, title: 'こころ', authorId: 1, publisher: '岩波書店', year: 1914 },
  { id: 12, title: '山椒大夫', authorId: 2, publisher: '中央公論社', year: 1915 },
  { id: 13, title: '注文の多い料理店', authorId: 4, publisher: '杜陵出版部・東京光原社', year: 1924 },
  { id: 14, title: '海辺のカフカ', authorId: 5, publisher: '新潮社', year: 2002 },
  { id: 15, title: 'コインロッカー・ベイビーズ', authorId: 6, publisher: '講談社', year: 1980 }
];

const DEFAULT_HOLDINGS = [
  { id: 1, bookId: 1, location: '本館1階' },
  { id: 2, bookId: 2, location: '本館2階' },
  { id: 3, bookId: 3, location: '本館1階' },
  { id: 4, bookId: 4, location: '分館' },
  { id: 5, bookId: 5, location: '本館2階' },
  { id: 6, bookId: 6, location: '分館' },
  { id: 7, bookId: 7, location: '本館1階' },
  { id: 8, bookId: 8, location: '本館2階' },
  { id: 9, bookId: 9, location: '分館' },
  { id: 10, bookId: 10, location: '本館2階' },
  { id: 11, bookId: 11, location: '新着図書' },
  { id: 12, bookId: 12, location: '本館1階' },
  { id: 13, bookId: 13, location: '新着図書' },
  { id: 14, bookId: 14, location: '本館2階' },
  { id: 15, bookId: 15, location: '分館' },
  { id: 16, bookId: 1, location: '分館' },
  { id: 17, bookId: 4, location: '新着図書' },
  { id: 18, bookId: 5, location: '本館1階' },
  { id: 19, bookId: 9, location: '本館1階' },
  { id: 20, bookId: 14, location: '新着図書' }
];

const DEFAULT_USERS = [
  { studentNumber: 'AG20L001', category: '学生', faculty: '文学部', name: '佐藤花子' },
  { studentNumber: 'AG21I002', category: '学生', faculty: '情報学部', name: '鈴木一郎' },
  { studentNumber: 'AG22E003', category: '学生', faculty: '教育学部', name: '田中美咲' },
  { studentNumber: 'AG23A004', category: '学生', faculty: '芸術学部', name: '山本健太' },
  { studentNumber: 'AG24S005', category: '学生', faculty: '理学部', name: '高橋直子' },
  { studentNumber: 'AGT001', category: '教員', faculty: '文学部', name: '伊藤真理子' },
  { studentNumber: 'AGT002', category: '教員', faculty: '情報学部', name: '中村修' }
];

const db = {
  authors: [],
  books: [],
  holdings: [],
  users: [],
  loans: [],
  nextId: { authors: 1, books: 1, holdings: 1, users: 1, loans: 1 }
};

function createDefaultDb() {
  return {
    authors: cloneRecords(DEFAULT_AUTHORS),
    books: cloneRecords(DEFAULT_BOOKS),
    holdings: cloneRecords(DEFAULT_HOLDINGS),
    users: cloneRecords(DEFAULT_USERS),
    loans: [],
    nextId: {
      authors: DEFAULT_AUTHORS.length + 1,
      books: DEFAULT_BOOKS.length + 1,
      holdings: DEFAULT_HOLDINGS.length + 1,
      users: DEFAULT_USERS.length + 1,
      loans: 1
    }
  };
}

function cloneRecords(records) {
  return records.map(record => ({ ...record }));
}

function replaceDb(data) {
  db.authors = Array.isArray(data.authors) ? data.authors : [];
  db.books = Array.isArray(data.books) ? data.books : [];
  db.holdings = Array.isArray(data.holdings) ? data.holdings : holdingsFromBooks(db.books);
  db.users = Array.isArray(data.users) ? data.users : [];
  db.loans = Array.isArray(data.loans) ? data.loans : [];
  db.nextId = {
    authors: data.nextId?.authors || 1,
    books: data.nextId?.books || 1,
    holdings: data.nextId?.holdings || 1,
    users: data.nextId?.users || 1,
    loans: data.nextId?.loans || 1
  };
  normalizeDb();
}

function holdingsFromBooks(books) {
  return books.map((book, index) => ({
    id: index + 1,
    bookId: normalizeId(book.id),
    location: LOCATIONS[index % LOCATIONS.length]
  }));
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    resetToDefaults();
    save();
    return;
  }

  try {
    replaceDb(JSON.parse(raw));
  } catch (e) {
    console.warn('読み込み失敗', e);
    resetToDefaults();
    save();
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function resetToDefaults() {
  replaceDb(createDefaultDb());
}

function normalizeDb() {
  db.authors = db.authors.map(author => ({
    id: normalizeId(author.id),
    name: author.name || '',
    kana: author.kana || '',
    roman: author.roman || '',
    aliases: author.aliases || '',
    birth: parseOptionalYear(author.birth),
    death: parseOptionalYear(author.death)
  }));

  db.books = db.books.map(book => ({
    id: normalizeId(book.id),
    title: book.title || '',
    authorId: normalizeId(book.authorId),
    publisher: book.publisher || null,
    year: parseOptionalYear(book.year)
  }));

  db.holdings = db.holdings.map(holding => ({
    id: normalizeId(holding.id),
    bookId: normalizeId(holding.bookId),
    location: LOCATIONS.includes(holding.location) ? holding.location : LOCATIONS[0]
  }));

  const legacyUserIdToStudentNumber = new Map();
  const legacyUsers = db.users;

  const hadUserCategory = legacyUsers.some(user => user.category);
  db.users = legacyUsers.map((user, index) => {
    const legacyId = normalizeId(user.id);
    const faculty = user.faculty || '文学部';
    const studentNumber = String(user.studentNumber || generateStudentNumber(legacyId || index + 1, faculty)).trim();
    if (legacyId && studentNumber) legacyUserIdToStudentNumber.set(legacyId, studentNumber);
    return {
      studentNumber,
      category: normalizeUserCategory(user.category),
      faculty,
      name: user.name || ''
    };
  });

  if (legacyUsers.length > 0 && !hadUserCategory) {
    DEFAULT_USERS
      .filter(user => user.category === '教員')
      .forEach(defaultUser => {
        if (!db.users.some(user => user.studentNumber === defaultUser.studentNumber)) {
          db.users.push({ ...defaultUser });
        }
      });
  }

  db.loans = db.loans.map(loan => {
    const holdingId = loan.holdingId ? normalizeId(loan.holdingId) : ensureHoldingFromLegacyLoan(loan.bookId);
    const userId = normalizeUserReference(loan.userId, loan.user, legacyUserIdToStudentNumber);
    return {
      id: normalizeId(loan.id),
      holdingId,
      userId,
      date: loan.date || ''
    };
  });

  ensureNextIds();
}

function ensureHoldingFromLegacyLoan(bookId) {
  const normalizedBookId = normalizeId(bookId);
  if (!normalizedBookId) return null;
  const existing = db.holdings.find(holding => holding.bookId === normalizedBookId);
  if (existing) return existing.id;
  const id = nextAvailableId(db.holdings);
  db.holdings.push({ id, bookId: normalizedBookId, location: LOCATIONS[0] });
  return id;
}

function normalizeUserReference(value, userName, legacyUserIdToStudentNumber) {
  const numericId = normalizeId(value);
  if (numericId && legacyUserIdToStudentNumber.has(numericId)) {
    return legacyUserIdToStudentNumber.get(numericId);
  }
  const text = value === null || value === undefined ? '' : String(value).trim();
  if (text) return text;
  return ensureUserFromLegacyLoan(userName);
}

function ensureUserFromLegacyLoan(userName) {
  const name = typeof userName === 'string' ? userName.trim() : '';
  if (!name) return '';
  const existing = db.users.find(user => user.name === name);
  if (existing) return existing.studentNumber;
  const faculty = '文学部';
  const studentNumber = generateStudentNumber(db.users.length + 1, faculty);
  db.users.push({
    studentNumber,
    category: '学生',
    faculty,
    name
  });
  return studentNumber;
}

function generateStudentNumber(id, faculty) {
  return `AG20${facultyInitial(faculty)}${String(id || 1).padStart(3, '0')}`;
}

function normalizeUserCategory(category) {
  return category === '教員' ? '教員' : '学生';
}

function facultyInitial(faculty) {
  const initials = {
    '文学部': 'L',
    '情報学部': 'I',
    '教育学部': 'E',
    '芸術学部': 'A',
    '理学部': 'S'
  };
  return initials[faculty] || 'X';
}

function ensureNextIds() {
  db.nextId.authors = Math.max(db.nextId.authors || 1, nextAvailableId(db.authors));
  db.nextId.books = Math.max(db.nextId.books || 1, nextAvailableId(db.books));
  db.nextId.holdings = Math.max(db.nextId.holdings || 1, nextAvailableId(db.holdings));
  db.nextId.users = Math.max(db.nextId.users || 1, nextAvailableId(db.users));
  db.nextId.loans = Math.max(db.nextId.loans || 1, nextAvailableId(db.loans));
}

function nextAvailableId(records) {
  return records.reduce((max, record) => Math.max(max, normalizeId(record.id) || 0), 0) + 1;
}

function normalizeId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseOptionalYear(value) {
  if (value === null || value === undefined || value === '') return null;
  const text = String(value).trim();
  if (!/^[1-9][0-9]{0,3}$/.test(text)) return null;
  return Number(text);
}

function sanitizeYearInput(input) {
  input.value = input.value.replace(/\D/g, '').slice(0, 4);
  if (input.value === '0') input.value = '';
}

function formatId(type, id) {
  if (!id) return '';
  return `${ID_PREFIX[type]}${String(id).padStart(4, '0')}`;
}

let renderContext = null;

function mapById(records) {
  const map = new Map();
  records.forEach(record => {
    if (!map.has(record.id)) map.set(record.id, record);
  });
  return map;
}

function createRenderContext() {
  const authorsById = mapById(db.authors);
  const booksById = mapById(db.books);
  const holdingsById = mapById(db.holdings);
  const usersById = new Map();
  db.users.forEach(user => {
    if (!usersById.has(user.studentNumber)) usersById.set(user.studentNumber, user);
  });
  const booksByAuthorId = new Map();
  const holdingsByBookId = new Map();
  const loanedHoldingIds = new Set(db.loans.map(loan => loan.holdingId));

  db.books.forEach(book => {
    if (!booksByAuthorId.has(book.authorId)) booksByAuthorId.set(book.authorId, []);
    booksByAuthorId.get(book.authorId).push(book);
  });

  db.holdings.forEach(holding => {
    if (!holdingsByBookId.has(holding.bookId)) holdingsByBookId.set(holding.bookId, []);
    holdingsByBookId.get(holding.bookId).push(holding);
  });

  return {
    authorsById,
    booksById,
    holdingsById,
    usersById,
    booksByAuthorId,
    holdingsByBookId,
    loanedHoldingIds
  };
}

function currentRenderContext(ctx) {
  return ctx || renderContext || createRenderContext();
}

function findAuthor(id) {
  return renderContext?.authorsById.get(id) || db.authors.find(author => author.id === id);
}

function findBook(id) {
  return renderContext?.booksById.get(id) || db.books.find(book => book.id === id);
}

function findHolding(id) {
  return renderContext?.holdingsById.get(id) || db.holdings.find(holding => holding.id === id);
}

function findUser(id) {
  return renderContext?.usersById.get(id) || db.users.find(user => user.studentNumber === id || user.id === id);
}

function formatLifeSpan(author) {
  if (!author) return '';
  const birth = author.birth ?? '?';
  const death = author.death ?? '存命';
  return `${birth}-${death}`;
}

// === タブ切り替え ===
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    renderAll();
  });
});

// === タブ内リンク（「著者テーブルで新規作成」など） ===
document.body.addEventListener('click', e => {
  const link = e.target.closest('[data-goto]');
  if (!link) return;
  e.preventDefault();
  const target = link.dataset.goto;
  document.querySelector(`.tab[data-tab="${target}"]`)?.click();
  setTimeout(() => {
    document.querySelector(`#${target} input, #${target} select`)?.focus();
  }, 50);
});

document.querySelectorAll('.year-input').forEach(input => {
  input.addEventListener('input', () => sanitizeYearInput(input));
});

// === 著者 ===
document.getElementById('authorForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const fields = f.elements;
  const name = fields.name.value.trim();
  if (!name) return;

  const author = {
    id: db.nextId.authors++,
    name,
    kana: fields.kana.value.trim(),
    roman: fields.roman.value.trim(),
    aliases: fields.aliases.value.trim(),
    birth: parseOptionalYear(fields.birth.value),
    death: parseOptionalYear(fields.death.value)
  };
  db.authors.push(author);
  save();
  f.reset();
  renderAll();
  flashRow('authorTable', author.id);
});

function renderAuthors() {
  const tbody = document.querySelector('#authorTable tbody');
  if (db.authors.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">まだ著者が登録されていません</td></tr>';
  } else {
    tbody.innerHTML = db.authors.map(author => `<tr data-id="${author.id}">
        <td><span class="fk-link">${formatId('authors', author.id)}</span></td>
        <td>${escapeHtml(author.name)}</td>
        <td>${escapeHtml(author.kana)}</td>
        <td>${escapeHtml(author.roman)}</td>
        <td>${escapeHtml(author.aliases)}</td>
        <td>${formatLifeSpan(author)}</td>
        <td><button class="btn-delete" data-del="author" data-id="${author.id}">削除</button></td>
      </tr>`).join('');
  }
  document.getElementById('authorCount').textContent = `${db.authors.length}件`;

  const sel = document.querySelector('#bookForm select[name="authorId"]');
  sel.innerHTML = '<option value="">— 著者を選択 —</option>' +
    db.authors.map(author => `<option value="${author.id}">${formatId('authors', author.id)} / ${escapeHtml(author.name)}</option>`).join('');
  document.getElementById('noAuthorHint').style.display = db.authors.length === 0 ? 'block' : 'none';
}

// === 書籍 ===
document.getElementById('bookForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const fields = f.elements;
  const title = fields.title.value.trim();
  const authorId = parseInt(fields.authorId.value, 10);
  if (!title || !authorId) return;

  const book = {
    id: db.nextId.books++,
    title,
    authorId,
    publisher: fields.publisher.value.trim() || null,
    year: parseOptionalYear(fields.year.value)
  };
  db.books.push(book);
  save();
  f.reset();
  renderAll();
  flashRow('bookTable', book.id);
});

function renderBooks(ctx) {
  const context = currentRenderContext(ctx);
  const tbody = document.querySelector('#bookTable tbody');
  if (db.books.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">まだ書籍が登録されていません</td></tr>';
  } else {
    tbody.innerHTML = db.books.map(book => {
      const author = context.authorsById.get(book.authorId);
      return `<tr data-id="${book.id}">
        <td><span class="fk-link">${formatId('books', book.id)}</span></td>
        <td>${escapeHtml(book.title)}</td>
        <td>${author ? escapeHtml(author.name) : '<em>(著者不明)</em>'}</td>
        <td><span class="fk-link">→ ${formatId('authors', book.authorId)}</span></td>
        <td>${escapeHtml(book.publisher ?? '')}</td>
        <td>${book.year ?? ''}</td>
        <td><button class="btn-delete" data-del="book" data-id="${book.id}">削除</button></td>
      </tr>`;
    }).join('');
  }
  document.getElementById('bookCount').textContent = `${db.books.length}件`;

  renderBookOptions();
}

function renderBookOptions() {
  const bookSelects = document.querySelectorAll('select[name="bookId"]');
  bookSelects.forEach(sel => {
    sel.innerHTML = '<option value="">— 書籍を選択 —</option>' +
      db.books.map(book => `<option value="${book.id}">${formatId('books', book.id)} / ${escapeHtml(book.title)}</option>`).join('');
  });
  const noHoldingBookHint = document.getElementById('noHoldingBookHint');
  if (noHoldingBookHint) noHoldingBookHint.style.display = db.books.length === 0 ? 'block' : 'none';
}

// === 所蔵 ===
document.getElementById('holdingForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const fields = f.elements;
  const bookId = parseInt(fields.bookId.value, 10);
  const location = fields.location.value;
  if (!bookId || !location) return;

  const holding = {
    id: db.nextId.holdings++,
    bookId,
    location
  };
  db.holdings.push(holding);
  save();
  f.reset();
  renderAll();
  flashRow('holdingTable', holding.id);
});

function renderHoldings(ctx) {
  const context = currentRenderContext(ctx);
  const tbody = document.querySelector('#holdingTable tbody');
  if (db.holdings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">まだ所蔵が登録されていません</td></tr>';
  } else {
    tbody.innerHTML = db.holdings.map(holding => {
      const book = context.booksById.get(holding.bookId);
      const author = book ? context.authorsById.get(book.authorId) : null;
      return `<tr data-id="${holding.id}">
        <td><span class="fk-link">${formatId('holdings', holding.id)}</span></td>
        <td><span class="fk-link">→ ${formatId('books', holding.bookId)}</span></td>
        <td>${book ? escapeHtml(book.title) : '<em>(書籍不明)</em>'}</td>
        <td>${author ? escapeHtml(author.name) : ''}</td>
        <td>${escapeHtml(holding.location)}</td>
        <td><button class="btn-delete" data-del="holding" data-id="${holding.id}">削除</button></td>
      </tr>`;
    }).join('');
  }
  document.getElementById('holdingCount').textContent = `${db.holdings.length}件`;

  const available = db.holdings.filter(holding => !context.loanedHoldingIds.has(holding.id));
  const sel = document.querySelector('#loanForm select[name="holdingId"]');
  sel.innerHTML = '<option value="">— 図書を選択 —</option>' +
    available.map(holding => {
      const book = context.booksById.get(holding.bookId);
      return `<option value="${holding.id}">${formatId('holdings', holding.id)} / ${book ? escapeHtml(book.title) : '書籍不明'} / ${escapeHtml(holding.location)}</option>`;
    }).join('');
  document.getElementById('noHoldingHint').style.display = db.holdings.length === 0 ? 'block' : 'none';
  document.getElementById('allLoanedHint').style.display = (db.holdings.length > 0 && available.length === 0) ? 'block' : 'none';
}

// === 利用者 ===
document.getElementById('userForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const fields = f.elements;
  const name = fields.name.value.trim();
  const studentNumber = fields.studentNumber.value.trim();
  const category = normalizeUserCategory(fields.category.value);
  const faculty = fields.faculty.value.trim();
  if (!name || !studentNumber || !category || !faculty) return;

  if (db.users.some(user => user.studentNumber === studentNumber)) {
    alert('この学籍番号・教職員番号はすでに登録されています。');
    return;
  }

  const user = {
    studentNumber,
    category,
    faculty,
    name
  };
  db.users.push(user);
  save();
  f.reset();
  renderAll();
  flashRow('userTable', user.studentNumber);
});

function renderUsers() {
  const tbody = document.querySelector('#userTable tbody');
  if (db.users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">まだ利用者が登録されていません</td></tr>';
  } else {
    tbody.innerHTML = db.users.map(user => `<tr data-id="${escapeHtml(user.studentNumber)}">
        <td><span class="fk-link">${escapeHtml(user.studentNumber)}</span></td>
        <td>${escapeHtml(user.category)}</td>
        <td>${escapeHtml(user.faculty)}</td>
        <td>${escapeHtml(user.name)}</td>
        <td><button class="btn-delete" data-del="user" data-id="${escapeHtml(user.studentNumber)}">削除</button></td>
      </tr>`).join('');
  }
  document.getElementById('userCount').textContent = `${db.users.length}件`;

  const sel = document.querySelector('#loanForm select[name="userId"]');
  sel.innerHTML = '<option value="">— 利用者を選択 —</option>' +
    db.users.map(user => `<option value="${escapeHtml(user.studentNumber)}">${escapeHtml(user.studentNumber)} / ${escapeHtml(user.name)}</option>`).join('');
  document.getElementById('noUserHint').style.display = db.users.length === 0 ? 'block' : 'none';
}

// === 貸出 ===
function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateAfterDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDateValue(date);
}

function setDefaultLoanDate() {
  document.querySelector('#loanForm input[name="date"]').value = dateAfterDays(14);
}

setDefaultLoanDate();

document.getElementById('loanForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const fields = f.elements;
  const holdingId = parseInt(fields.holdingId.value, 10);
  const userId = fields.userId.value.trim();
  const date = fields.date.value;
  if (!holdingId || !userId || !date) return;

  if (db.loans.some(loan => loan.holdingId === holdingId)) {
    alert('この図書はすでに貸出中です。同じ図書IDを二重に貸し出すことはできません。');
    return;
  }

  const loan = {
    id: db.nextId.loans++,
    holdingId,
    userId,
    date
  };
  db.loans.push(loan);
  save();
  f.reset();
  setDefaultLoanDate();
  renderAll();
  flashRow('loanTable', loan.id);
});

document.getElementById('returnForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const loanId = parseInt(f.elements.loanId.value, 10);
  if (!loanId) return;
  db.loans = db.loans.filter(loan => loan.id !== loanId);
  save();
  f.reset();
  renderAll();
});

function renderLoans(ctx) {
  const context = currentRenderContext(ctx);
  const tbody = document.querySelector('#loanTable tbody');
  if (db.loans.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty">まだ貸出が記録されていません</td></tr>';
  } else {
    tbody.innerHTML = db.loans.map(loan => {
      const holding = context.holdingsById.get(loan.holdingId);
      const book = holding ? context.booksById.get(holding.bookId) : null;
      const user = context.usersById.get(loan.userId);
      return `<tr data-id="${loan.id}">
        <td><span class="fk-link">${formatId('loans', loan.id)}</span></td>
        <td><span class="fk-link">→ ${formatId('holdings', loan.holdingId)}</span></td>
        <td>${book ? escapeHtml(book.title) : '<em>(書籍不明)</em>'}</td>
        <td>${holding ? escapeHtml(holding.location) : ''}</td>
        <td><span class="fk-link">→ ${escapeHtml(loan.userId)}</span></td>
        <td>${user ? escapeHtml(user.name) : '<em>(利用者不明)</em>'}</td>
        <td>${loan.date}</td>
        <td><button class="btn-delete" data-del="loan" data-id="${loan.id}">削除</button></td>
      </tr>`;
    }).join('');
  }
  document.getElementById('loanCount').textContent = `${db.loans.length}件`;
  renderReturnOptions(context);
}

function renderReturnOptions(ctx) {
  const context = currentRenderContext(ctx);
  const sel = document.querySelector('#returnForm select[name="loanId"]');
  if (!sel) return;
  sel.innerHTML = '<option value="">— 返却する図書を選択 —</option>' +
    db.loans.map(loan => {
      const holding = context.holdingsById.get(loan.holdingId);
      const book = holding ? context.booksById.get(holding.bookId) : null;
      const user = context.usersById.get(loan.userId);
      return `<option value="${loan.id}">${formatId('holdings', loan.holdingId)} / ${book ? escapeHtml(book.title) : '書籍不明'} / ${user ? escapeHtml(user.name) : '利用者不明'}</option>`;
    }).join('');
  document.getElementById('noReturnHint').style.display = db.loans.length === 0 ? 'block' : 'none';
}

// === 削除 ===
document.body.addEventListener('click', e => {
  const btn = e.target.closest('[data-del]');
  if (!btn) return;
  const type = btn.dataset.del;
  const rawId = btn.dataset.id;
  const id = parseInt(rawId, 10);

  if (type === 'author') {
    const used = db.books.some(book => book.authorId === id);
    if (used) {
      alert('この著者は書籍テーブルから参照されています。先に書籍を削除してください。\n（外部キー制約のイメージ）');
      return;
    }
    db.authors = db.authors.filter(author => author.id !== id);
  } else if (type === 'book') {
    const used = db.holdings.some(holding => holding.bookId === id);
    if (used) {
      alert('この書籍は所蔵テーブルから参照されています。先に所蔵を削除してください。\n（外部キー制約のイメージ）');
      return;
    }
    db.books = db.books.filter(book => book.id !== id);
  } else if (type === 'holding') {
    const used = db.loans.some(loan => loan.holdingId === id);
    if (used) {
      alert('この所蔵は貸出テーブルから参照されています。先に貸出を削除してください。\n（外部キー制約のイメージ）');
      return;
    }
    db.holdings = db.holdings.filter(holding => holding.id !== id);
  } else if (type === 'user') {
    const used = db.loans.some(loan => loan.userId === rawId);
    if (used) {
      alert('この利用者は貸出テーブルから参照されています。先に貸出を削除してください。\n（外部キー制約のイメージ）');
      return;
    }
    db.users = db.users.filter(user => user.studentNumber !== rawId);
  } else if (type === 'loan') {
    db.loans = db.loans.filter(loan => loan.id !== id);
  }

  save();
  renderAll();
});

// === 検索 ===
let bookSearchSubmitted = false;
let authorSearchSubmitted = false;
let selectedAuthorId = null;

function currentBookQuery() {
  return document.getElementById('bookSearchInput')?.value || '';
}

function currentAuthorQuery() {
  return document.getElementById('authorSearchInput')?.value || '';
}

function renderBookSearchResults(ctx) {
  const context = currentRenderContext(ctx);
  const tbody = document.querySelector('#bookSearchResult tbody');
  if (!tbody) return;
  const q = currentBookQuery().trim().toLowerCase();

  if (!bookSearchSubmitted) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">キーワードを入力して検索してください</td></tr>';
    return;
  }
  if (!q) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">キーワードを入力してください</td></tr>';
    return;
  }

  const books = db.books.filter(book => bookMatchesSearch(book, q, context));
  if (books.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">該当なし</td></tr>';
    return;
  }

  tbody.innerHTML = books.map(book => {
    const author = context.authorsById.get(book.authorId);
    const holdingCount = (context.holdingsByBookId.get(book.id) || []).length;
    return `<tr>
      <td><span class="fk-link">${formatId('books', book.id)}</span></td>
      <td>${escapeHtml(book.title)}</td>
      <td>${author ? escapeHtml(author.name) : '<em>(著者不明)</em>'}</td>
      <td>${escapeHtml(book.publisher ?? '')}</td>
      <td>${book.year ?? ''}</td>
      <td>${holdingCount} 冊</td>
    </tr>`;
  }).join('');
}

function bookMatchesSearch(book, q, ctx) {
  const context = currentRenderContext(ctx);
  const author = context.authorsById.get(book.authorId);
  return [
    book.title,
    book.publisher,
    book.year,
    author?.name,
    author?.kana,
    author?.roman,
    author?.aliases
  ].some(value => String(value || '').toLowerCase().includes(q));
}

function renderAuthorSearchResults(ctx) {
  const context = currentRenderContext(ctx);
  const tbody = document.querySelector('#authorSearchResult tbody');
  if (!tbody) return;
  const q = currentAuthorQuery().trim().toLowerCase();

  if (!authorSearchSubmitted) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">著者キーワードを入力して検索してください</td></tr>';
    renderSelectedAuthorBooks(context);
    return;
  }
  if (!q) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">著者キーワードを入力してください</td></tr>';
    selectedAuthorId = null;
    renderSelectedAuthorBooks(context);
    return;
  }

  const authors = db.authors.filter(author => authorMatches(author, q));
  if (authors.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">該当なし</td></tr>';
    selectedAuthorId = null;
    renderSelectedAuthorBooks(context);
    return;
  }

  tbody.innerHTML = authors.map(author => {
    const selectedClass = author.id === selectedAuthorId ? ' selected' : '';
    return `<tr class="clickable-row${selectedClass}" data-author-id="${author.id}">
      <td><span class="fk-link">${formatId('authors', author.id)}</span></td>
      <td>${escapeHtml(author.name)}</td>
      <td>${escapeHtml(author.kana)}</td>
      <td>${escapeHtml(author.roman)}</td>
      <td>${escapeHtml(author.aliases || '')}</td>
      <td>${formatLifeSpan(author)}</td>
    </tr>`;
  }).join('');

  renderSelectedAuthorBooks(context);
}

function renderSelectedAuthorBooks(ctx) {
  const context = currentRenderContext(ctx);
  const panel = document.getElementById('selectedAuthorBooksPanel');
  const title = document.getElementById('selectedAuthorTitle');
  const tbody = document.querySelector('#selectedAuthorBooks tbody');
  if (!panel || !title || !tbody) return;

  if (!selectedAuthorId) {
    panel.hidden = true;
    tbody.innerHTML = '';
    return;
  }

  const author = context.authorsById.get(selectedAuthorId);
  if (!author) {
    panel.hidden = true;
    tbody.innerHTML = '';
    return;
  }

  panel.hidden = false;
  title.textContent = `${author.name}の書籍`;
  const books = context.booksByAuthorId.get(author.id) || [];

  if (books.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">該当する書籍がありません</td></tr>';
    return;
  }

  tbody.innerHTML = books.map(book => {
    const holdingCount = (context.holdingsByBookId.get(book.id) || []).length;
    return `<tr>
      <td><span class="fk-link">${formatId('books', book.id)}</span></td>
      <td>${escapeHtml(book.title)}</td>
      <td>${escapeHtml(book.publisher ?? '')}</td>
      <td>${book.year ?? ''}</td>
      <td>${holdingCount} 冊</td>
    </tr>`;
  }).join('');
}

document.getElementById('bookSearchForm').addEventListener('submit', e => {
  e.preventDefault();
  bookSearchSubmitted = true;
  renderBookSearchResults();
});

document.getElementById('authorSearchForm').addEventListener('submit', e => {
  e.preventDefault();
  authorSearchSubmitted = true;
  selectedAuthorId = null;
  renderAuthorSearchResults();
});

document.querySelector('#authorSearchResult tbody').addEventListener('click', e => {
  const row = e.target.closest('[data-author-id]');
  if (!row) return;
  selectedAuthorId = parseInt(row.dataset.authorId, 10);
  renderAuthorSearchResults();
});

function authorMatches(author, q) {
  return [author.name, author.kana, author.roman, author.aliases]
    .some(value => String(value || '').toLowerCase().includes(q));
}

// === 統計 ===
function renderStats(ctx) {
  const context = currentRenderContext(ctx);
  const counts = document.getElementById('counts');
  counts.innerHTML = `
    <li>著者 <span class="num">${db.authors.length}</span></li>
    <li>書籍 <span class="num">${db.books.length}</span></li>
    <li>所蔵 <span class="num">${db.holdings.length}</span></li>
    <li>利用者 <span class="num">${db.users.length}</span></li>
    <li>貸出 <span class="num">${db.loans.length}</span></li>
  `;

  const ba = document.querySelector('#byAuthor tbody');
  if (db.authors.length === 0) {
    ba.innerHTML = '<tr><td colspan="3" class="empty">データなし</td></tr>';
  } else {
    ba.innerHTML = db.authors.map(author => {
      const books = context.booksByAuthorId.get(author.id) || [];
      const n = books.reduce((total, book) => total + (context.holdingsByBookId.get(book.id) || []).length, 0);
      return `<tr><td>${formatId('authors', author.id)}</td><td>${escapeHtml(author.name)}</td><td>${n} 冊</td></tr>`;
    }).join('');
  }
}

// === リセット ===
document.getElementById('resetAll').addEventListener('click', () => {
  if (!confirm('本当にすべてのデータを初期データに戻しますか？')) return;
  resetToDefaults();
  save();
  renderAll();
});

// === ユーティリティ ===
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function flashRow(tableId, id) {
  setTimeout(() => {
    const row = Array.from(document.querySelectorAll(`#${tableId} tr[data-id]`))
      .find(candidate => candidate.dataset.id === String(id));
    if (row) row.classList.add('new');
  }, 10);
}

function renderAll() {
  renderContext = createRenderContext();
  try {
    renderAuthors();
    renderBooks(renderContext);
    renderHoldings(renderContext);
    renderUsers();
    renderLoans(renderContext);
    renderBookSearchResults(renderContext);
    renderAuthorSearchResults(renderContext);
    renderStats(renderContext);
  } finally {
    renderContext = null;
  }
}

// === 起動 ===
load();
renderAll();
