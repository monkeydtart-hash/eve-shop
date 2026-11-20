-- EVE Shop: รันใน Supabase SQL Editor ครั้งเดียว

create table if not exists public.orders (
  id          text primary key,
  created_at  timestamptz not null default now(),
  status      text not null default 'pending'
              check (status in ('pending','paid','shipped','cancelled')),
  name        text not null,
  phone       text not null,
  address     text not null,
  province    text,
  zipcode     text,
  line_id     text,
  note        text,
  items       jsonb not null,
  subtotal    numeric not null,
  shipping    numeric not null,
  total       numeric not null,
  slip_path   text
);

alter table public.orders enable row level security;

-- ลูกค้า (anon) สร้างออเดอร์ได้อย่างเดียว อ่าน/แก้ไม่ได้
create policy "customer can create order" on public.orders
  for insert to anon with check (status = 'pending');

-- แอดมิน (ล็อกอินแล้ว) ทำได้ทุกอย่าง
create policy "admin full access" on public.orders
  for all to authenticated using (true) with check (true);

-- ที่เก็บสลิป (private)
insert into storage.buckets (id, name, public)
values ('slips', 'slips', false)
on conflict (id) do nothing;

create policy "customer can upload slip" on storage.objects
  for insert to anon with check (bucket_id = 'slips');

create policy "admin can read slip" on storage.objects
  for select to authenticated using (bucket_id = 'slips');
