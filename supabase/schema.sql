create extension if not exists "pgcrypto";

create table if not exists agendamentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  endereco text not null,
  telefone text not null,
  modelo_carro text not null,
  status text not null default 'pendente' check (status in ('pendente', 'agendado', 'executado')),
  agendado_para timestamptz,
  executado_em timestamptz,
  observacao text,
  valor_servico numeric(10,2) not null default 200,
  created_at timestamptz not null default now()
);

alter table agendamentos add column if not exists status text not null default 'pendente';
alter table agendamentos add column if not exists agendado_para timestamptz;
alter table agendamentos add column if not exists executado_em timestamptz;
alter table agendamentos add column if not exists observacao text;
alter table agendamentos add column if not exists valor_servico numeric(10,2) not null default 200;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'agendamentos_status_check'
  ) then
    alter table agendamentos
      add constraint agendamentos_status_check
      check (status in ('pendente', 'agendado', 'executado'));
  end if;
end $$;

create table if not exists analytics (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('acesso', 'agendamento')),
  created_at timestamptz not null default now()
);

create table if not exists push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_data text not null,
  legenda text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table gallery_images add column if not exists kind text not null default 'image'
  check (kind in ('image', 'video'));

create index if not exists idx_analytics_tipo on analytics (tipo);
create index if not exists idx_analytics_created_at on analytics (created_at desc);
create index if not exists idx_agendamentos_created_at on agendamentos (created_at desc);
create index if not exists idx_gallery_images_created_at on gallery_images (created_at desc);

/** Prints de conversas / elogios (WhatsApp etc.) exibidos na home — enviados pelo admin. */
create table if not exists social_proof_images (
  id uuid primary key default gen_random_uuid(),
  image_data text not null,
  legenda text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_social_proof_created_at on social_proof_images (created_at desc);
