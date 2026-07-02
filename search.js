const SEARCH_DOCUMENTS = [
  {
    id: 'BIB001',
    title: '公共図書館の児童サービス',
    creator: '佐藤 由美',
    publisher: '図書館実務出版',
    year: 2022,
    callNumber: '016.2/Sa85',
    materialType: '図書',
    category: '図書館サービス',
    subjects: ['公共図書館', '児童サービス', '読み聞かせ', '子どもの読書'],
    summary: '公共図書館における子ども向けサービス、読み聞かせ、ブックリスト、学校との連携を扱う入門書。',
    body: '児童サービス、読書支援、地域連携、公共図書館の利用者支援について、実例をもとに解説する。',
    relevanceTerms: ['図書館', '公共図書館', '児童', '子ども', '読書', '読み聞かせ', '学校連携']
  },
  {
    id: 'BIB002',
    title: '大学図書館と学修支援',
    creator: '中村 修',
    publisher: '大学教育社',
    year: 2021,
    callNumber: '017.7/Na37',
    materialType: '図書',
    category: '図書館サービス',
    subjects: ['大学図書館', '学修支援', 'レファレンス', '情報リテラシー'],
    summary: '大学図書館が行うレポート作成支援、文献検索講習、レファレンスサービスをまとめる。',
    body: '大学図書館、学修支援、情報検索、文献管理、電子資料利用の実践例を紹介する。',
    relevanceTerms: ['図書館', '大学図書館', '学修支援', 'レファレンス', '情報検索', '文献']
  },
  {
    id: 'BIB003',
    title: 'OPACとメタデータ入門',
    creator: '伊藤 真理子',
    publisher: '情報組織化研究会',
    year: 2020,
    callNumber: '014.3/It89',
    materialType: '図書',
    category: '情報組織化',
    subjects: ['OPAC', 'メタデータ', '書誌データ', '検索'],
    summary: 'OPACで使われるタイトル、著者、件名、分類、出版情報などのメタデータを学ぶ。',
    body: '書誌データ、典拠、件名、分類、検索インデックスが利用者の資料発見にどう関わるかを説明する。',
    relevanceTerms: ['OPAC', 'メタデータ', '書誌', '検索', '分類', '件名', '図書館']
  },
  {
    id: 'BIB004',
    title: 'レファレンスサービスの実践',
    creator: '小林 麻衣',
    publisher: '司書教育出版',
    year: 2019,
    callNumber: '015.2/Ko12',
    materialType: '図書',
    category: '図書館サービス',
    subjects: ['レファレンスサービス', '利用者支援', '情報探索', '質問応答'],
    summary: '利用者の質問を整理し、資料やデータベースへ導くレファレンスサービスの基本を扱う。',
    body: 'インタビュー、情報源の評価、OPAC検索、データベース検索、回答記録の作成を解説する。',
    relevanceTerms: ['図書館', 'レファレンス', '利用者支援', '情報探索', '検索', 'データベース']
  },
  {
    id: 'BIB005',
    title: '日本十進分類法の基礎',
    creator: '分類法研究会',
    publisher: '目録社',
    year: 2018,
    callNumber: '014.45/B89',
    materialType: '図書',
    category: '情報組織化',
    subjects: ['日本十進分類法', 'NDC', '分類', '配架'],
    summary: '図書館資料を主題に沿って並べるための分類法と、分類記号の読み方を学ぶ。',
    body: 'NDC、分類記号、主題分析、配架、ブラウジング、件名との違いを説明する。',
    relevanceTerms: ['分類', 'NDC', '配架', '図書館', '主題', 'ブラウジング']
  },
  {
    id: 'BIB006',
    title: '学校図書館と探究学習',
    creator: '山田 朋子',
    publisher: '教育情報社',
    year: 2023,
    callNumber: '017/Ya19',
    materialType: '図書',
    category: '教育',
    subjects: ['学校図書館', '探究学習', '情報活用能力', '読書活動'],
    summary: '学校図書館を使って課題を立て、資料を探し、情報を整理する探究学習の事例集。',
    body: '学校図書館、探究学習、メディアリテラシー、読書活動、授業連携の方法を扱う。',
    relevanceTerms: ['学校図書館', '図書館', '探究学習', '教育', '情報活用', '読書']
  },
  {
    id: 'BIB007',
    title: '子どもの読書活動と地域連携',
    creator: '長谷川 彩',
    publisher: '地域教育出版',
    year: 2022,
    callNumber: '019.5/Ha36',
    materialType: '図書',
    category: '教育',
    subjects: ['子どもの読書', '地域連携', '学校', '公共図書館'],
    summary: '学校、家庭、公共図書館、地域団体が連携して子どもの読書活動を支える方法を紹介する。',
    body: '子どもの読書活動、読書推進、学校連携、公共図書館、地域支援の実践をまとめる。',
    relevanceTerms: ['子ども', '読書', '公共図書館', '学校', '地域連携', '図書館']
  },
  {
    id: 'BIB008',
    title: '情報検索システムのしくみ',
    creator: '田中 一郎',
    publisher: '情報技術社',
    year: 2024,
    callNumber: '007.58/Ta84',
    materialType: '図書',
    category: '情報技術',
    subjects: ['情報検索', '検索エンジン', 'Nグラム', 'ランキング'],
    summary: '検索語の分割、索引、ブール演算、ランキングなど、情報検索システムの基本を説明する。',
    body: '情報検索、Nグラム、転置索引、完全一致、部分一致、ランキング、再現率、精度を扱う。',
    relevanceTerms: ['情報検索', '検索', 'Nグラム', 'ブール演算', 'ランキング', '精度', '再現率']
  },
  {
    id: 'BIB009',
    title: '地域資料とデジタルアーカイブ',
    creator: '鈴木 花子',
    publisher: 'アーカイブ研究所',
    year: 2020,
    callNumber: '014.7/Su96',
    materialType: '図書',
    category: '地域資料',
    subjects: ['地域資料', 'デジタルアーカイブ', '写真', '郷土資料'],
    summary: '古写真、地図、新聞記事、観光パンフレットをデジタル化し、地域資料として公開する方法を扱う。',
    body: '地域資料、デジタルアーカイブ、メタデータ、著作権、公開システム、横断検索を説明する。',
    relevanceTerms: ['地域', '地域資料', 'デジタルアーカイブ', '写真', '郷土資料', '検索']
  },
  {
    id: 'BIB010',
    title: '生成AIと情報倫理',
    creator: '青木 健',
    publisher: '情報社会社',
    year: 2024,
    callNumber: '007.3/A53',
    materialType: '電子書籍',
    category: '情報技術',
    subjects: ['生成AI', '情報倫理', '著作権', '大学教育'],
    summary: '生成AIを学習や調査で使う際の利点、リスク、著作権、引用、事実確認を整理する。',
    body: '生成AI、情報倫理、著作権、ファクトチェック、大学教育、レポート作成の注意点を扱う。',
    relevanceTerms: ['AI', '生成AI', '情報倫理', '著作権', '教育', 'レポート', '事実確認']
  },
  {
    id: 'BIB011',
    title: 'メディアリテラシーとニュース評価',
    creator: '森 明日香',
    publisher: 'メディア教育社',
    year: 2021,
    callNumber: '361.45/Mo45',
    materialType: '図書',
    category: 'メディア',
    subjects: ['メディアリテラシー', 'ニュース', 'ファクトチェック', '情報評価'],
    summary: 'ニュース記事を読むときに、情報源、見出し、根拠、画像の文脈を確認する方法を扱う。',
    body: 'メディアリテラシー、情報評価、ファクトチェック、ニュース、検索による裏取りを説明する。',
    relevanceTerms: ['メディア', 'ニュース', 'メディアリテラシー', 'ファクトチェック', '情報評価', '検索']
  },
  {
    id: 'BIB012',
    title: '健康情報リテラシー',
    creator: '医療情報研究会',
    publisher: '生活科学社',
    year: 2019,
    callNumber: '498/I67',
    materialType: '図書',
    category: '生活情報',
    subjects: ['健康情報', '医療情報', '信頼性', '情報リテラシー'],
    summary: '医療や健康に関する情報を読むとき、発信者、根拠、更新日を確認する観点を整理する。',
    body: '健康情報、医療情報、信頼性、専門性、引用、更新日、情報リテラシーを学ぶ。',
    relevanceTerms: ['健康', '医療', '信頼性', '情報リテラシー', '情報評価']
  },
  {
    id: 'BIB013',
    title: '地域防災と情報提供',
    creator: '防災情報センター',
    publisher: '地域安全出版',
    year: 2020,
    callNumber: '369.3/B66',
    materialType: '図書',
    category: '地域社会',
    subjects: ['防災', '災害情報', '避難所', '地域情報'],
    summary: '地震、台風、洪水のときに必要な避難所情報、ハザードマップ、地域情報の提供方法を扱う。',
    body: '防災、災害情報、避難所、ハザードマップ、自治体、地域情報サービスについて解説する。',
    relevanceTerms: ['防災', '災害', '避難所', '地域', '地図', '自治体', '情報提供']
  },
  {
    id: 'BIB014',
    title: '環境問題をデータで読む',
    creator: '環境データ研究会',
    publisher: '社会統計社',
    year: 2022,
    callNumber: '519/Ka56',
    materialType: '図書',
    category: '地域社会',
    subjects: ['環境問題', '気候変動', '統計', 'オープンデータ'],
    summary: '気候変動、省エネルギー、廃棄物などの環境問題をデータで読み解く。',
    body: '環境問題、気候変動、統計、オープンデータ、地域社会、可視化を扱う。',
    relevanceTerms: ['環境', '気候変動', '統計', 'オープンデータ', '地域', '社会']
  },
  {
    id: 'BIB015',
    title: '音楽著作権入門',
    creator: '文化法研究会',
    publisher: '芸術文化社',
    year: 2018,
    callNumber: '021.2/B89',
    materialType: '図書',
    category: 'メディア',
    subjects: ['著作権', '音楽', '配信', '利用許諾'],
    summary: '演奏会、録画配信、教材作成で確認したい音楽著作権と利用許諾の基本をまとめる。',
    body: '音楽、著作権、演奏権、配信、引用、利用許諾、権利処理を説明する。',
    relevanceTerms: ['音楽', '著作権', '配信', 'イベント', 'メディア', '権利']
  },
  {
    id: 'BIB016',
    title: 'スポーツデータ分析入門',
    creator: '加藤 直人',
    publisher: 'データサイエンス出版',
    year: 2023,
    callNumber: '780.1/Ka86',
    materialType: '図書',
    category: '情報技術',
    subjects: ['スポーツ', 'データ分析', '統計', '可視化'],
    summary: '試合結果や選手データを集計し、勝敗傾向をグラフで読むための入門書。',
    body: 'スポーツデータ、統計、ランキング、可視化、比較指標、データ分析を扱う。',
    relevanceTerms: ['スポーツ', 'データ分析', '統計', '可視化', 'ランキング']
  },
  {
    id: 'BIB017',
    title: '電子書籍サービスと図書館',
    creator: '電子資料研究会',
    publisher: '図書館実務出版',
    year: 2021,
    callNumber: '016.7/D59',
    materialType: '電子書籍',
    category: '図書館サービス',
    subjects: ['電子書籍', '図書館サービス', 'ライセンス', 'アクセシビリティ'],
    summary: '公共図書館や大学図書館で導入される電子書籍サービスの特徴とライセンスを比較する。',
    body: '電子書籍、図書館サービス、同時アクセス、貸出期間、読み上げ、アクセシビリティを扱う。',
    relevanceTerms: ['図書館', '電子書籍', 'ライセンス', 'アクセシビリティ', '公共図書館', '大学図書館']
  },
  {
    id: 'BIB018',
    title: '農業IoTと地域産業',
    creator: '地域産業技術研究所',
    publisher: '産業技術社',
    year: 2022,
    callNumber: '614.8/C43',
    materialType: '図書',
    category: '地域社会',
    subjects: ['農業', 'IoT', 'センサー', '地域産業'],
    summary: 'センサー、ドローン、データ分析を使ったスマート農業の仕組みと地域産業への効果を紹介する。',
    body: '農業、IoT、センサー、気象データ、画像解析、地域産業、スマート農業を扱う。',
    relevanceTerms: ['農業', 'IoT', 'センサー', '地域', '産業', 'データ分析']
  },
  {
    id: 'BIB019',
    title: 'Data Mining for Libraries',
    creator: 'Emily Carter',
    publisher: 'Northbridge Academic Press',
    year: 2023,
    callNumber: '025.04/C23',
    materialType: 'eBook',
    category: '情報技術',
    subjects: ['Data mining', 'Library analytics', 'Search logs', 'User behavior'],
    summary: 'An introduction to data mining methods for library usage logs, circulation data, and discovery services.',
    body: 'Data mining, library analytics, search logs, circulation records, dashboards, and privacy-aware evaluation are explained.',
    relevanceTerms: ['data', 'data mining', 'library', 'libraries', 'analytics', 'search logs', '情報検索']
  },
  {
    id: 'BIB020',
    title: 'Dataset Curation Handbook',
    creator: 'Michael Nguyen',
    publisher: 'Open Data Works',
    year: 2022,
    callNumber: '025.17/N69',
    materialType: '図書',
    category: '情報組織化',
    subjects: ['Dataset', 'Data curation', 'Metadata', 'Repository'],
    summary: 'A practical handbook for preparing datasets, metadata records, repository descriptions, and reuse licenses.',
    body: 'Dataset curation, metadata quality, file naming, repository workflows, preservation, and open licenses are covered.',
    relevanceTerms: ['data', 'dataset', 'curation', 'metadata', 'repository', 'preservation']
  },
  {
    id: 'BIB021',
    title: 'Digital Archives and Metadata',
    creator: 'Sarah Williams',
    publisher: 'Heritage Media Lab',
    year: 2021,
    callNumber: '014.7/W74',
    materialType: '図書',
    category: '情報組織化',
    subjects: ['Digital archives', 'Metadata', 'Cultural heritage', 'Access'],
    summary: 'A guide to digital archives, metadata schemas, cultural heritage description, and online access design.',
    body: 'Digital archives, archival metadata, subject access, rights statements, image collections, and discovery interfaces are discussed.',
    relevanceTerms: ['archive', 'archives', 'digital archives', 'metadata', 'cultural heritage', 'access']
  },
  {
    id: 'BIB022',
    title: 'Library Discovery Systems',
    creator: 'James O. Miller',
    publisher: 'Catalog Tech Books',
    year: 2024,
    callNumber: '013.8/M58',
    materialType: 'eBook',
    category: '図書館サービス',
    subjects: ['Library discovery', 'OPAC', 'Discovery layer', 'Relevance ranking'],
    summary: 'An overview of library discovery systems, OPAC integration, facets, relevance ranking, and usability testing.',
    body: 'Library discovery, catalog search, OPAC data, facets, relevance ranking, autocomplete, and user interface evaluation are explained.',
    relevanceTerms: ['library', 'discovery', 'OPAC', 'catalog', 'search', 'ranking', 'facets']
  },
  {
    id: 'BIB023',
    title: 'Open Data for Community Research',
    creator: 'Olivia Brown',
    publisher: 'Civic Research Press',
    year: 2020,
    callNumber: '318.5/B77',
    materialType: '図書',
    category: '地域社会',
    subjects: ['Open data', 'Community research', 'Civic technology', 'Statistics'],
    summary: 'A beginner-friendly text on finding, cleaning, and visualizing open data for community research projects.',
    body: 'Open data portals, community research, civic technology, statistics, data cleaning, visualization, and local policy questions are introduced.',
    relevanceTerms: ['open data', 'data', 'community', 'statistics', 'visualization', '地域', 'オープンデータ']
  }
];

