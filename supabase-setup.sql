-- Siêu Nhân Né Nhậu V3: chạy một lần trong Supabase > SQL Editor.
-- Supabase Auth: bật Email/password. Tắt đăng ký ẩn danh nếu không cần.
-- BẢO MẬT: DB là nguồn vàng thật. Không dùng service_role key phía trình duyệt.
create extension if not exists pgcrypto;
create table if not exists public.players (
 id uuid primary key references auth.users(id) on delete cascade,
 nickname text not null default 'Siêu nhân' check (char_length(nickname) between 1 and 16),
 gold_balance bigint not null default 0 check(gold_balance>=0),
 gold_earned bigint not null default 0 check(gold_earned>=0),
 best_score integer not null default 0 check(best_score>=0),
 equipped jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table if not exists public.owned_items (
 player_id uuid not null references public.players(id) on delete cascade,
 item_id text not null,
 created_at timestamptz not null default now(),
 primary key (player_id,item_id)
);
create table if not exists public.shop_items (
 id text primary key,
 slot text not null check(slot in ('character','outfit','hair','glasses','hat','jewelry','pet')),
 price integer not null check(price>=0)
);
insert into public.shop_items(id,slot,price) values
 ('hero_classic','character',0),('hero_thunder','character',420),('hero_sun','character',1050),('hero_king','character',2200),
 ('outfit_none','outfit',0),('outfit_vest','outfit',300),('outfit_ninja','outfit',430),('outfit_armor','outfit',780),('outfit_royal','outfit',1250),
 ('hair_none','hair',0),('hair_red','hair',160),('hair_blue','hair',180),('hair_rock','hair',260),
 ('glasses_none','glasses',0),('glasses_black','glasses',125),('glasses_heart','glasses',180),('glasses_star','glasses',300),
 ('hat_none','hat',0),('hat_cap','hat',140),('hat_cowboy','hat',240),('hat_crown','hat',750),('hat_helmet','hat',680),
 ('jewel_none','jewelry',0),('jewel_chain','jewelry',250),('jewel_medal','jewelry',490),('jewel_diamond','jewelry',1250),
 ('pet_none','pet',0),('pet_dog','pet',350),('pet_cat','pet',380),('pet_chicken','pet',410),('pet_duck','pet',450),('pet_pig','pet',620),('pet_dragon','pet',1500)
on conflict(id) do update set slot=excluded.slot,price=excluded.price;
create table if not exists public.game_runs (
 id uuid primary key default gen_random_uuid(),
 player_id uuid not null references public.players(id) on delete cascade,
 started_at timestamptz not null default now(),
 finished_at timestamptz,
 score integer,
 gold integer,
 passed integer
);
create index if not exists game_runs_player_recent on public.game_runs(player_id,started_at desc);
create index if not exists players_top_score on public.players(best_score desc);
create index if not exists players_top_gold on public.players(gold_earned desc);
-- Khách không có quyền đọc ví của người khác hoặc sửa bất kỳ bảng nào trực tiếp.
alter table public.players enable row level security;
alter table public.owned_items enable row level security;
alter table public.shop_items enable row level security;
alter table public.game_runs enable row level security;
revoke all on public.players,public.owned_items,public.shop_items,public.game_runs from anon,authenticated;
grant select on public.players,public.owned_items to authenticated;
create policy "player reads own profile" on public.players for select to authenticated using (id = (select auth.uid()));
create policy "player reads own gear" on public.owned_items for select to authenticated using(player_id = (select auth.uid()));
-- Profile tạo bởi trigger khi xác nhận người dùng mới.
create or replace function public.new_player() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.players(id,nickname) values(new.id, left(coalesce(nullif(trim(new.raw_user_meta_data->>'nickname'),''),'Siêu nhân'),16)) on conflict(id) do nothing;
 return new;
end;$$;
drop trigger if exists create_player_after_signup on auth.users;
create trigger create_player_after_signup after insert on auth.users for each row execute function public.new_player();
-- Nếu hệ thống có người dùng cũ, khởi tạo hồ sơ còn thiếu.
insert into public.players(id,nickname)
select id,left(coalesce(nullif(trim(raw_user_meta_data->>'nickname'),''),'Siêu nhân'),16) from auth.users
on conflict(id) do nothing;
-- RPC chỉ sử dụng auth.uid() làm danh tính, không nhận player_id do client gửi.
create or replace function public.set_player_name(p_nickname text) returns text
language plpgsql security definer set search_path = '' as $$
declare v_name text := left(trim(coalesce(p_nickname,'')),16);
begin
 if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
 if char_length(v_name)<1 then raise exception 'Tên không hợp lệ'; end if;
 update public.players set nickname=v_name where id=auth.uid();
 return v_name;
end;$$;
create or replace function public.begin_run() returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
 if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
 -- Tối đa 5 lượt chưa hoàn tất trong 2 phút, chặn spam nhẹ.
 if (select count(*) from public.game_runs where player_id=auth.uid() and started_at>now()-interval '2 minutes')>15 then
   raise exception 'Chơi quá nhanh, thử lại sau';
 end if;
 insert into public.game_runs(player_id) values(auth.uid()) returning id into v_id;
 return v_id;
end;$$;
create or replace function public.finish_run(p_run_id uuid,p_score integer,p_gold integer,p_passed integer)
returns table(gold_balance bigint,gold_earned bigint,best_score integer)
language plpgsql security definer set search_path = '' as $$
declare r public.game_runs%rowtype; v_seconds numeric; v_max_score integer;
begin
 if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
 select * into r from public.game_runs where id=p_run_id and player_id=auth.uid() for update;
 if not found then raise exception 'Lượt chơi không hợp lệ'; end if;
 if r.finished_at is not null then
   return query select p.gold_balance,p.gold_earned,p.best_score from public.players p where p.id=auth.uid();
   return;
 end if;
 v_seconds:=extract(epoch from (clock_timestamp()-r.started_at));
 if p_score is null or p_gold is null or p_passed is null
   or p_score<0 or p_gold<0 or p_passed<0 or p_score>6000
   or p_passed>2000 or p_gold>20000 then raise exception 'Điểm bất thường'; end if;
 if v_seconds<2 or v_seconds>7200 then raise exception 'Thời gian lượt chơi không hợp lệ'; end if;
 -- Giới hạn thô theo số quán, thời gian và mức thưởng trong engine; không phải chống cheat tuyệt đối.
 v_max_score := p_passed*2+(p_passed/10)*5;
 if p_score>v_max_score or p_gold>(p_passed+2)*18
 or p_passed>floor(v_seconds*3.0)::integer+2 then raise exception 'Dữ liệu vượt giới hạn trò chơi'; end if;
 update public.game_runs set finished_at=now(),score=p_score,gold=p_gold,passed=p_passed where id=r.id;
 update public.players p set gold_balance=p.gold_balance+p_gold,
 gold_earned=p.gold_earned+p_gold,best_score=greatest(p.best_score,p_score) where p.id=auth.uid();
 return query select p.gold_balance,p.gold_earned,p.best_score from public.players p where p.id=auth.uid();
end;$$;
create or replace function public.buy_cosmetic(p_item_id text)
returns table(gold_balance bigint,gold_earned bigint,best_score integer)
language plpgsql security definer set search_path = '' as $$
declare v_price integer; v_balance bigint;
begin
 if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
 select price into v_price from public.shop_items where id=p_item_id;
 if not found then raise exception 'Vật phẩm không tồn tại'; end if;
 if exists(select 1 from public.owned_items where player_id=auth.uid() and item_id=p_item_id) then raise exception 'Đã sở hữu'; end if;
 select p.gold_balance into v_balance from public.players p where p.id=auth.uid() for update;
 if v_balance<v_price then raise exception 'Không đủ vàng'; end if;
 update public.players p set gold_balance=p.gold_balance-v_price where p.id=auth.uid();
 insert into public.owned_items(player_id,item_id) values(auth.uid(),p_item_id);
 return query select p.gold_balance,p.gold_earned,p.best_score from public.players p where p.id=auth.uid();
end;$$;
create or replace function public.equip_cosmetic(p_item_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_slot text; v_price integer; v_equip jsonb;
begin
 if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
 select slot,price into v_slot,v_price from public.shop_items where id=p_item_id;
 if not found then raise exception 'Vật phẩm không tồn tại'; end if;
 if v_price>0 and not exists(select 1 from public.owned_items where player_id=auth.uid() and item_id=p_item_id) then raise exception 'Chưa mua vật phẩm'; end if;
 update public.players p set equipped=jsonb_set(coalesce(p.equipped,'{}'::jsonb),array[v_slot],to_jsonb(p_item_id),true)
 where p.id=auth.uid() returning p.equipped into v_equip;
 return v_equip;
end;$$;
create or replace function public.get_leaderboard(p_kind text default 'score')
returns table(nickname text,best_score integer,gold_earned bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
 if p_kind not in ('score','gold') then raise exception 'Loại bảng không hợp lệ'; end if;
 if p_kind='score' then
  return query select p.nickname,p.best_score,p.gold_earned from public.players p
    where p.best_score>0 order by p.best_score desc,p.created_at asc limit 30;
 else
  return query select p.nickname,p.best_score,p.gold_earned from public.players p
    where p.gold_earned>0 order by p.gold_earned desc,p.created_at asc limit 30;
 end if;
end;$$;
revoke all on function public.set_player_name(text),public.begin_run(),public.finish_run(uuid,integer,integer,integer),public.buy_cosmetic(text),public.equip_cosmetic(text) from public,anon;
grant execute on function public.set_player_name(text),public.begin_run(),public.finish_run(uuid,integer,integer,integer),public.buy_cosmetic(text),public.equip_cosmetic(text) to authenticated;
revoke all on function public.get_leaderboard(text) from public;
grant execute on function public.get_leaderboard(text) to anon,authenticated;
