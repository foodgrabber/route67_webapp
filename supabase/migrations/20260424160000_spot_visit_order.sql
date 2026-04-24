-- Add a visit_order column so the hunt UI can number pins and render the
-- ordered "route stops" list (matches example/frontend's routeStopsList).

alter table public.spots add column if not exists visit_order int;
create index if not exists spots_hunt_order_idx on public.spots (hunt_id, visit_order);
