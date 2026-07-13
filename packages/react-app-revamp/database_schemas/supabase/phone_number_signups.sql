create table
  public.phone_number_signups (
    id uuid not null default gen_random_uuid (),
    phone_number character varying not null,
    user_address character varying null,
    date timestamp with time zone null,
    constraint phone_number_signups_pkey primary key (id)
  ) tablespace pg_default;