const CATEGORIES = [
  { id: 'government', name: '行政・公的情報' },
  { id: 'business', name: '企業・商品サービス' },
  { id: 'personal', name: '個人・ブログ' },
  { id: 'npo', name: 'NPO・市民活動' },
  { id: 'education', name: '学校・教育' },
  { id: 'health', name: '医療・健康' },
  { id: 'culture', name: '文化・歴史' },
  { id: 'shop', name: '地域商店・飲食' },
  { id: 'technology', name: '技術・研究' },
  { id: 'event', name: 'イベント・観光' },
  { id: 'environment', name: '環境・防災' },
  { id: 'library', name: '図書館・情報サービス' }
];

const DIRECTORY_PAGES = [
  {
    id: 'PAGE001',
    title: '長久手市 ごみ分別ミニガイド',
    url: 'dummy-pages/city-waste-guide.html',
    creator: '長久手市環境課',
    ownerType: '公的機関',
    audience: '市民、転入者、自治会',
    updated: '2026-04-01',
    summary: '家庭ごみ、資源回収、粗大ごみ予約、リサイクル拠点を案内する市役所のページ。',
    keywords: ['行政', 'ごみ分別', '生活情報', '環境', 'リサイクル']
  },
  {
    id: 'PAGE002',
    title: 'サクラツールズ株式会社 小型3Dプリンタ案内',
    url: 'dummy-pages/sakura-tools.html',
    creator: '株式会社Sakura Tools',
    ownerType: '企業',
    audience: '学校の情報担当教員、地域工房、試作担当者',
    updated: '2026-03-15',
    summary: '授業や地域工房で使う小型3Dプリンタを紹介する企業の商品ページ。',
    keywords: ['企業', '商品', '教育機器', '3Dプリンタ', '試作']
  },
  {
    id: 'PAGE003',
    title: '静かな本棚日記',
    url: 'dummy-pages/quiet-books-diary.html',
    creator: '読書好きの個人運営者',
    ownerType: '個人',
    audience: '読書記録を探す人、地域史に関心がある人',
    updated: '2026-02-18',
    summary: '郷土資料、古い商店街の記憶、最近読んだ本をゆるく記録する個人ブログ。',
    keywords: ['個人ブログ', '読書', '地域史', '郷土資料', '書評']
  },
  {
    id: 'PAGE004',
    title: 'NPO法人みどり川ネット 清掃ボランティア募集',
    url: 'dummy-pages/green-river-npo.html',
    creator: 'NPO法人みどり川ネット',
    ownerType: 'NPO',
    audience: 'ボランティア希望者、地域住民、学校関係者',
    updated: '2026-05-02',
    summary: '川の清掃、外来植物調査、親子観察会を行うNPOの活動紹介ページ。',
    keywords: ['NPO', '環境保全', '市民活動', 'ボランティア', '自然観察']
  },
  {
    id: 'PAGE005',
    title: 'みらい中学校 図書委員会だより',
    url: 'dummy-pages/mirai-junior-library.html',
    creator: 'みらい中学校図書館',
    ownerType: '学校',
    audience: '生徒、保護者、教職員',
    updated: '2026-04-24',
    summary: '新着本、探究学習コーナー、昼休みイベントを知らせる学校図書館のページ。',
    keywords: ['学校', '学校図書館', '教育', '読書', '探究学習']
  },
  {
    id: 'PAGE006',
    title: 'ウェルネス睡眠クリニック',
    url: 'dummy-pages/wellness-sleep-clinic.html',
    creator: 'ウェルネス睡眠クリニック',
    ownerType: '医療機関',
    audience: '睡眠に悩む人、働く世代、家族',
    updated: '2026-01-30',
    summary: '睡眠外来、生活習慣の見直し、相談予約の流れを案内する医療機関のページ。',
    keywords: ['医療', '健康', '睡眠', 'クリニック', '生活習慣']
  },
  {
    id: 'PAGE007',
    title: '西町郷土資料館 企画展「台所の道具」',
    url: 'dummy-pages/town-folk-museum.html',
    creator: '西町郷土資料館',
    ownerType: '文化施設',
    audience: '地域住民、観光客、調べ学習の児童生徒',
    updated: '2026-03-28',
    summary: '古写真、農具、祭礼資料、聞き書き記録を展示する文化施設の案内ページ。',
    keywords: ['文化施設', '郷土資料', '歴史', '展示', '観光']
  },
  {
    id: 'PAGE008',
    title: 'ひなたベーカリー 季節のパン',
    url: 'dummy-pages/hinata-bakery.html',
    creator: 'ひなたベーカリー',
    ownerType: '地域商店',
    audience: '近隣住民、親子連れ、朝食を買う人',
    updated: '2026-05-10',
    summary: '地元野菜のパン、親子パン教室、商店街イベント出店を紹介する店のページ。',
    keywords: ['地域商店', '食品', 'パン', '親子イベント', '商店街']
  },
  {
    id: 'PAGE009',
    title: 'Code and Catalog',
    url: 'dummy-pages/code-and-catalog.html',
    creator: '図書館システム担当者の技術ブログ',
    ownerType: '個人・専門ブログ',
    audience: '司書、情報システム担当、学生',
    updated: '2026-04-16',
    summary: 'OPAC、メタデータ、検索ログ分析、図書館システムの改善を扱う技術ブログ。',
    keywords: ['技術ブログ', 'OPAC', 'メタデータ', '情報検索', '図書館システム']
  },
  {
    id: 'PAGE010',
    title: '星丘ナイトマーケット2026',
    url: 'dummy-pages/night-market-2026.html',
    creator: '星丘商店街振興組合',
    ownerType: 'イベント実行委員会',
    audience: '地域住民、観光客、出店希望者',
    updated: '2026-05-07',
    summary: '夜市、音楽ステージ、地域商店の出店、交通規制を知らせるイベントページ。',
    keywords: ['イベント', '観光', '地域商店', '音楽', '交通案内']
  }
];

