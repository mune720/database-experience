-- =============================================================
-- 図書館情報技術論 / デジタルアーカイブ体験 セットアップ用 SQL
-- Supabase ダッシュボードの「SQL Editor」に貼り付けて Run してください。
-- 何度実行しても安全（再実行可能）に書いています。
-- =============================================================

-- 1) アーカイブ（1人1コレクション = カード1枚）
create table if not exists public.archives (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  owner_name  text not null,          -- 作成者名
  title       text not null,          -- テーマ（タイトル）
  description text                     -- 説明（任意）
);

-- 2) 資料（写真1枚＋ダブリンコア・メタデータ）
create table if not exists public.items (
  id             uuid primary key default gen_random_uuid(),
  archive_id     uuid not null references public.archives(id) on delete cascade,
  created_at     timestamptz not null default now(),
  image_path     text,               -- Storage 内のパス（archive-images バケット）
  dc_title       text not null,      -- dc:title  タイトル
  dc_creator     text,               -- dc:creator 作成者・撮影者
  dc_date        text,               -- dc:date    日付（自由記述）
  dc_description text,               -- dc:description 説明
  dc_subject     text,               -- dc:subject 主題・キーワード（区切り入力）
  dc_coverage    text,               -- dc:coverage 場所・範囲
  dc_type        text,               -- dc:type    資源タイプ
  dc_rights      text,               -- dc:rights  権利
  custom         jsonb not null default '{}'::jsonb  -- 自由項目（項目名:値）
);

create index if not exists items_archive_id_idx on public.items(archive_id);

-- 3) RLS（行レベルセキュリティ）：今回は「閲覧・投稿オープン」方針
alter table public.archives enable row level security;
alter table public.items    enable row level security;

drop policy if exists "archives open" on public.archives;
create policy "archives open" on public.archives
  for all using (true) with check (true);

drop policy if exists "items open" on public.items;
create policy "items open" on public.items
  for all using (true) with check (true);

-- 3.5) テーブル権限（GRANT）
--      SQLで作成したテーブルはロールへ自動付与されないため、匿名(anon)と
--      ログイン済(authenticated)に操作を明示的に許可する。RLSと両方そろって動く。
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.archives to anon, authenticated;
grant select, insert, update, delete on public.items    to anon, authenticated;

-- 4) Storage：画像用バケット（公開読み取り）
insert into storage.buckets (id, name, public)
values ('archive-images', 'archive-images', true)
on conflict (id) do update set public = true;

-- バケットへの匿名アップロード／参照／削除を許可
drop policy if exists "archive-images read"   on storage.objects;
create policy "archive-images read"   on storage.objects
  for select using (bucket_id = 'archive-images');

drop policy if exists "archive-images insert" on storage.objects;
create policy "archive-images insert" on storage.objects
  for insert with check (bucket_id = 'archive-images');

drop policy if exists "archive-images delete" on storage.objects;
create policy "archive-images delete" on storage.objects
  for delete using (bucket_id = 'archive-images');
