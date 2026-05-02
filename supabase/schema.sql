-- Paste this entire file into the Supabase SQL Editor and click Run

create table if not exists categories (
  id          text        primary key,
  division    text        not null check (division in ('vintage', 'incredible')),
  name        text        not null,
  created_at  timestamptz default now()
);

create table if not exists products (
  id            text        primary key,
  category_id   text        references categories(id) on delete cascade,
  name          text        not null,
  qty           integer     not null default 0,
  original_qty  integer     not null default 0,
  low_threshold integer     not null default 5,
  display_qty   integer     not null default 0,
  faulty_qty    integer     not null default 0,
  created_at    timestamptz default now()
);

create table if not exists dispatch_log (
  id            bigserial   primary key,
  product_id    text        references products(id) on delete set null,
  product_name  text        not null,
  division      text        not null,
  qty_dispatched integer    not null,
  qty_remaining  integer    not null,
  source         text        not null default 'store',
  dispatched_at  timestamptz default now()
);

-- Run this if upgrading from a previous schema version:
alter table products add column if not exists faulty_qty integer not null default 0;

-- Allow full access (internal tool — no public auth needed)
alter table categories   disable row level security;
alter table products     disable row level security;
alter table dispatch_log disable row level security;
