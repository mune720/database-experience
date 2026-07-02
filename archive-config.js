// === デジタルアーカイブ体験：Supabase 接続設定 ===
// Supabase プロジェクトの「Project Settings → API」から値をコピーして貼り付けてください。
// ・SUPABASE_URL      : Project URL（例 https://abcd1234.supabase.co）
// ・SUPABASE_ANON_KEY : anon public キー（公開前提のキーです。RLSで保護するため、公開リポジトリに含めて問題ありません）
// ・BUCKET            : 画像を保存する Storage バケット名（supabase-setup.sql で作成済みの archive-images のまま）
window.ARCHIVE_CONFIG = {
  SUPABASE_URL: 'https://ftksjsvxhxiicxwqmlkx.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_tINZM4bS_oYHJyzMc5W9DQ_hKKU5MO7',
  BUCKET: 'archive-images'
};