const MODE_DETAILS = {
  partial: {
    name: '部分一致',
    sample: '図書館',
    explanation: '検索語が選択した検索対象に含まれていればヒットします。タイトルだけ、内容紹介まで含める、件名・キーワードまで含める、という範囲の違いを比べられます。'
  },
  exact: {
    name: '完全一致',
    sample: '公共図書館の児童サービス',
    explanation: '選択した検索対象の値と検索語が完全に一致した書誌だけを返します。語の揺れには弱いですが、条件は明確です。'
  },
  ngram: {
    name: 'Nグラム',
    sample: '情報検索',
    explanation: '検索語をN文字ずつに分け、分割された文字列が選択した検索対象に含まれるかを見ます。日本語のように語の区切りが見えにくい文章で使われます。'
  },
  boolean: {
    name: 'ブール演算',
    sample: '図書館',
    explanation: 'ANDは両方、ORはいずれか、NOTは語Aを含み語Bを含まない結果を返します。検索範囲を論理的に広げたり狭めたりできます。'
  },
  phrase: {
    name: 'フレーズ',
    sample: '地域資料',
    explanation: '入力した文字列をひとかたまりとして、その順番のまま含む書誌を探します。語順が重要な固有表現や熟語に向いています。'
  },
  wildcard: {
    name: 'ワイルドカード',
    sample: 'data*',
    explanation: '* は0文字以上、? は任意の1文字として扱います。前方一致や後方一致に近い検索を体験できます。'
  },
  associative: {
    name: '連想検索',
    sample: '子ども',
    explanation: '入力語そのものだけでなく、あらかじめ関連語として登録した語にも広げて検索します。検索漏れを減らせますが、説明可能性が重要になります。'
  }
};

