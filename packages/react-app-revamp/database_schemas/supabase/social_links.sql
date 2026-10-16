create table
  public.social_links (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    address text not null,
    platform text not null default 'x'::text,
    platform_user_id text not null,
    handle text not null,
    verified boolean null,
    verified_type text null,
    is_identity_verified boolean null,
    subscription_type text null,
    verified_followers_count integer null,
    followers_count integer null,
    following_count integer null,
    post_count integer null,
    account_created_at timestamp with time zone null,
    constraint social_links_pkey primary key (id),
    constraint social_links_platform_platform_user_id_key unique (platform, platform_user_id)
  ) tablespace pg_default;
