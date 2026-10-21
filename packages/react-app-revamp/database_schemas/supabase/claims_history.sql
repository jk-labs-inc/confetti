create table
  public.claims_history (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    address text not null,
    platform text not null default 'x'::text,
    platform_user_id text not null,
    status text not null,
    reject_reason text null,
    usd_amount numeric null,
    token_amount numeric null,
    usd_price numeric null,
    currency text null,
    network_name text null,
    tx_hash text null,
    constraint claims_history_pkey primary key (id)
  ) tablespace pg_default;

create unique index if not exists claims_one_per_wallet on public.claims_history using btree (address) tablespace pg_default
where
  (status = any (array['pending'::text, 'paid'::text]));

create unique index if not exists claims_one_per_account on public.claims_history using btree (platform, platform_user_id) tablespace pg_default
where
  (status = any (array['pending'::text, 'paid'::text]));