const ASSOCIATIONS = {
  '子ども': ['児童', '学校図書館', '読み聞かせ', '読書活動', '教育'],
  '図書館': ['公共図書館', '大学図書館', '学校図書館', '電子書籍', 'レファレンス', 'OPAC', '分類', '件名'],
  '防災': ['災害', '避難所', '地図', '地域'],
  '健康': ['医療', '信頼性', '情報リテラシー'],
  'AI': ['生成AI', '情報倫理', '大学教育'],
  '地域': ['地域資料', '防災', '自治体', 'オープンデータ', '地域産業'],
  '検索': ['情報検索', 'OPAC', 'Nグラム', 'ブール演算', 'ランキング', '精度', '再現率']
};

let currentMode = 'partial';
let directoryAssignments = Object.fromEntries(DIRECTORY_PAGES.map(page => [page.id, '']));

const activityButtons = Array.from(document.querySelectorAll('.activity-tab'));
const activityPanels = Array.from(document.querySelectorAll('.activity-panel'));
const modeButtons = Array.from(document.querySelectorAll('.method-tab'));
const searchForm = document.getElementById('searchForm');
const searchQuery = document.getElementById('searchQuery');
const scopeBody = document.getElementById('scopeBody');
const scopeSubjects = document.getElementById('scopeSubjects');
const normalFields = document.getElementById('normalFields');
const booleanFields = document.getElementById('booleanFields');
const ngramFields = document.getElementById('ngramFields');
const booleanA = document.getElementById('booleanA');
const booleanB = document.getElementById('booleanB');
const booleanOperator = document.getElementById('booleanOperator');
const ngramSize = document.getElementById('ngramSize');
const resultList = document.getElementById('resultList');
const tokenZone = document.getElementById('tokenZone');
const vennZone = document.getElementById('vennZone');

