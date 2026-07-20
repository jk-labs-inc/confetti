create table
  public.analytics_contest_participants_v3 (
    uuid uuid not null default gen_random_uuid (),
    contest_address character varying not null,
    user_address character varying not null,
    network_name character varying not null,
    proposal_id character varying null,
    proposal_name character varying null,
    vote_amount numeric null,
    created_at integer null,
    deleted boolean null default false,
    amount_sent numeric null,
    comment_id character varying null,
    percentage_to_rewards numeric null,
    constraint analytics_contest_participants_v3_pkey primary key (uuid)
  ) tablespace pg_default;

create index IF not exists idx_analytics_part_v3_user_address_vote_amt on public.analytics_contest_participants_v3 using btree (user_address, vote_amount) tablespace pg_default;

create index IF not exists analytics_contest_participants_contest_address_network_name_idx on public.analytics_contest_participants_v3 using btree (contest_address, network_name) TABLESPACE pg_default;
