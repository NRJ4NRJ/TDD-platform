-- Add numeric scores for risk ratings.
-- 1 = blocking point, 5 = conclusive.

create or replace function public.risk_rating_score(rating public.risk_rating)
returns int as $$
  select case rating
    when 'red' then 1
    when 'orange' then 2
    when 'yellow' then 3
    when 'blue' then 4
    when 'green' then 5
  end;
$$ language sql immutable strict;

create or replace view public.risk_assessments_with_scores
with (security_invoker = true) as
select
  risk_assessments.*,
  public.risk_rating_score(risk_assessments.rating) as rating_score
from public.risk_assessments;

create or replace view public.risk_items_with_scores
with (security_invoker = true) as
select
  risk_items.*,
  public.risk_rating_score(risk_items.rating) as rating_score
from public.risk_items;