activityButtons.forEach(button => {
  button.addEventListener('click', () => {
    activityButtons.forEach(candidate => candidate.classList.toggle('active', candidate === button));
    activityPanels.forEach(panel => {
      panel.hidden = panel.id !== button.dataset.activity;
    });
  });
});

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function searchFields(doc) {
  const fields = [
    { name: 'タイトル', value: doc.title, weight: 5, kind: 'title' }
  ];

  if (scopeBody.checked) {
    fields.push({
      name: '内容紹介',
      value: `${doc.summary} ${doc.body}`,
      weight: 2,
      kind: 'body'
    });
  }

  if (scopeSubjects.checked) {
    fields.push({
      name: '件名・キーワード',
      value: doc.subjects.join(' '),
      weight: 4,
      kind: 'subjects'
    });
  }

  return fields;
}

function fullRecordText(doc) {
  return [
    doc.title,
    doc.creator,
    doc.publisher,
    doc.year,
    doc.callNumber,
    doc.materialType,
    doc.category,
    doc.subjects.join(' '),
    doc.summary,
    doc.body,
    doc.relevanceTerms.join(' ')
  ].join(' ');
}

function searchableText(doc) {
  return searchFields(doc).map(field => field.value).join(' ');
}

function containsTerm(doc, term) {
  const normalized = normalizeText(term).trim();
  if (!normalized) return false;
  return normalizeText(searchableText(doc)).includes(normalized);
}

function recordContainsTerm(doc, term) {
  const normalized = normalizeText(term).trim();
  if (!normalized) return false;
  return normalizeText(fullRecordText(doc)).includes(normalized);
}

function scoreDirectMatch(doc, term) {
  const normalized = normalizeText(term).trim();
  if (!normalized) return 0;
  return searchFields(doc).reduce((score, field) => (
    normalizeText(field.value).includes(normalized) ? score + field.weight : score
  ), 0);
}

function searchPartial(query) {
  const term = query.trim();
  if (!term) return [];
  return SEARCH_DOCUMENTS
    .map(doc => {
      const score = scoreDirectMatch(doc, term);
      return {
        doc,
        score,
        terms: [term],
        reasons: buildFieldReasons(doc, term)
      };
    })
    .filter(result => result.score > 0);
}

function searchExact(query) {
  const term = query.trim();
  if (!term) return [];
  return SEARCH_DOCUMENTS
    .map(doc => {
      const exactFields = [];
      searchFields(doc).forEach(field => {
        if (field.kind === 'subjects') {
          doc.subjects.forEach(subject => {
            if (subject === term) exactFields.push(`件名・キーワード「${subject}」`);
          });
        } else if (field.value === term) {
          exactFields.push(field.name);
        }
      });
      return {
        doc,
        score: exactFields.length * 10,
        terms: [term],
        reasons: exactFields.map(field => `${field}が完全一致`)
      };
    })
    .filter(result => result.score > 0);
}

function searchPhrase(query) {
  const phrase = query.trim();
  if (!phrase) return [];
  return SEARCH_DOCUMENTS
    .map(doc => {
      const score = scoreDirectMatch(doc, phrase);
      return {
        doc,
        score,
        terms: [phrase],
        reasons: score > 0 ? [`「${phrase}」が同じ順番で出現`] : []
      };
    })
    .filter(result => result.score > 0);
}

