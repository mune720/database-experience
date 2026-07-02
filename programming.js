/* プログラミング体験
   言語タブを切り替え、左のエディタに書いたコードを右にリアルタイムで実行・表示する。
   - JavaScript : Web Worker 上で実行（無限ループ対策にタイムアウトで停止）
   - Python     : Pyodide（CDN・無料）を Web Worker で実行
   - HTML/CSS   : iframe に描画
   - SQL        : sql.js（SQLite・無料）で図書館データに問い合わせ
   - Excel VBA  : ブラウザでは実行せず、想定出力とコピー手順を表示
   入力したコードは保存・外部送信しない。 */
(function () {
  "use strict";

  /* ============================================================
     1. テンプレート定義（各言語：基本 → 図書館応用）
     ============================================================ */

  var TEMPLATES = {
    js: [
      {
        name: "① あいさつを表示",
        explain: "console.log( ) で、かっこの中身を右の画面に表示します。プログラムの第一歩です。",
        code:
          'console.log("こんにちは、図書館！");\n'
      },
      {
        name: "② 変数と計算（延滞日数）",
        explain: "値に名前をつけたものが「変数」です。借りた日数から貸出期間を引いて、延滞日数を計算します。",
        code:
          "// 本を借りられる期間は14日\n" +
          "const かりた日数 = 18;\n" +
          "const 延滞日数 = かりた日数 - 14;\n" +
          '\n' +
          'console.log("延滞日数は " + 延滞日数 + " 日です");\n'
      },
      {
        name: "③ くり返し（蔵書リスト）",
        explain: "for を使うと、同じ処理を何回もくり返せます。本のリストを1冊ずつ番号つきで並べます。",
        code:
          'const 蔵書 = ["吾輩は猫である", "坊っちゃん", "こころ"];\n' +
          "\n" +
          "for (let i = 0; i < 蔵書.length; i++) {\n" +
          '  console.log((i + 1) + "冊目: " + 蔵書[i]);\n' +
          "}\n"
      },
      {
        name: "④ 条件分岐（延滞の判定）",
        explain: "if を使うと「もし〜なら」で処理を分けられます。延滞しているかどうかで表示を変えます。",
        code:
          "const 延滞日数 = 3;\n" +
          "\n" +
          "if (延滞日数 > 0) {\n" +
          '  console.log("延滞しています。延滞金は " + (延滞日数 * 10) + " 円です。");\n' +
          "} else {\n" +
          '  console.log("返却期限内です。");\n' +
          "}\n"
      },
      {
        name: "⑤ 関数（延滞金の計算）",
        explain: "function で「決まった処理」に名前をつけ、何度も呼び出せます。日数を渡すと延滞金を返します。",
        code:
          "function 延滞金(日数) {\n" +
          "  return 日数 * 10;\n" +
          "}\n" +
          "\n" +
          'console.log("3日の延滞金: " + 延滞金(3) + " 円");\n' +
          'console.log("7日の延滞金: " + 延滞金(7) + " 円");\n'
      }
    ],

    python: [
      {
        name: "① あいさつを表示",
        explain: "print( ) で、かっこの中身を右の画面に表示します。プログラムの第一歩です。",
        code:
          'print("こんにちは、図書館！")\n'
      },
      {
        name: "② 変数と計算（延滞日数）",
        explain: "値に名前をつけたものが「変数」です。借りた日数から貸出期間を引いて、延滞日数を計算します。",
        code:
          "# 本を借りられる期間は14日\n" +
          "かりた日数 = 18\n" +
          "延滞日数 = かりた日数 - 14\n" +
          "\n" +
          'print("延滞日数は", 延滞日数, "日です")\n'
      },
      {
        name: "③ くり返し（蔵書リスト）",
        explain: "for を使うと、リストの中身を1つずつ取り出してくり返せます。enumerate で番号もつけられます。",
        code:
          '蔵書 = ["吾輩は猫である", "坊っちゃん", "こころ"]\n' +
          "\n" +
          "for 番号, タイトル in enumerate(蔵書, 1):\n" +
          '    print(番号, "冊目:", タイトル)\n'
      },
      {
        name: "④ 条件分岐（延滞の判定）",
        explain: "if を使うと「もし〜なら」で処理を分けられます。延滞しているかどうかで表示を変えます。",
        code:
          "延滞日数 = 3\n" +
          "\n" +
          "if 延滞日数 > 0:\n" +
          '    print("延滞しています。延滞金は", 延滞日数 * 10, "円です。")\n' +
          "else:\n" +
          '    print("返却期限内です。")\n'
      },
      {
        name: "⑤ 集計（著者ごとの冊数）",
        explain: "辞書（dict）を使って、著者ごとに本が何冊あるかを数えます。データのまとめ方の基本です。",
        code:
          "蔵書 = [\n" +
          '    ("吾輩は猫である", "夏目漱石"),\n' +
          '    ("こころ", "夏目漱石"),\n' +
          '    ("羅生門", "芥川龍之介"),\n' +
          "]\n" +
          "\n" +
          "冊数 = {}\n" +
          "for タイトル, 著者 in 蔵書:\n" +
          "    冊数[著者] = 冊数.get(著者, 0) + 1\n" +
          "\n" +
          "for 著者, 数 in 冊数.items():\n" +
          '    print(著者, ":", 数, "冊")\n'
      }
    ],

    html: [
      {
        name: "① 見出しと段落",
        explain: "<h1> は大見出し、<p> は段落です。タグで囲むと、文章に役割がつきます。",
        code:
          "<h1>わたしの図書館</h1>\n" +
          "<p>ようこそ。ここはHTMLで作った小さなページです。</p>\n"
      },
      {
        name: "② 箇条書き（蔵書リスト）",
        explain: "<ul> は箇条書き、その中の <li> が1項目です。リストはこの組み合わせで作ります。",
        code:
          "<h2>おすすめの本</h2>\n" +
          "<ul>\n" +
          "  <li>吾輩は猫である</li>\n" +
          "  <li>坊っちゃん</li>\n" +
          "  <li>こころ</li>\n" +
          "</ul>\n"
      },
      {
        name: "③ 表（貸出一覧）",
        explain: "<table> は表です。<tr> が行、<th> が見出しセル、<td> がデータのセルになります。",
        code:
          "<table border=\"1\">\n" +
          "  <tr><th>タイトル</th><th>著者</th></tr>\n" +
          "  <tr><td>羅生門</td><td>芥川龍之介</td></tr>\n" +
          "  <tr><td>走れメロス</td><td>太宰治</td></tr>\n" +
          "</table>\n"
      },
      {
        name: "④ CSSで見た目を変える",
        explain: "<style> の中に書くのがCSSです。色・背景・余白などの「見た目のルール」を決めます。",
        code:
          "<style>\n" +
          "  h1 { color: #166088; }\n" +
          "  .card {\n" +
          "    background: #eaf3f5;\n" +
          "    padding: 16px;\n" +
          "    border-radius: 8px;\n" +
          "  }\n" +
          "</style>\n" +
          "\n" +
          '<div class="card">\n' +
          "  <h1>図書館だより</h1>\n" +
          "  <p>今月のおすすめを紹介します。</p>\n" +
          "</div>\n"
      },
      {
        name: "⑤ 案内カード（応用）",
        explain: "見出し・段落・リスト・CSSを組み合わせて、図書館の案内カードを作ります。",
        code:
          "<style>\n" +
          "  .info {\n" +
          "    font-family: sans-serif;\n" +
          "    border: 2px solid #4a6fa5;\n" +
          "    border-radius: 10px;\n" +
          "    padding: 16px;\n" +
          "    max-width: 320px;\n" +
          "  }\n" +
          "  .info h2 { color: #166088; margin-top: 0; }\n" +
          "  .info li { margin: 4px 0; }\n" +
          "</style>\n" +
          "\n" +
          '<div class="info">\n' +
          "  <h2>開館のご案内</h2>\n" +
          "  <ul>\n" +
          "    <li>平日: 9時〜20時</li>\n" +
          "    <li>土日: 9時〜17時</li>\n" +
          "    <li>休館: 毎週月曜</li>\n" +
          "  </ul>\n" +
          "</div>\n"
      }
    ],

    sql: [
      {
        name: "① すべての本を見る",
        explain: "SELECT は「データを取り出す」命令です。* は全部の列、FROM books は books（書籍）表から、の意味です。",
        code:
          "SELECT * FROM books;\n"
      },
      {
        name: "② 絞り込みと並べ替え",
        explain: "WHERE で条件を指定し、ORDER BY で並べ替えます。1910年以降の本を出版年順に並べます。",
        code:
          "SELECT title, year\n" +
          "FROM books\n" +
          "WHERE year >= 1910\n" +
          "ORDER BY year;\n"
      },
      {
        name: "③ 表の結合（JOIN）",
        explain: "JOIN で2つの表をつなげます。books の author_id と authors の id を合わせ、本と著者名を一緒に表示します。",
        code:
          "SELECT books.title, authors.name\n" +
          "FROM books\n" +
          "JOIN authors ON books.author_id = authors.id;\n"
      },
      {
        name: "④ 集計（著者ごとの冊数）",
        explain: "GROUP BY でグループに分け、COUNT(*) で数を数えます。著者ごとの蔵書数を多い順に並べます。",
        code:
          "SELECT authors.name, COUNT(*) AS 冊数\n" +
          "FROM books\n" +
          "JOIN authors ON books.author_id = authors.id\n" +
          "GROUP BY authors.name\n" +
          "ORDER BY 冊数 DESC;\n"
      },
      {
        name: "⑤ 貸出中の本（応用）",
        explain: "3つの表をJOINでつなぎ、「誰が・どの本を・いつ借りているか」を一覧にします。",
        code:
          "SELECT books.title, users.name, loans.loan_date\n" +
          "FROM loans\n" +
          "JOIN holdings ON loans.holding_id = holdings.id\n" +
          "JOIN books ON holdings.book_id = books.id\n" +
          "JOIN users ON loans.user_no = users.student_no;\n"
      }
    ],

    vba: [
      {
        name: "① あいさつを表示",
        explain: "MsgBox は小さな画面（メッセージボックス）に文字を出します。VBAの第一歩です。",
        code:
          "Sub あいさつ()\n" +
          '    MsgBox "こんにちは、図書館！"\n' +
          "End Sub\n",
        expected: "実行すると、画面の中央に小さな窓が出て\n「こんにちは、図書館！」\nと表示されます。"
      },
      {
        name: "② セルに書き込む",
        explain: "Cells(行, 列) で、Excelのセルを指定します。A1〜A3にタイトルを書き込みます。",
        code:
          "Sub 蔵書を書く()\n" +
          '    Cells(1, 1).Value = "吾輩は猫である"\n' +
          '    Cells(2, 1).Value = "坊っちゃん"\n' +
          '    Cells(3, 1).Value = "こころ"\n' +
          "End Sub\n",
        expected:
          "Excelのセルが次のようになります。\n\n" +
          "      A\n" +
          "1  吾輩は猫である\n" +
          "2  坊っちゃん\n" +
          "3  こころ"
      },
      {
        name: "③ くり返し（For）",
        explain: "For ... Next で、決まった回数くり返します。1〜5行目に「○冊目」と書き込みます。",
        code:
          "Sub 番号をふる()\n" +
          "    Dim i As Integer\n" +
          "    For i = 1 To 5\n" +
          '        Cells(i, 1).Value = i & "冊目"\n' +
          "    Next i\n" +
          "End Sub\n",
        expected:
          "Excelのセルが次のようになります。\n\n" +
          "      A\n" +
          "1  1冊目\n" +
          "2  2冊目\n" +
          "3  3冊目\n" +
          "4  4冊目\n" +
          "5  5冊目"
      },
      {
        name: "④ 条件分岐（If・延滞の判定）",
        explain: "If ... Then ... Else で処理を分けます。延滞しているかどうかでメッセージを変えます。",
        code:
          "Sub 延滞チェック()\n" +
          "    Dim 延滞日数 As Integer\n" +
          "    延滞日数 = 3\n" +
          "    If 延滞日数 > 0 Then\n" +
          '        MsgBox "延滞金は " & 延滞日数 * 10 & " 円です"\n' +
          "    Else\n" +
          '        MsgBox "返却期限内です"\n' +
          "    End If\n" +
          "End Sub\n",
        expected:
          "延滞日数が 3（0より大きい）なので、\n" +
          "メッセージボックスに\n「延滞金は 30 円です」\nと表示されます。"
      }
    ]
  };

  /* SQL練習用の図書館データ（SQLiteに読み込む） */
  var SQL_SEED = [
    "CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT, birth INTEGER, death INTEGER);",
    "INSERT INTO authors VALUES (1,'夏目漱石',1867,1916),(2,'芥川龍之介',1892,1927),(3,'太宰治',1909,1948),(4,'宮沢賢治',1896,1933),(5,'樋口一葉',1872,1896);",
    "CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER, publisher TEXT, year INTEGER);",
    "INSERT INTO books VALUES" +
      "(1,'吾輩は猫である',1,'岩波書店',1905)," +
      "(2,'坊っちゃん',1,'新潮社',1906)," +
      "(3,'こころ',1,'岩波書店',1914)," +
      "(4,'羅生門',2,'新潮社',1915)," +
      "(5,'蜘蛛の糸',2,'岩波書店',1918)," +
      "(6,'人間失格',3,'新潮社',1948)," +
      "(7,'走れメロス',3,'岩波書店',1940)," +
      "(8,'銀河鉄道の夜',4,'角川書店',1934)," +
      "(9,'注文の多い料理店',4,'新潮社',1924)," +
      "(10,'たけくらべ',5,'岩波書店',1895);",
    "CREATE TABLE holdings (id INTEGER PRIMARY KEY, book_id INTEGER, location TEXT);",
    "INSERT INTO holdings VALUES" +
      "(1,1,'本館1階'),(2,1,'分館'),(3,2,'本館1階'),(4,3,'本館2階')," +
      "(5,4,'本館1階'),(6,6,'本館2階'),(7,7,'新着図書'),(8,8,'本館1階'),(9,8,'分館'),(10,10,'本館2階');",
    "CREATE TABLE users (student_no TEXT PRIMARY KEY, category TEXT, faculty TEXT, name TEXT);",
    "INSERT INTO users VALUES" +
      "('S001','学生','文学部','山田太郎'),('S002','学生','教育学部','佐藤花子')," +
      "('T001','教員','文学部','鈴木一郎'),('S003','学生','文学部','田中美咲');",
    "CREATE TABLE loans (id INTEGER PRIMARY KEY, holding_id INTEGER, user_no TEXT, loan_date TEXT);",
    "INSERT INTO loans VALUES" +
      "(1,1,'S001','2026-06-01'),(2,3,'S002','2026-06-10'),(3,5,'T001','2026-05-20'),(4,8,'S001','2026-06-15');"
  ].join("\n");

  /* 言語ごとの設定 */
  var LANGS = {
    js:     { label: "JavaScript", kind: "console", lead: "ブラウザがそのまま動かす言語です。console.log( ) で結果を表示します。" },
    python: { label: "Python",     kind: "console", lead: "司書の現場でも人気の言語です。print( ) で結果を表示します（初回だけ準備に数秒かかります）。" },
    html:   { label: "HTML / CSS", kind: "preview", lead: "ウェブページを組み立てる言語です。書いたとおりの見た目が右に表示されます。" },
    sql:    { label: "SQL",        kind: "sql",     lead: "データベースに問い合わせる言語です。図書館のデータから必要な情報を取り出します。" },
    vba:    { label: "Excel VBA",  kind: "vba",     lead: "Excelを自動で動かす言語です。ブラウザでは実行できないため、コードをコピーしてExcelで動かします。" }
  };

  /* 各言語の特徴と使用例（言語タブの下に表示） */
  var LANG_INFO = {
    js: {
      features: [
        "ブラウザがあればどこでも動く（このページもJavaScriptで動いています）",
        "Webページに「動き」をつけるために生まれた言語",
        "今はサーバー側の処理やアプリ開発にも広く使われる"
      ],
      uses: [
        "Webサイトの動き（メニューの開閉、検索候補の表示など）",
        "GmailやGoogleマップのようなWebアプリ",
        "図書館の蔵書検索（OPAC）の画面表示"
      ]
    },
    python: {
      features: [
        "文法がシンプルで読みやすく、初心者が学びやすい",
        "「ライブラリ」と呼ばれる便利な道具箱が豊富",
        "AI・データ分析の分野で標準的に使われている"
      ],
      uses: [
        "AI・機械学習の開発",
        "データ分析・統計処理",
        "事務作業の自動化（ファイル整理、Excel処理など）",
        "InstagramやYouTubeなど大規模サービスの裏側"
      ]
    },
    html: {
      features: [
        "HTMLは文書の「構造」、CSSは「見た目」を書き分ける",
        "厳密にはプログラミング言語ではなく「マークアップ言語」",
        "世界中のすべてのWebページの土台になっている"
      ],
      uses: [
        "あらゆるWebサイト・Webページ",
        "図書館のホームページやOPACの画面",
        "電子書籍（EPUBの中身はHTMLでできている）"
      ]
    },
    sql: {
      features: [
        "データベース専用の言語",
        "「どう取り出すか」ではなく「何が欲しいか」を書くスタイル",
        "約50年使われ続けている世界標準"
      ],
      uses: [
        "図書館システムの蔵書・貸出データの管理",
        "銀行・通販サイトなど、あらゆる業務システム",
        "売上や利用統計の集計・分析"
      ]
    },
    vba: {
      features: [
        "Excelに最初から入っていて、追加のインストールが不要",
        "表計算やOffice製品の操作・自動化に特化",
        "事務の職場で最も身近なプログラミング環境のひとつ"
      ],
      uses: [
        "図書館の利用統計資料づくりの自動化",
        "毎月の定型レポート作成",
        "大量データの転記・整形作業"
      ]
    }
  };

  /* テンプレートに出てくる言葉の役割解説（TEMPLATES と同じ並び順） */
  var WORDS = {
    js: [
      [
        { w: "console.log( )", d: "かっこの中身を結果画面に表示する命令。表示の基本です。" },
        { w: '"こんにちは、図書館！"', d: "引用符 \" \" で囲んだ部分は「文字列（文字のデータ）」として扱われます。" },
        { w: ";", d: "「命令はここまで」という区切りの印。行の終わりにつけます。" }
      ],
      [
        { w: "//", d: "行の説明書き（コメント）。プログラムとしては実行されません。" },
        { w: "const", d: "「変数（値に名前をつけた入れ物）を作ります」という合図です。" },
        { w: "=", d: "右側の値を左側の名前に入れます（数学の「等しい」とは意味が違います）。" },
        { w: "-", d: "引き算の記号。ほかに +（足し算）、*（かけ算）、/（割り算）が使えます。" },
        { w: "+", d: "console.log の中では、文字列と変数を「つなげる」働きをしています。" }
      ],
      [
        { w: "[ ]", d: "配列（複数の値を順番に並べた入れ物）。ここには3冊分のタイトルが入っています。" },
        { w: "for (let i = 0; ...)", d: "「くり返し」の命令。（開始; 続ける条件; 1回ごとの変化）の順に書きます。" },
        { w: "i < 蔵書.length", d: "「i が配列の個数より小さい間」くり返すという条件。length は個数のことです。" },
        { w: "i++", d: "「i を1増やす」という意味。くり返すたびに実行されます。" },
        { w: "蔵書[i]", d: "配列の i 番目の値。番号を 0 から数えるのがポイントです。" },
        { w: "{ }", d: "くり返す範囲（処理のまとまり）を波かっこで囲みます。" }
      ],
      [
        { w: "if (条件)", d: "「もし条件が成り立つなら { } の中を実行する」という命令です。" },
        { w: ">", d: "「より大きい」の比較。ほかに <（より小さい）、>=（以上）、===（等しい）があります。" },
        { w: "else", d: "「そうでなければ」。条件が成り立たなかったときの処理を書きます。" },
        { w: "*", d: "かけ算の記号。延滞日数 × 10円 を計算しています。" }
      ],
      [
        { w: "function 延滞金(日数)", d: "処理のまとまりに名前をつけたもの（関数）。「日数」は受け取る値の受け皿（引数）です。" },
        { w: "return", d: "計算した結果を、関数を呼び出した場所へ返します。" },
        { w: "延滞金(3)", d: "関数の呼び出し。かっこに渡した 3 が「日数」に入って計算されます。" }
      ]
    ],
    python: [
      [
        { w: "print( )", d: "かっこの中身を結果画面に表示する命令。表示の基本です。" },
        { w: '"こんにちは、図書館！"', d: "引用符 \" \" で囲んだ部分は「文字列（文字のデータ）」として扱われます。" }
      ],
      [
        { w: "#", d: "行の説明書き（コメント）。プログラムとしては実行されません。" },
        { w: "=", d: "右側の値を左側の名前に入れて「変数」を作ります。" },
        { w: "print(a, b, c)", d: "コンマで区切ると、複数の値を空白をはさんで並べて表示できます。" }
      ],
      [
        { w: "[ ]", d: "リスト（複数の値を順番に並べた入れ物）。ここには3冊分のタイトルが入っています。" },
        { w: "for ... in ... :", d: "リストから1つずつ値を取り出しながらくり返す命令です。" },
        { w: "enumerate(蔵書, 1)", d: "値に 1 から始まる番号をつけて取り出します。" },
        { w: "字下げ（インデント）", d: "行頭の空白で「くり返す範囲」を表します。Pythonの大事なルールです。" }
      ],
      [
        { w: "if 条件:", d: "「もし条件が成り立つなら、字下げした部分を実行する」という命令です。" },
        { w: ">", d: "「より大きい」の比較。ほかに <（より小さい）、>=（以上）、==（等しい）があります。" },
        { w: "else:", d: "「そうでなければ」。条件が成り立たなかったときの処理を書きます。" },
        { w: "字下げ（インデント）", d: "行頭の空白で「if のときに実行する範囲」を表します。" }
      ],
      [
        { w: "( , )", d: "タプル（値の組）。タイトルと著者を1セットにしています。" },
        { w: "{ }", d: "辞書（dict）。「キー → 値」のペアで覚える入れ物です。" },
        { w: ".get(著者, 0)", d: "辞書から著者の冊数を取り出します。まだ登録がなければ 0 を使います。" },
        { w: ".items()", d: "辞書の中身を「キーと値」のペアで1つずつ取り出します。" }
      ]
    ],
    html: [
      [
        { w: "<h1>", d: "一番大きな見出し（heading）のタグです。" },
        { w: "<p>", d: "段落（paragraph）のタグ。ふつうの文章はこれで囲みます。" },
        { w: "</h1>", d: "「/」つきは終わりタグ。「見出しはここまで」を表します。" }
      ],
      [
        { w: "<h2>", d: "2番目の大きさの見出し。h1〜h6 まであります。" },
        { w: "<ul>", d: "箇条書きリスト全体（unordered list）を表すタグです。" },
        { w: "<li>", d: "リストの1項目（list item）。ul の中に並べます。" }
      ],
      [
        { w: "<table>", d: "表全体を表すタグです。" },
        { w: "<tr>", d: "表の1行（table row）です。" },
        { w: "<th>", d: "見出しのセル（table header）。太字・中央寄せになります。" },
        { w: "<td>", d: "データのセル（table data）です。" },
        { w: 'border="1"', d: "タグに条件を足す「属性」。ここでは表に枠線をつけています。" }
      ],
      [
        { w: "<style>", d: "この中に CSS（見た目のルール）を書きます。" },
        { w: "h1 { color: ...; }", d: "「どこを { 何を: どうする; }」が CSS の基本形。h1 の文字色を変えています。" },
        { w: ".card", d: "「class が card の要素」という意味。先頭のピリオドが目印です。" },
        { w: "padding", d: "枠の内側の余白を指定します。" },
        { w: "border-radius", d: "角の丸みを指定します。" },
        { w: '<div class="card">', d: "内容をまとめる「箱」のタグ。class で名前をつけて CSS から指定します。" }
      ],
      [
        { w: "border", d: "枠線の太さ・種類・色をまとめて指定します。" },
        { w: "max-width", d: "幅の上限。画面が広くても、これ以上は広がりません。" },
        { w: "font-family", d: "文字の書体（フォント）を指定します。" },
        { w: ".info h2", d: "「.info の中の h2 だけ」にルールを当てる書き方です。" }
      ]
    ],
    sql: [
      [
        { w: "SELECT", d: "「データを取り出す」という命令。SQLで最もよく使います。" },
        { w: "*", d: "「すべての列」という意味の記号です。" },
        { w: "FROM books", d: "「books（書籍）の表から」取り出す、という指定です。" },
        { w: ";", d: "「文はここまで」という区切りの印です。" }
      ],
      [
        { w: "SELECT title, year", d: "列の名前をコンマで並べると、その列だけを取り出せます。" },
        { w: "WHERE", d: "条件に合う行だけに絞り込みます。" },
        { w: ">=", d: "「以上」の比較。1910年以降の本に絞っています。" },
        { w: "ORDER BY", d: "指定した列で並べ替えます（そのままだと小さい順）。" }
      ],
      [
        { w: "JOIN ... ON ...", d: "2つの表をつなげます。ON には「どの列を合わせるか」の条件を書きます。" },
        { w: "books.title", d: "「表名.列名」の書き方。どの表の列かをはっきりさせます。" }
      ],
      [
        { w: "GROUP BY", d: "同じ値ごとに行をまとめます（ここでは著者ごと）。" },
        { w: "COUNT(*)", d: "まとめたグループの中の行数を数えます。" },
        { w: "AS 冊数", d: "結果の列にわかりやすい名前をつけます。" },
        { w: "DESC", d: "大きい順（降順）に並べ替えます。" }
      ],
      [
        { w: "JOIN を3回", d: "JOIN は何回も重ねられます。貸出 → 所蔵 → 書籍 → 利用者と表をつないでいます。" },
        { w: "loans.user_no = users.student_no", d: "列の名前が違っても、同じ意味の列どうしならつなげられます。" }
      ]
    ],
    vba: [
      [
        { w: "Sub あいさつ( )", d: "マクロ（処理のまとまり）の始まり。End Sub までが1つのマクロです。" },
        { w: "MsgBox", d: "メッセージの小窓を画面に出す命令です。" },
        { w: "End Sub", d: "「マクロはここまで」という終わりの印です。" }
      ],
      [
        { w: "Cells(行, 列)", d: "セルを番号で指定します。Cells(1, 1) は A1 のことです。" },
        { w: ".Value", d: "そのセルの「中身（値）」を表します。" },
        { w: "=", d: "右側の値を左側（セル）に入れます。" }
      ],
      [
        { w: "Dim i As Integer", d: "「整数を入れる変数 i を使います」という宣言です。" },
        { w: "For i = 1 To 5", d: "i を 1 から 5 まで変えながらくり返します。" },
        { w: "Next i", d: "「くり返しの範囲はここまで」という印です。" },
        { w: "&", d: "文字をつなげる記号。数値と文字もつなげられます。" }
      ],
      [
        { w: "If ... Then", d: "「もし条件が成り立つなら」という条件分岐の始まりです。" },
        { w: "Else", d: "「そうでなければ」の処理を書きます。" },
        { w: "End If", d: "「条件分岐はここまで」という終わりの印です。" },
        { w: "*", d: "かけ算の記号。延滞日数 × 10円 を計算しています。" }
      ]
    ]
  };

  var DEBOUNCE_MS = 550;

  /* ============================================================
     2. 画面要素と状態
     ============================================================ */

  var el = {
    tabs: [],
    lead: document.getElementById("langLead"),
    kicker: document.getElementById("langKicker"),
    templateSelect: document.getElementById("templateSelect"),
    runBtn: document.getElementById("runBtn"),
    resetBtn: document.getElementById("resetBtn"),
    copyBtn: document.getElementById("copyBtn"),
    editor: document.getElementById("editor"),
    explain: document.getElementById("codeExplain"),
    wordList: document.getElementById("wordList"),
    wordItems: document.getElementById("wordItems"),
    langInfoSummary: document.getElementById("langInfoSummary"),
    langFeatures: document.getElementById("langFeatures"),
    langUses: document.getElementById("langUses"),
    status: document.getElementById("resultStatus"),
    consoleOut: document.getElementById("consoleOut"),
    htmlPreview: document.getElementById("htmlPreview"),
    sqlResult: document.getElementById("sqlResult"),
    vbaResult: document.getElementById("vbaResult"),
    sqlSchema: document.getElementById("sqlSchema")
  };

  var state = {
    lang: "js",
    templateIndex: 0,
    code: {},                 // 言語ごとの入力内容を保持（タブを切り替えても消えない）
    templateIndexByLang: {},  // 言語ごとに最後に選んだテンプレ番号
    runSeq: 0,
    debounceTimer: null,
    initialized: false        // 最初の switchLang までは「現在の入力の保存」をしない
  };

  /* ============================================================
     3. 状態ピル
     ============================================================ */

  function setStatus(text, kind) {
    el.status.textContent = text;
    el.status.classList.remove("is-busy", "is-error", "is-ok");
    if (kind) el.status.classList.add(kind);
  }

  /* ============================================================
     4. JavaScript ランナー（Web Worker）
     ============================================================ */

  function jsWorkerBody() {
    self.onmessage = function (e) {
      var logs = [];
      function fmt(args) {
        return Array.prototype.map.call(args, function (x) {
          if (typeof x === "string") return x;
          if (typeof x === "undefined") return "undefined";
          if (x === null) return "null";
          try { return JSON.stringify(x); } catch (_) { return String(x); }
        }).join(" ");
      }
      var sandboxConsole = {
        log: function () { logs.push({ t: "log", m: fmt(arguments) }); },
        info: function () { logs.push({ t: "log", m: fmt(arguments) }); },
        debug: function () { logs.push({ t: "log", m: fmt(arguments) }); },
        warn: function () { logs.push({ t: "warn", m: fmt(arguments) }); },
        error: function () { logs.push({ t: "error", m: fmt(arguments) }); }
      };
      try {
        var fn = new Function("console", e.data);
        fn(sandboxConsole);
        self.postMessage({ ok: true, logs: logs });
      } catch (err) {
        var msg = err && err.message ? err.message : String(err);
        var name = err && err.name ? err.name : "Error";
        self.postMessage({ ok: false, logs: logs, error: name + ": " + msg });
      }
    };
  }

  function pyWorkerBody() {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");
    var pyReady = null;
    function getPy() {
      if (!pyReady) { pyReady = loadPyodide(); }
      return pyReady;
    }
    function simplifyPyError(msg) {
      // Pyodideのトレースバックから、最後のエラー行だけを取り出して読みやすくする
      var lines = String(msg).split("\n").filter(function (l) { return l.trim() !== ""; });
      for (var i = lines.length - 1; i >= 0; i--) {
        if (/Error/.test(lines[i]) || /Exception/.test(lines[i])) { return lines[i].trim(); }
      }
      return lines.length ? lines[lines.length - 1].trim() : String(msg);
    }
    self.onmessage = async function (e) {
      var py;
      try {
        py = await getPy();
      } catch (loadErr) {
        self.postMessage({ ok: false, fatal: true, error: "Pythonの読み込みに失敗しました。ネット接続を確認してください。" });
        return;
      }
      var out = "";
      py.setStdout({ batched: function (s) { out += s; } });
      py.setStderr({ batched: function (s) { out += s; } });
      var globals;
      try {
        globals = py.runPython("dict()");
        await py.runPythonAsync(e.data, { globals: globals });
        self.postMessage({ ok: true, out: out });
      } catch (err) {
        var msg = err && err.message ? err.message : String(err);
        self.postMessage({ ok: false, out: out, error: simplifyPyError(msg) });
      } finally {
        if (globals && globals.destroy) { try { globals.destroy(); } catch (_) {} }
      }
    };
  }

  function bodyToWorker(fn) {
    var src = "(" + fn.toString() + ")();";
    var blob = new Blob([src], { type: "application/javascript" });
    return new Worker(URL.createObjectURL(blob));
  }

  var jsWorker = null;
  var jsTimer = null;

  function runJs(code, seq) {
    if (jsWorker) { jsWorker.terminate(); jsWorker = null; }
    if (jsTimer) { clearTimeout(jsTimer); jsTimer = null; }

    var worker;
    try {
      worker = bodyToWorker(jsWorkerBody);
    } catch (e) {
      renderConsole([{ t: "error", m: "実行環境を作れませんでした: " + e.message }]);
      setStatus("エラー", "is-error");
      return;
    }
    jsWorker = worker;

    jsTimer = setTimeout(function () {
      if (jsWorker === worker) {
        worker.terminate();
        jsWorker = null;
        if (seq !== state.runSeq || state.lang !== "js") return;
        renderConsole([{ t: "error", m: "実行に時間がかかりすぎたため止めました。くり返し（ループ）が終わらなくなっていないか確認してください。" }]);
        setStatus("中断", "is-error");
      }
    }, 2000);

    worker.onmessage = function (ev) {
      clearTimeout(jsTimer); jsTimer = null;
      worker.terminate();
      if (jsWorker === worker) jsWorker = null;
      if (seq !== state.runSeq || state.lang !== "js") return;

      var data = ev.data || {};
      var lines = (data.logs || []).slice();
      if (!data.ok && data.error) {
        lines.push({ t: "error", m: data.error });
      }
      renderConsole(lines);
      setStatus(data.ok ? "完了" : "エラー", data.ok ? "is-ok" : "is-error");
    };

    worker.onerror = function (err) {
      clearTimeout(jsTimer); jsTimer = null;
      worker.terminate();
      if (jsWorker === worker) jsWorker = null;
      if (seq !== state.runSeq || state.lang !== "js") return;
      renderConsole([{ t: "error", m: "エラー: " + (err.message || "実行に失敗しました") }]);
      setStatus("エラー", "is-error");
    };

    setStatus("実行中…", "is-busy");
    worker.postMessage(code);
  }

  /* ============================================================
     5. Python ランナー（Pyodide / Web Worker）
     ============================================================ */

  var pyWorker = null;
  var pyLoaded = false;
  var pyTimer = null;

  function ensurePyWorker() {
    if (pyWorker) return pyWorker;
    pyWorker = bodyToWorker(pyWorkerBody);
    pyLoaded = false;
    return pyWorker;
  }

  function runPython(code, seq) {
    var worker;
    try {
      worker = ensurePyWorker();
    } catch (e) {
      renderConsole([{ t: "error", m: "Python実行環境を作れませんでした: " + e.message }]);
      setStatus("エラー", "is-error");
      return;
    }

    if (pyTimer) { clearTimeout(pyTimer); pyTimer = null; }

    // 初回は読み込みに時間がかかるので長め、2回目以降は短め
    var limit = pyLoaded ? 6000 : 30000;
    pyTimer = setTimeout(function () {
      if (pyWorker === worker) {
        worker.terminate();
        pyWorker = null;
        pyLoaded = false;
      }
      if (seq !== state.runSeq || state.lang !== "python") return;
      renderConsole([{ t: "error", m: pyLoaded
        ? "実行に時間がかかりすぎたため止めました。くり返し（ループ）が終わらなくなっていないか確認してください。"
        : "Pythonの準備に時間がかかっています。ネット接続を確認し、もう一度実行してください。" }]);
      setStatus("中断", "is-error");
    }, limit);

    worker.onmessage = function (ev) {
      clearTimeout(pyTimer); pyTimer = null;
      var data = ev.data || {};
      if (data.fatal) {
        if (pyWorker === worker) { worker.terminate(); pyWorker = null; pyLoaded = false; }
        if (seq !== state.runSeq || state.lang !== "python") return;
        renderConsole([{ t: "error", m: data.error || "Pythonの読み込みに失敗しました。" }]);
        setStatus("エラー", "is-error");
        return;
      }
      pyLoaded = true;
      if (seq !== state.runSeq || state.lang !== "python") return;

      var lines = [];
      var text = (data.out || "");
      if (text) {
        text.replace(/\n+$/, "").split("\n").forEach(function (l) { lines.push({ t: "log", m: l }); });
      }
      if (!data.ok && data.error) {
        lines.push({ t: "error", m: data.error });
      }
      renderConsole(lines);
      setStatus(data.ok ? "完了" : "エラー", data.ok ? "is-ok" : "is-error");
    };

    worker.onerror = function (err) {
      clearTimeout(pyTimer); pyTimer = null;
      if (pyWorker === worker) { worker.terminate(); pyWorker = null; pyLoaded = false; }
      if (seq !== state.runSeq || state.lang !== "python") return;
      renderConsole([{ t: "error", m: "エラー: " + (err.message || "実行に失敗しました") }]);
      setStatus("エラー", "is-error");
    };

    setStatus(pyLoaded ? "実行中…" : "Pythonを準備中…（初回のみ）", "is-busy");
    worker.postMessage(code);
  }

  /* ============================================================
     6. HTML / CSS ランナー（iframe）
     ============================================================ */

  function runHtml(code) {
    el.htmlPreview.srcdoc =
      '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">' +
      '<style>body{font-family:-apple-system,"Hiragino Sans","Yu Gothic",sans-serif;margin:12px;color:#2c3e50;line-height:1.6;}</style>' +
      "</head><body>" + code + "</body></html>";
    setStatus("表示中", "is-ok");
  }

  /* ============================================================
     7. SQL ランナー（sql.js）
     ============================================================ */

  var sqlReady = null;   // initSqlJs の Promise
  var SQLModule = null;

  function loadScriptOnce(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-src="' + src + '"]');
      if (existing) {
        if (existing.getAttribute("data-loaded") === "1") { resolve(); return; }
        existing.addEventListener("load", function () { resolve(); });
        existing.addEventListener("error", function () { reject(new Error("読み込み失敗")); });
        return;
      }
      var s = document.createElement("script");
      s.src = src;
      s.setAttribute("data-src", src);
      s.onload = function () { s.setAttribute("data-loaded", "1"); resolve(); };
      s.onerror = function () { reject(new Error("読み込み失敗")); };
      document.head.appendChild(s);
    });
  }

  function ensureSql() {
    if (sqlReady) return sqlReady;
    sqlReady = loadScriptOnce("https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.js")
      .then(function () {
        return initSqlJs({
          locateFile: function (f) { return "https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/" + f; }
        });
      })
      .then(function (SQL) { SQLModule = SQL; return SQL; });
    return sqlReady;
  }

  function runSql(code, seq) {
    setStatus("データベースを準備中…", "is-busy");
    ensureSql().then(function (SQL) {
      if (seq !== state.runSeq || state.lang !== "sql") return;
      // 毎回まっさらなデータから実行する（結果が常に同じになるように）
      var db = new SQL.Database();
      try {
        db.run(SQL_SEED);
        var results = db.exec(code);
        renderSql(results);
        setStatus("完了", "is-ok");
      } catch (err) {
        renderRunError(el.sqlResult, "SQLエラー: " + (err.message || String(err)));
        setStatus("エラー", "is-error");
      } finally {
        db.close();
      }
    }).catch(function () {
      if (seq !== state.runSeq || state.lang !== "sql") return;
      renderRunError(el.sqlResult, "データベースの読み込みに失敗しました。ネット接続を確認してください。");
      setStatus("エラー", "is-error");
    });
  }

  /* ============================================================
     8. Excel VBA（実行せず、想定出力とコピー手順を表示）
     ============================================================ */

  function renderVba() {
    var tpl = TEMPLATES.vba[state.templateIndex] || TEMPLATES.vba[0];
    var edited = el.editor.value.trim() !== (tpl.code || "").trim();

    el.vbaResult.innerHTML = "";

    var h = document.createElement("h3");
    h.textContent = "Excelで実行すると…";
    el.vbaResult.appendChild(h);

    var out = document.createElement("pre");
    out.className = "vba-output";
    out.textContent = tpl.expected || "（このテンプレートの想定出力は用意されていません）";
    el.vbaResult.appendChild(out);

    if (edited) {
      var note = document.createElement("p");
      note.className = "vba-note";
      note.textContent = "※ 上の想定出力は、お手本のコードを実行した場合のものです。編集したコードの結果は、実際にExcelで動かして確かめてください。";
      el.vbaResult.appendChild(note);
    }

    var stepsTitle = document.createElement("h3");
    stepsTitle.textContent = "Excelで動かす手順";
    el.vbaResult.appendChild(stepsTitle);

    var steps = document.createElement("ol");
    steps.className = "vba-steps";
    [
      "Excelを開き、「開発」タブ →「Visual Basic」を押す（開発タブが無い場合はオプションで表示する）",
      "メニューの「挿入」→「標準モジュール」を選ぶ",
      "「コードをコピー」ボタンで上のコードをコピーし、白い画面に貼り付ける",
      "キーボードの F5 キー（または「実行」）でマクロを動かす"
    ].forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      steps.appendChild(li);
    });
    el.vbaResult.appendChild(steps);

    setStatus("コピーして実行", "is-ok");
  }

  /* ============================================================
     9. 結果の描画ヘルパ
     ============================================================ */

  function renderConsole(lines) {
    el.consoleOut.innerHTML = "";
    if (!lines || lines.length === 0) {
      var muted = document.createElement("div");
      muted.className = "line-muted";
      muted.textContent = state.lang === "python"
        ? "（出力はありません。print( ) で表示してみましょう）"
        : "（出力はありません。console.log( ) で表示してみましょう）";
      el.consoleOut.appendChild(muted);
      return;
    }
    lines.forEach(function (line) {
      var div = document.createElement("div");
      if (line.t === "error") div.className = "line-error";
      else if (line.t === "warn") div.className = "line-warn";
      div.textContent = line.m;
      el.consoleOut.appendChild(div);
    });
  }

  function renderRunError(container, message) {
    container.innerHTML = "";
    var box = document.createElement("p");
    box.className = "run-error";
    box.textContent = message;
    container.appendChild(box);
  }

  function renderSql(results) {
    el.sqlResult.innerHTML = "";
    if (!results || results.length === 0) {
      var p = document.createElement("p");
      p.className = "sql-meta";
      p.textContent = "（結果は0件でした。条件に合うデータがないか、SELECT文ではない可能性があります）";
      el.sqlResult.appendChild(p);
      return;
    }
    results.forEach(function (res) {
      var meta = document.createElement("p");
      meta.className = "sql-meta";
      meta.textContent = res.values.length + " 件";
      el.sqlResult.appendChild(meta);

      var table = document.createElement("table");
      var thead = document.createElement("thead");
      var htr = document.createElement("tr");
      res.columns.forEach(function (c) {
        var th = document.createElement("th");
        th.textContent = c;
        htr.appendChild(th);
      });
      thead.appendChild(htr);
      table.appendChild(thead);

      var tbody = document.createElement("tbody");
      res.values.forEach(function (row) {
        var tr = document.createElement("tr");
        row.forEach(function (cell) {
          var td = document.createElement("td");
          td.textContent = (cell === null || cell === undefined) ? "(空)" : String(cell);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      el.sqlResult.appendChild(table);
    });
  }

  /* 言語の特徴と使用例を描画 */
  function renderLangInfo(lang) {
    var info = LANG_INFO[lang];
    el.langInfoSummary.textContent = LANGS[lang].label + " はどんな言語？（特徴と使われている場所）";
    el.langFeatures.textContent = "";
    el.langUses.textContent = "";
    if (!info) return;
    info.features.forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      el.langFeatures.appendChild(li);
    });
    info.uses.forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      el.langUses.appendChild(li);
    });
  }

  /* テンプレートに出てくる言葉の解説を描画 */
  function renderWords(lang, index) {
    var words = (WORDS[lang] || [])[index] || [];
    el.wordItems.textContent = "";
    el.wordList.hidden = (words.length === 0);
    words.forEach(function (w) {
      var item = document.createElement("div");
      item.className = "word-item";
      var dt = document.createElement("dt");
      var code = document.createElement("code");
      code.textContent = w.w;
      dt.appendChild(code);
      var dd = document.createElement("dd");
      dd.textContent = w.d;
      item.appendChild(dt);
      item.appendChild(dd);
      el.wordItems.appendChild(item);
    });
  }

  /* 実行結果をすべて消して初期状態に戻す */
  function clearResults() {
    state.runSeq++;  // 実行中の処理が後から結果を描画しないようにする
    if (state.debounceTimer) { clearTimeout(state.debounceTimer); state.debounceTimer = null; }
    el.consoleOut.textContent = "";
    var muted = document.createElement("div");
    muted.className = "line-muted";
    muted.textContent = "（「▶ 実行」を押すと、ここに結果が表示されます）";
    el.consoleOut.appendChild(muted);
    el.htmlPreview.srcdoc = "";
    el.sqlResult.textContent = "";
    el.vbaResult.textContent = "";
    setStatus("準備OK", null);
  }

  /* ============================================================
     10. 実行のふりわけ
     ============================================================ */

  function showResultArea(kind) {
    el.consoleOut.hidden = (kind !== "console");
    el.htmlPreview.hidden = (kind !== "preview");
    el.sqlResult.hidden = (kind !== "sql");
    el.vbaResult.hidden = (kind !== "vba");
    el.sqlSchema.hidden = (kind !== "sql");
  }

  function run() {
    var lang = state.lang;
    var code = el.editor.value;
    state.runSeq++;
    var seq = state.runSeq;

    if (lang === "js") { runJs(code, seq); }
    else if (lang === "python") { runPython(code, seq); }
    else if (lang === "html") { runHtml(code); }
    else if (lang === "sql") { runSql(code, seq); }
    else if (lang === "vba") { renderVba(); }
  }

  function scheduleRun() {
    if (state.debounceTimer) clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(run, DEBOUNCE_MS);
  }

  /* ============================================================
     11. 言語・テンプレートの切り替え
     ============================================================ */

  function fillTemplateOptions(lang) {
    el.templateSelect.innerHTML = "";
    TEMPLATES[lang].forEach(function (tpl, i) {
      var opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = tpl.name;
      el.templateSelect.appendChild(opt);
    });
  }

  function applyTemplate(lang, index) {
    var tpl = TEMPLATES[lang][index];
    el.editor.value = tpl.code;
    state.code[lang] = tpl.code;
    state.templateIndex = index;
    state.templateIndexByLang[lang] = index;
    el.explain.textContent = tpl.explain || "";
    el.templateSelect.value = String(index);
    renderWords(lang, index);
  }

  function switchLang(lang) {
    if (!LANGS[lang]) return;
    // 現在の入力を保存（初回起動時はエディタが空なので保存しない）
    if (state.initialized) {
      state.code[state.lang] = el.editor.value;
    }
    state.lang = lang;

    // タブの見た目
    el.tabs.forEach(function (t) {
      var active = t.getAttribute("data-lang") === lang;
      t.classList.toggle("active", active);
      if (active) t.setAttribute("aria-current", "true");
      else t.removeAttribute("aria-current");
    });

    var cfg = LANGS[lang];
    el.kicker.textContent = cfg.label;
    el.lead.textContent = cfg.lead;
    el.copyBtn.hidden = (lang !== "vba");
    renderLangInfo(lang);

    fillTemplateOptions(lang);

    var idx = state.templateIndexByLang[lang] || 0;
    if (state.code[lang] !== undefined) {
      // 保存済みの入力を復元（テンプレ名・解説は最後に選んだものに合わせる）
      el.editor.value = state.code[lang];
      state.templateIndex = idx;
      el.templateSelect.value = String(idx);
      el.explain.textContent = (TEMPLATES[lang][idx] || {}).explain || "";
      renderWords(lang, idx);
    } else {
      applyTemplate(lang, 0);
    }

    state.initialized = true;
    showResultArea(cfg.kind);
    setStatus("準備OK", null);
    run();
  }

  /* ============================================================
     12. イベント登録
     ============================================================ */

  function bindEvents() {
    el.tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        switchLang(tab.getAttribute("data-lang"));
      });
    });

    el.templateSelect.addEventListener("change", function () {
      var idx = parseInt(el.templateSelect.value, 10) || 0;
      applyTemplate(state.lang, idx);
      run();
    });

    el.editor.addEventListener("input", function () {
      state.code[state.lang] = el.editor.value;
      if (state.lang === "vba") { renderVba(); return; }
      scheduleRun();
    });

    // Tabキーでインデント（フォーカスが外れないように）
    el.editor.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        var start = el.editor.selectionStart;
        var end = el.editor.selectionEnd;
        var v = el.editor.value;
        el.editor.value = v.slice(0, start) + "  " + v.slice(end);
        el.editor.selectionStart = el.editor.selectionEnd = start + 2;
        state.code[state.lang] = el.editor.value;
      }
    });

    el.runBtn.addEventListener("click", run);

    el.resetBtn.addEventListener("click", function () {
      var idx = state.templateIndexByLang[state.lang] || 0;
      applyTemplate(state.lang, idx);
      clearResults();  // コードだけでなく実行結果もリセットする
    });

    el.copyBtn.addEventListener("click", function () {
      var text = el.editor.value;
      function done() {
        el.copyBtn.textContent = "コピーしました ✓";
        setTimeout(function () { el.copyBtn.textContent = "コードをコピー"; }, 1500);
      }
      function fail() {
        el.copyBtn.textContent = "コピーできませんでした";
        setTimeout(function () { el.copyBtn.textContent = "コードをコピー"; }, 1500);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fail);
      } else {
        // 手動コピー用に範囲選択しておく
        el.editor.focus();
        el.editor.select();
        fail();
      }
    });
  }

  /* ============================================================
     13. 起動
     ============================================================ */

  function init() {
    el.tabs = Array.prototype.slice.call(document.querySelectorAll(".lang-tabs .activity-tab"));
    bindEvents();
    switchLang("js");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
