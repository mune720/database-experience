let db;
let showSql = false;

const DB_KEY = "library_db_sqljs_v2";
const wasmConfig = { locateFile: () => "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.wasm" };

function setLastSql(sql) {
  document.getElementById("lastSql").textContent = sql;
}

function persistDb() {
  const bin = db.export();
  localStorage.setItem(DB_KEY, JSON.stringify(Array.from(bin)));
}

function run(sql, params = []) {
  setLastSql(sql);
  db.run(sql, params);
  persistDb();
}

function query(sql, params = []) {
  setLastSql(sql);
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  persistDb();
  return rows;
}

function initSchema() {
  db.run("PRAGMA foreign_keys = ON;");
  run(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    published_year INTEGER
  );`);
  run(`CREATE TABLE IF NOT EXISTS copies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    barcode TEXT NOT NULL UNIQUE,
    FOREIGN KEY(book_id) REFERENCES books(id)
  );`);
  run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL
  );`);
  run(`CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    copy_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    loan_date TEXT NOT NULL DEFAULT (date('now')),
    FOREIGN KEY(copy_id) REFERENCES copies(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );`);
}

function tableHtml(rows) {
  if (!rows.length) return "<p class='muted'>該当データがありません。</p>";
  const headers = Object.keys(rows[0]);
  return `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${headers.map(h => `<td>${r[h] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function validateInt(value, name) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`${name}は1以上の整数で入力してください。`);
  return n;
}

function addStatus(message, tone = "ok") {
  const el = document.getElementById("status");
  el.textContent = message;
  el.style.color = tone === "error" ? "#dc2626" : "#0f766e";
}

window.addBook = () => {
  try {
    const title = document.getElementById("bookTitle").value.trim();
    const year = document.getElementById("bookYear").value;
    if (!title) throw new Error("タイトルを入力してください");
    run("INSERT INTO books (title, published_year) VALUES (?, ?);", [title, year ? Number(year) : null]);
    addStatus("booksにレコードを追加しました。");
  } catch (e) { addStatus(e.message, "error"); }
};

window.addCopy = () => {
  try {
    const bookId = validateInt(document.getElementById("copyBookId").value, "book_id");
    const barcode = document.getElementById("copyBarcode").value.trim();
    if (!barcode) throw new Error("バーコードを入力してください");
    run("INSERT INTO copies (book_id, barcode) VALUES (?, ?);", [bookId, barcode]);
    addStatus("copiesにレコードを追加しました。");
  } catch (e) { addStatus(e.message, "error"); }
};

window.addUser = () => {
  try {
    const name = document.getElementById("userName").value.trim();
    const category = document.getElementById("userCategory").value;
    if (!name) throw new Error("氏名を入力してください");
    run("INSERT INTO users (name, category) VALUES (?, ?);", [name, category]);
    addStatus("usersにレコードを追加しました。");
  } catch (e) { addStatus(e.message, "error"); }
};

window.addLoan = () => {
  try {
    const copyId = validateInt(document.getElementById("loanCopyId").value, "copy_id");
    const userId = validateInt(document.getElementById("loanUserId").value, "user_id");
    run("INSERT INTO loans (copy_id, user_id) VALUES (?, ?);", [copyId, userId]);
    addStatus("loansにレコードを追加しました。");
  } catch (e) { addStatus(e.message, "error"); }
};

window.searchLoans = () => {
  const rows = query(`SELECT l.id AS loan_id, u.name AS 利用者, u.category AS 区分, b.title AS タイトル, c.barcode AS バーコード, l.loan_date AS 貸出日
FROM loans l
JOIN users u ON l.user_id = u.id
JOIN copies c ON l.copy_id = c.id
JOIN books b ON c.book_id = b.id
ORDER BY l.id DESC;`);
  document.getElementById("joinResult").innerHTML = tableHtml(rows);
};

window.searchBooks = () => {
  const q = document.getElementById("titleSearch").value.trim();
  const rows = query("SELECT * FROM books WHERE title LIKE ? ORDER BY id DESC;", [`%${q}%`]);
  document.getElementById("bookResult").innerHTML = tableHtml(rows);
};

window.statsByCategory = () => {
  const rows = query(`SELECT u.category AS 利用者区分, COUNT(*) AS 貸出件数
FROM loans l JOIN users u ON l.user_id = u.id
GROUP BY u.category
ORDER BY 貸出件数 DESC;`);
  document.getElementById("statsResult").innerHTML = tableHtml(rows);
};

window.showTable = (tableName) => {
  const rows = query(`SELECT * FROM ${tableName} ORDER BY id DESC;`);
  document.getElementById("tableResult").innerHTML = tableHtml(rows);
};

window.runSql = () => {
  try {
    const sql = document.getElementById("sqlInput").value.trim();
    const rows = query(sql);
    document.getElementById("sqlResult").innerHTML = tableHtml(rows);
  } catch (e) {
    document.getElementById("sqlResult").innerHTML = `<p style='color:#dc2626'>${e.message}</p>`;
  }
};

function insertBook(title, year) {
  run("INSERT INTO books (title, published_year) VALUES (?, ?);", [title, year]);
  return query("SELECT last_insert_rowid() AS id;")[0].id;
}

function insertCopy(bookId, barcode) {
  run("INSERT INTO copies (book_id, barcode) VALUES (?, ?);", [bookId, barcode]);
  return query("SELECT last_insert_rowid() AS id;")[0].id;
}

function insertUser(name, category) {
  run("INSERT INTO users (name, category) VALUES (?, ?);", [name, category]);
  return query("SELECT last_insert_rowid() AS id;")[0].id;
}

async function boot() {
  const SQL = await initSqlJs(wasmConfig);
  const saved = localStorage.getItem(DB_KEY);
  db = saved ? new SQL.Database(new Uint8Array(JSON.parse(saved))) : new SQL.Database();
  initSchema();

  document.getElementById("seedBtn").onclick = () => {
    try {
      const book1 = insertBook("図書館概論", 2023);
      const book2 = insertBook("データベース入門", 2024);
      const copy1 = insertCopy(book1, `BC${Date.now()}01`);
      insertCopy(book1, `BC${Date.now()}02`);
      const copy3 = insertCopy(book2, `BC${Date.now()}03`);
      const user1 = insertUser("山田花子", "学部2年");
      const user2 = insertUser("鈴木一郎", "大学院");
      run("INSERT INTO loans (copy_id, user_id) VALUES (?, ?);", [copy1, user1]);
      run("INSERT INTO loans (copy_id, user_id) VALUES (?, ?);", [copy3, user2]);
      addStatus("サンプルデータを投入しました。JOIN表示で確認できます。");
    } catch (e) {
      addStatus(e.message, "error");
    }
  };

  document.getElementById("resetBtn").onclick = () => {
    if (!confirm("このブラウザのDBを削除して初期化します。よろしいですか？")) return;
    localStorage.removeItem(DB_KEY);
    location.reload();
  };

  document.getElementById("showSqlBtn").onclick = () => {
    showSql = !showSql;
    document.getElementById("sqlPanel").style.display = showSql ? "block" : "none";
    document.getElementById("showSqlBtn").textContent = `SQL学習モード: ${showSql ? "ON" : "OFF"}`;
  };
}

boot();