function makeNgrams(value, size) {
  const text = value.replace(/\s+/g, '');
  if (!text) return [];
  if (text.length <= size) return [text];
  const grams = [];
  for (let i = 0; i <= text.length - size; i += 1) {
    grams.push(text.slice(i, i + size));
  }
  return Array.from(new Set(grams));
}

function searchNgram(query) {
  const size = Number(ngramSize.value);
  const grams = makeNgrams(query.trim(), size);
  if (grams.length === 0) return [];
  return SEARCH_DOCUMENTS
    .map(doc => {
      const matched = grams.filter(gram => containsTerm(doc, gram));
      return {
        doc,
        score: matched.length,
        terms: matched,
        reasons: matched.map(gram => `${size}グラム「${gram}」が一致`)
      };
    })
    .filter(result => result.score > 0);
}

function wildcardToRegExp(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(escaped, 'i');
}

function searchWildcard(query) {
  const pattern = query.trim();
  if (!pattern) return [];
  let regex;
  try {
    regex = wildcardToRegExp(pattern);
  } catch (error) {
    return [];
  }
  const plainTerms = pattern.split(/[*?]+/).filter(Boolean);
  return SEARCH_DOCUMENTS
    .map(doc => {
      const matchedFields = searchFields(doc)
        .filter(field => regex.test(field.value))
        .map(field => field.name);
      return {
        doc,
        score: matchedFields.length,
        terms: plainTerms,
        reasons: matchedFields.map(name => `${name}が「${pattern}」の形に一致`)
      };
    })
    .filter(result => result.score > 0);
}

function searchAssociative(query) {
  const term = query.trim();
  if (!term) return [];
  const expanded = expandAssociations(term);
  return SEARCH_DOCUMENTS
    .map(doc => {
      const matched = expanded.filter(item => containsTerm(doc, item.word));
      const score = matched.reduce((total, item) => total + item.weight, 0);
      return {
        doc,
        score,
        terms: matched.map(item => item.word),
        reasons: matched.map(item => item.direct ? `入力語「${item.word}」が一致` : `関連語「${item.word}」で連想ヒット`)
      };
    })
    .filter(result => result.score > 0);
}

function expandAssociations(term) {
  const expanded = [{ word: term, weight: 5, direct: true }];
  Object.entries(ASSOCIATIONS).forEach(([key, related]) => {
    if (key.includes(term) || term.includes(key)) {
      related.forEach(word => expanded.push({ word, weight: 2, direct: false }));
    }
  });
  return uniqueByWord(expanded);
}

function uniqueByWord(items) {
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.word)) return false;
    seen.add(item.word);
    return true;
  });
}

function searchBoolean() {
  const a = booleanA.value.trim();
  const b = booleanB.value.trim();
  const operator = booleanOperator.value;
  if (!a || !b) return [];

  return SEARCH_DOCUMENTS
    .map(doc => {
      const hasA = containsTerm(doc, a);
      const hasB = containsTerm(doc, b);
      const matched = operator === 'AND'
        ? hasA && hasB
        : operator === 'OR'
          ? hasA || hasB
          : hasA && !hasB;
      const terms = [hasA ? a : '', hasB && operator !== 'NOT' ? b : ''].filter(Boolean);
      return {
        doc,
        score: (hasA ? 3 : 0) + (hasB ? 2 : 0),
        terms,
        reasons: matched ? [`${a} ${operator} ${b} の条件を満たす`] : [],
        hasA,
        hasB
      };
    })
    .filter(result => result.reasons.length > 0);
}

function buildFieldReasons(doc, term) {
  const reasons = [];
  const normalized = normalizeText(term);
  searchFields(doc).forEach(field => {
    if (normalizeText(field.value).includes(normalized)) {
      reasons.push(`${field.name}に一致`);
    }
  });
  return reasons;
}

function runSearch() {
  let results = [];
  const query = searchQuery.value;
  if (currentMode === 'partial') results = searchPartial(query);
  if (currentMode === 'exact') results = searchExact(query);
  if (currentMode === 'ngram') results = searchNgram(query);
  if (currentMode === 'boolean') results = searchBoolean();
  if (currentMode === 'phrase') results = searchPhrase(query);
  if (currentMode === 'wildcard') results = searchWildcard(query);
  if (currentMode === 'associative') results = searchAssociative(query);

  results.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title, 'ja'));
  renderSearch(results, buildEvaluation(results));
}

function buildEvaluation(results) {
  const hitIds = new Set(results.map(result => result.doc.id));
  const relevantDocs = SEARCH_DOCUMENTS.filter(doc => isRelevantToCurrentIntent(doc));
  const relevantIds = new Set(relevantDocs.map(doc => doc.id));
  const relevantHitCount = results.filter(result => relevantIds.has(result.doc.id)).length;
  const precision = results.length === 0 ? 0 : relevantHitCount / results.length;
  const recall = relevantDocs.length === 0 ? 0 : relevantHitCount / relevantDocs.length;

  return {
    relevantIds,
    missedDocs: SEARCH_DOCUMENTS.filter(doc => !hitIds.has(doc.id)),
    relevantHitCount,
    relevantTotal: relevantDocs.length,
    precision,
    recall
  };
}

function isRelevantToCurrentIntent(doc) {
  if (currentMode === 'boolean') {
    const aWords = conceptWords(booleanA.value.trim());
    const bWords = conceptWords(booleanB.value.trim());
    const hasA = matchesConceptWords(doc, aWords);
    const hasB = matchesConceptWords(doc, bWords);
    if (!aWords.length || !bWords.length) return false;
    if (booleanOperator.value === 'AND') return hasA && hasB;
    if (booleanOperator.value === 'OR') return hasA || hasB;
    return hasA && !hasB;
  }

  return matchesConceptWords(doc, conceptWords(queryForEvaluation()));
}

