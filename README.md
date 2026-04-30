# 図書館情報技術論向け: DB作成体験アプリ

文系2年生向けに、30分で以下を体験することを目的にしたWebアプリです。

- レコード追加（INSERT）
- 主キー/外部キーの関連
- JOINで複数テーブルをつないだ検索
- LIKE検索
- GROUP BY集計

## テーブル構成

- `books`（書誌）
- `copies`（所蔵資料）
- `users`（利用者）
- `loans`（貸出）

## 特徴

- `sql.js` (SQLite WebAssembly) を使用
- DBはブラウザの `localStorage` に保存
- 学生ごとに個別DB（ログイン不要）
- サンプル投入時に固定IDへ依存せず、現在DB状態に安全に追加
- 4テーブルの中身確認ボタンつき
- 任意でSQL学習モードをONにして自由SELECTを実行可能
- `vercel.json` で `/` を `index.html` に明示的にリライト（404対策）

## ローカル実行

```bash
python3 -m http.server 8000
# http://localhost:8000