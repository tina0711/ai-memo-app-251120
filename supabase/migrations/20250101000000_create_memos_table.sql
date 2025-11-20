-- memos 테이블 생성
create table if not exists public.memos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null,
  tags text[] default '{}',
  ai_summary text,
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

-- updated_at 자동 업데이트를 위한 트리거 함수
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- updated_at 트리거 생성
create trigger update_memos_updated_at
  before update on public.memos
  for each row
  execute function public.update_updated_at_column();

-- 인덱스 생성 (검색 성능 향상)
create index if not exists idx_memos_category on public.memos(category);
create index if not exists idx_memos_created_at on public.memos(created_at desc);
create index if not exists idx_memos_tags on public.memos using gin(tags);

-- RLS (Row Level Security) 활성화
alter table public.memos enable row level security;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 설정 (인증이 없는 경우를 위해)
-- 프로덕션에서는 인증된 사용자만 접근하도록 수정 필요
create policy "Allow all operations for all users" on public.memos
  for all
  using (true)
  with check (true);