function queryForEvaluation() {
  if (currentMode === 'wildcard') {
    return searchQuery.value.split(/[*?]+/).filter(Boolean).join(' ');
  }
  return searchQuery.value.trim();
}

function conceptWords(query) {
  const baseWords = query.split(/\s+/).map(word => word.trim()).filter(Boolean);
  const words = [...baseWords];

  baseWords.forEach(term => {
    Object.entries(ASSOCIATIONS).forEach(([key, related]) => {
      if (key.includes(term) || term.includes(key)) {
        words.push(key, ...related);
      }
    });
  });

  return Array.from(new Set(words));
}

function matchesConceptWords(doc, words) {
  if (words.length === 0) return false;
  return words.some(word => recordContainsTerm(doc, word));
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function renderSearch(results, evaluation) {
  document.getElementById('modeName').textContent = MODE_DETAILS[currentMode].name;
  document.getElementById('resultCount').textContent = String(results.length);
  document.getElementById('targetCount').textContent = String(SEARCH_DOCUMENTS.length);
  document.getElementById('precisionValue').textContent = formatPercent(evaluation.precision);
  document.getElementById('recallValue').textContent = formatPercent(evaluation.recall);
  document.getElementById('modeExplanation').textContent = MODE_DETAILS[currentMode].explanation;
  renderTokens(results);
  renderBooleanZone(results);

  resultList.innerHTML = `
    <section class="result-column">
      <h3>ヒットした結果 ${results.length}件</h3>
      <p class="column-note">精度: ヒットのうち、検索意図に合う割合</p>
      ${results.length ? results.map(result => renderResultCard(result, evaluation.relevantIds.has(result.doc.id))).join('') : '<div class="empty-state">該当する書誌はありません。</div>'}
    </section>
    <section class="result-column">
      <h3>ヒットしなかった結果 ${evaluation.missedDocs.length}件</h3>
      <p class="column-note">再現率: 関連する書誌を取りこぼさず拾えた割合</p>
      ${evaluation.missedDocs.map(doc => renderMissedCard(doc, evaluation.relevantIds.has(doc.id))).join('')}
    </section>
  `;
}

function renderResultCard(result, relevant) {
  const terms = result.terms.length ? result.terms : currentHighlightTerms();
  const doc = result.doc;
  return `<article class="result-card">
    <h3>${highlightText(doc.title, terms)}</h3>
    ${renderBibliographicDetails(doc)}
    <div class="result-meta">
      <span class="pill">${escapeHtml(doc.category)}</span>
      <span class="pill alt">関連度 ${result.score}</span>
      <span class="pill">${relevant ? '検索意図に関連' : 'ノイズ候補'}</span>
    </div>
    ${renderSubjects(doc, terms)}
    <p>${highlightText(doc.summary, terms)}</p>
    <ul class="hit-reasons">
      ${result.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join('')}
    </ul>
  </article>`;
}

function renderMissedCard(doc, relevant) {
  const terms = currentHighlightTerms();
  return `<article class="result-card miss-card${relevant ? ' missed-relevant' : ''}">
    <h3>${highlightText(doc.title, terms)}</h3>
    ${renderBibliographicDetails(doc)}
    <div class="result-meta">
      <span class="pill">${escapeHtml(doc.category)}</span>
      <span class="pill alt">${relevant ? '検索漏れ候補' : '対象外'}</span>
    </div>
    ${renderSubjects(doc, terms)}
    <p>${highlightText(doc.summary, terms)}</p>
    <p class="metric-note">${relevant ? '検索意図には近いが、この検索条件ではヒットしませんでした。' : '今回の検索意図からは遠い書誌です。'}</p>
  </article>`;
}

function renderBibliographicDetails(doc) {
  return `<div class="result-url">${escapeHtml(doc.id)} / 請求記号 ${escapeHtml(doc.callNumber)}</div>
    <dl class="bib-details">
      <div><dt>著者</dt><dd>${escapeHtml(doc.creator)}</dd></div>
      <div><dt>出版者</dt><dd>${escapeHtml(doc.publisher)}</dd></div>
      <div><dt>出版年</dt><dd>${escapeHtml(doc.year)}</dd></div>
      <div><dt>資料種別</dt><dd>${escapeHtml(doc.materialType)}</dd></div>
    </dl>`;
}

function renderSubjects(doc, terms) {
  return `<div class="subject-list">
    <strong>件名・キーワード</strong>
    <div class="result-meta">
      ${doc.subjects.map(subject => `<span class="pill">${highlightText(subject, terms)}</span>`).join('')}
    </div>
  </div>`;
}

function currentHighlightTerms() {
  if (currentMode === 'boolean') return [booleanA.value.trim(), booleanB.value.trim()].filter(Boolean);
  if (currentMode === 'wildcard') return searchQuery.value.split(/[*?]+/).filter(Boolean);
  return [searchQuery.value.trim()].filter(Boolean);
}

function renderTokens(results) {
  tokenZone.innerHTML = '';
  if (currentMode === 'ngram') {
    const grams = makeNgrams(searchQuery.value.trim(), Number(ngramSize.value));
    tokenZone.innerHTML = grams.map(gram => `<span class="token-chip">${escapeHtml(gram)}</span>`).join('');
  } else if (currentMode === 'associative') {
    if (!searchQuery.value.trim()) return;
    const terms = expandAssociations(searchQuery.value.trim());
    tokenZone.innerHTML = terms.map(item => `<span class="token-chip">${escapeHtml(item.word)}${item.direct ? '' : ' / 関連語'}</span>`).join('');
  } else if (currentMode === 'wildcard') {
    tokenZone.innerHTML = '<span class="token-chip">* = 0文字以上</span><span class="token-chip">? = 任意の1文字</span>';
  }
}

function renderBooleanZone(results) {
  vennZone.innerHTML = '';
  if (currentMode !== 'boolean') return;
  const a = booleanA.value.trim();
  const b = booleanB.value.trim();
  if (!a || !b) return;
  const states = SEARCH_DOCUMENTS.map(doc => ({
    hasA: containsTerm(doc, a),
    hasB: containsTerm(doc, b)
  }));
  const onlyA = states.filter(result => result.hasA && !result.hasB).length;
  const both = states.filter(result => result.hasA && result.hasB).length;
  const onlyB = states.filter(result => !result.hasA && result.hasB).length;
  vennZone.innerHTML = `
    <div class="venn-chip">語Aのみ ${onlyA}</div>
    <div class="venn-chip">両方 ${both}</div>
    <div class="venn-chip">語Bのみ ${onlyB}</div>
  `;
}

function highlightText(text, terms) {
  let output = escapeHtml(text);
  const cleanTerms = Array.from(new Set(terms.map(term => term.trim()).filter(term => term.length > 0)))
    .sort((a, b) => b.length - a.length);
  cleanTerms.forEach(term => {
    const escapedTerm = escapeHtml(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    output = output.replace(new RegExp(escapedTerm, 'gi'), '<mark class="mark-hit">$&</mark>');
  });
  return output;
}

function setMode(mode) {
  currentMode = mode;
  modeButtons.forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
  normalFields.hidden = mode === 'boolean';
  booleanFields.hidden = mode !== 'boolean';
  ngramFields.hidden = mode !== 'ngram';
  runSearch();
}

function renderCategoryBoard() {
  const board = document.getElementById('categoryBoard');
  board.innerHTML = CATEGORIES.map(category => {
    const assigned = DIRECTORY_PAGES.filter(page => directoryAssignments[page.id] === category.id);
    return `<div class="category-bin" data-category-id="${category.id}">
      <h3>${escapeHtml(category.name)}</h3>
      <div class="bin-count">${assigned.length}件</div>
      <div class="bin-items">
        ${assigned.length ? assigned.map(page => `<div class="bin-item">${escapeHtml(page.title)}</div>`).join('') : '<div class="bin-item">未分類</div>'}
      </div>
    </div>`;
  }).join('');
}

function renderDirectoryCards() {
  const cards = document.getElementById('directoryCards');
  cards.innerHTML = DIRECTORY_PAGES.map(page => {
    const selected = directoryAssignments[page.id] || '';
    return `<article class="directory-card" draggable="true" data-doc-id="${page.id}">
      <div>
        <div class="result-url">${escapeHtml(page.id)}</div>
        <h3>${escapeHtml(page.title)}</h3>
        <p>${escapeHtml(page.summary)}</p>
        <dl class="bib-details page-details">
          <div><dt>製作者</dt><dd>${escapeHtml(page.creator)}</dd></div>
          <div><dt>対象者</dt><dd>${escapeHtml(page.audience)}</dd></div>
          <div><dt>更新</dt><dd>${escapeHtml(page.updated)}</dd></div>
        </dl>
        <div class="subject-list">
          <strong>ページの手がかり</strong>
          <div class="result-meta">
            ${page.keywords.map(keyword => `<span class="pill">${escapeHtml(keyword)}</span>`).join('')}
          </div>
        </div>
        <a class="page-preview-link" href="${escapeHtml(page.url)}" target="_blank" rel="noopener">ページを開く</a>
      </div>
      <div>
        <label>分類先
          <select data-assign="${page.id}">
            <option value="">未分類</option>
            ${CATEGORIES.map(category => `<option value="${category.id}" ${selected === category.id ? 'selected' : ''}>${escapeHtml(category.name)}</option>`).join('')}
          </select>
        </label>
      </div>
    </article>`;
  }).join('');
}

function renderDirectory() {
  renderCategoryBoard();
  renderDirectoryCards();
}

function assignDocument(docId, categoryId) {
  directoryAssignments[docId] = categoryId;
  renderDirectory();
}

function resetDirectory() {
  directoryAssignments = Object.fromEntries(DIRECTORY_PAGES.map(page => [page.id, '']));
  renderDirectory();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

modeButtons.forEach(button => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  runSearch();
});

[searchQuery, booleanA, booleanB, booleanOperator, ngramSize].forEach(control => {
  control.addEventListener('input', runSearch);
  control.addEventListener('change', runSearch);
});

[scopeBody, scopeSubjects].forEach(control => {
  control.addEventListener('change', runSearch);
});

document.getElementById('resetDirectory').addEventListener('click', resetDirectory);

document.getElementById('directoryCards').addEventListener('change', event => {
  const select = event.target.closest('[data-assign]');
  if (!select) return;
  assignDocument(select.dataset.assign, select.value);
});

document.getElementById('directoryCards').addEventListener('dragstart', event => {
  const card = event.target.closest('[data-doc-id]');
  if (!card) return;
  event.dataTransfer.setData('text/plain', card.dataset.docId);
});

document.getElementById('categoryBoard').addEventListener('dragover', event => {
  const bin = event.target.closest('[data-category-id]');
  if (!bin) return;
  event.preventDefault();
  bin.classList.add('drag-over');
});

document.getElementById('categoryBoard').addEventListener('dragleave', event => {
  const bin = event.target.closest('[data-category-id]');
  if (bin) bin.classList.remove('drag-over');
});

document.getElementById('categoryBoard').addEventListener('drop', event => {
  const bin = event.target.closest('[data-category-id]');
  if (!bin) return;
  event.preventDefault();
  bin.classList.remove('drag-over');
  const docId = event.dataTransfer.getData('text/plain');
  if (docId) assignDocument(docId, bin.dataset.categoryId);
});

renderDirectory();
setMode('partial');
