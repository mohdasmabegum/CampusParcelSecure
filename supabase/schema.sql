create table if not exists public.users (
  id bigint generated always as identity primary key,
  full_name text not null,
  email text not null unique,
  password text not null,
  role text not null check (role in ('student', 'customer', 'admin')),
  student_id text,
  created_at timestamptz not null default now()
);

alter table if exists public.users
  drop constraint if exists users_role_check;

alter table if exists public.users
  add constraint users_role_check check (role in ('student', 'customer', 'admin'));

create table if not exists public.parcels (
  id bigint generated always as identity primary key,
  student_id text not null,
  student_name text not null,
  parcel_description text not null default 'N/A',
  delivery_image text not null,
  delivery_timestamp timestamptz not null default now(),
  otp text not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  pickup_image text,
  pickup_timestamp timestamptz
);

create index if not exists idx_parcels_student_status on public.parcels(student_id, status);
create index if not exists idx_parcels_status on public.parcels(status);
create index if not exists idx_parcels_delivery_timestamp on public.parcels(delivery_timestamp desc);
