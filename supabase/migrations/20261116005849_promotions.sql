create schema if not exists promotion_private;
revoke all on schema promotion_private from public;
grant usage on schema promotion_private to anon, authenticated;

create table public.promotions (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(btrim(name)) between 1 and 120),
    description text check (char_length(description) <= 1000),
    image_url text check (image_url ~ '^https://[^[:space:]]+$' and char_length(image_url) <= 2048),
    price numeric(10, 2) not null check (price >= 0 and price <> 'NaN'::numeric),
    active boolean not null default false,
    starts_at timestamptz,
    ends_at timestamptz,
    -- The canonical selection prevents duplicate combinations and records the
    -- expected membership so deleting a product cannot silently shrink a combo.
    product_ids uuid[] not null unique check (cardinality(product_ids) >= 2),
    created_at timestamptz not null default now(),
    check (starts_at is null or ends_at is null or starts_at < ends_at)
);

create table public.promotion_items (
    promotion_id uuid not null references public.promotions(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    primary key (promotion_id, product_id)
);
create index promotion_items_product_id_idx on public.promotion_items(product_id);

alter table public.promotions enable row level security;
alter table public.promotion_items enable row level security;
revoke all on public.promotions, public.promotion_items from public, anon, authenticated;
grant select on public.promotions, public.promotion_items to anon, authenticated;
grant delete on public.promotions to authenticated;
grant update (active) on public.promotions to authenticated;

create function promotion_private.is_current(promotion uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
    select exists (
        select 1
        from public.promotions p
        where p.id = promotion and p.active
          and (p.starts_at is null or p.starts_at <= now())
          and (p.ends_at is null or p.ends_at > now())
          and exists (
              select 1
              from public.promotion_items i
              join public.products item on item.id = i.product_id
              where i.promotion_id = p.id and item.visible and item.available
                and item.price >= 0 and item.price <> 'NaN'::numeric
              having array_agg(i.product_id order by i.product_id) = p.product_ids
                 and sum(item.price) > p.price
          )
    )
$$;
revoke all on function promotion_private.is_current(uuid) from public, anon, authenticated;
grant execute on function promotion_private.is_current(uuid) to anon, authenticated;

create policy "Read current promotions" on public.promotions
    for select to anon, authenticated using (promotion_private.is_current(id));
create policy "Admin reads promotions" on public.promotions
    for select to authenticated using ((select auth.jwt() ->> 'email') = 'admin@premiumpe.com');
create policy "Admin deletes promotions" on public.promotions
    for delete to authenticated using ((select auth.jwt() ->> 'email') = 'admin@premiumpe.com');
create policy "Admin pauses promotions" on public.promotions
    for update to authenticated
    using ((select auth.jwt() ->> 'email') = 'admin@premiumpe.com')
    with check ((select auth.jwt() ->> 'email') = 'admin@premiumpe.com' and not active);
create policy "Read items of readable promotions" on public.promotion_items
    for select to anon, authenticated
    using (exists (select 1 from public.promotions p where p.id = promotion_id));

create function promotion_private.save_promotion(p_id uuid, p_details jsonb, p_products uuid[])
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
    selected uuid[];
    result_id uuid;
    combined numeric;
    found_count integer;
    proposed_price numeric := (p_details ->> 'price')::numeric;
    proposed_active boolean := coalesce((p_details ->> 'active')::boolean, false);
begin
    if (select auth.uid()) is null
       or (select auth.jwt() ->> 'email') is distinct from 'admin@premiumpe.com' then
        raise exception 'Acceso denegado' using errcode = '42501';
    end if;

    select array_agg(distinct id order by id) into selected from unnest(p_products) as item(id)
    where id is not null;
    if coalesce(cardinality(selected), 0) < 2 or cardinality(selected) <> cardinality(p_products) then
        raise exception 'Selecciona al menos dos productos distintos' using errcode = '22023';
    end if;

    select count(*), sum(price) into found_count, combined
    from public.products
    where id = any(selected) and price >= 0 and price <> 'NaN'::numeric
      and (not proposed_active or (visible and available));

    if found_count <> cardinality(selected) then
        raise exception 'Hay productos eliminados o no disponibles' using errcode = '22023';
    end if;
    if proposed_price is null or proposed_price = 'NaN'::numeric or proposed_price < 0
       or proposed_price <> round(proposed_price, 2) or (proposed_active and proposed_price >= combined) then
        raise exception 'El precio debe ser válido y, para activar la oferta, inferior al total individual'
            using errcode = '22023';
    end if;

    if p_id is null then
        insert into public.promotions (name, description, image_url, price, active, starts_at, ends_at, product_ids)
        values (btrim(p_details ->> 'name'), nullif(btrim(p_details ->> 'description'), ''),
                nullif(btrim(p_details ->> 'image_url'), ''), proposed_price, proposed_active,
                (p_details ->> 'starts_at')::timestamptz, (p_details ->> 'ends_at')::timestamptz, selected)
        returning id into result_id;
    else
        update public.promotions
        set name = btrim(p_details ->> 'name'),
            description = nullif(btrim(p_details ->> 'description'), ''),
            image_url = nullif(btrim(p_details ->> 'image_url'), ''),
            price = proposed_price,
            active = proposed_active,
            starts_at = (p_details ->> 'starts_at')::timestamptz,
            ends_at = (p_details ->> 'ends_at')::timestamptz,
            product_ids = selected
        where id = p_id returning id into result_id;
        if not found then
            raise exception 'La promoción ya no existe' using errcode = '22023';
        end if;
        delete from public.promotion_items where promotion_id = result_id;
    end if;
    insert into public.promotion_items (promotion_id, product_id)
    select result_id, id from unnest(selected) as item(id);
    return result_id;
end
$$;

create function public.save_promotion(p_id uuid, p_details jsonb, p_products uuid[])
returns uuid language sql security invoker set search_path = ''
as $$ select promotion_private.save_promotion(p_id, p_details, p_products) $$;
revoke all on function promotion_private.save_promotion(uuid, jsonb, uuid[]),
    public.save_promotion(uuid, jsonb, uuid[]) from public, anon, authenticated;
grant execute on function promotion_private.save_promotion(uuid, jsonb, uuid[]),
    public.save_promotion(uuid, jsonb, uuid[]) to authenticated;

create view public.current_promotions with (security_invoker = true) as
select p.id, p.name, p.description, p.image_url, p.price, p.starts_at, p.ends_at,
       sum(item.price) as original_price,
       jsonb_agg(jsonb_build_object('id', item.id, 'name', item.name, 'image_url', item.image_url,
           'delivery_type', item.delivery_type) order by item.id) as products
from public.promotions p
join public.promotion_items i on i.promotion_id = p.id
join public.products item on item.id = i.product_id
where promotion_private.is_current(p.id)
group by p.id;
revoke all on public.current_promotions from public, anon, authenticated;
grant select on public.current_promotions to anon, authenticated;

-- The browser provides only identifiers and quantities. Every line of a mixed
-- cart is resolved from the same database snapshot, or the entire quote fails.
create function public.quote_promotion_order(p_lines jsonb)
returns jsonb language plpgsql stable security invoker set search_path = ''
as $$
declare
    requested integer;
    matched integer;
    result jsonb;
begin
    if jsonb_typeof(p_lines) is distinct from 'array' then
        raise exception 'Pedido inválido' using errcode = '22023';
    end if;
    requested := jsonb_array_length(p_lines);
    if requested < 1 or requested > 100 then
        raise exception 'Pedido inválido' using errcode = '22023';
    end if;

    with lines as (
        select (entry ->> 'id')::uuid as id, entry ->> 'kind' as kind,
               (entry ->> 'quantity')::integer as quantity, position
        from jsonb_array_elements(p_lines) with ordinality as input(entry, position)
    ), priced as (
        select l.*, p.name, p.price, p.delivery_type, null::jsonb as products
        from lines l join public.products p on p.id = l.id
        where l.kind = 'product' and l.quantity = 1 and p.visible and p.available
          and p.price >= 0 and p.price <> 'NaN'::numeric
        union all
        select l.*, p.name, p.price, null::text, p.products
        from lines l join public.current_promotions p on p.id = l.id
        where l.kind = 'promotion' and l.quantity between 1 and 99
    )
    select count(distinct (kind, id)),
           jsonb_agg(to_jsonb(priced) - 'position' order by position)
    into matched, result from priced;
    if matched <> requested then
        return null;
    end if;
    return result;
end
$$;
revoke all on function public.quote_promotion_order(jsonb) from public, anon, authenticated;
grant execute on function public.quote_promotion_order(jsonb) to anon, authenticated;
