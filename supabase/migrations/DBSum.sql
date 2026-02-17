-- 1. Combined analytics summary (one call instead of 8)
CREATE OR REPLACE FUNCTION get_analytics_summary_optimized()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  now_utc timestamptz := now() AT TIME ZONE 'UTC';
  start_today timestamptz := date_trunc('day', now_utc);
  start_week timestamptz := date_trunc('week', now_utc);
  start_month timestamptz := date_trunc('month', now_utc);
  result json;
BEGIN
  SELECT json_build_object(
    'total_views', count(*) FILTER (WHERE event_type = 'view'),
    'total_clicks', count(*) FILTER (WHERE event_type = 'click'),
    'views_today', count(*) FILTER (WHERE event_type = 'view' AND created_at >= start_today),
    'clicks_today', count(*) FILTER (WHERE event_type = 'click' AND created_at >= start_today),
    'views_this_week', count(*) FILTER (WHERE event_type = 'view' AND created_at >= start_week),
    'clicks_this_week', count(*) FILTER (WHERE event_type = 'click' AND created_at >= start_week),
    'views_this_month', count(*) FILTER (WHERE event_type = 'view' AND created_at >= start_month),
    'clicks_this_month', count(*) FILTER (WHERE event_type = 'click' AND created_at >= start_month)
  ) INTO result
  FROM job_analytics;
  
  RETURN result;
END;
$$;

-- 2. Top jobs analytics (aggregated in DB)
CREATE OR REPLACE FUNCTION get_top_jobs_analytics_optimized(limit_count int DEFAULT 20)
RETURNS TABLE (
  job_id uuid,
  job_title text,
  views bigint,
  clicks bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    j.id as job_id,
    j.title as job_title,
    count(a.id) FILTER (WHERE a.event_type = 'view')::bigint as views,
    count(a.id) FILTER (WHERE a.event_type = 'click')::bigint as clicks
  FROM jobs j
  LEFT JOIN job_analytics a ON j.id = a.job_id
  GROUP BY j.id, j.title
  ORDER BY (count(a.id) FILTER (WHERE a.event_type = 'view') + count(a.id) FILTER (WHERE a.event_type = 'click')) DESC
  LIMIT limit_count;
$$;

-- 3. Country analytics summary
CREATE OR REPLACE FUNCTION get_country_analytics_optimized()
RETURNS TABLE (
  country text,
  country_slug text,
  total_jobs bigint,
  views bigint,
  clicks bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    j.country,
    j.country_slug,
    count(DISTINCT j.id)::bigint as total_jobs,
    count(a.id) FILTER (WHERE a.event_type = 'view')::bigint as views,
    count(a.id) FILTER (WHERE a.event_type = 'click')::bigint as clicks
  FROM jobs j
  LEFT JOIN job_analytics a ON j.id = a.job_id
  GROUP BY j.country, j.country_slug
  ORDER BY (count(a.id) FILTER (WHERE a.event_type = 'view') + count(a.id) FILTER (WHERE a.event_type = 'click')) DESC;
$$;

-- 4. Batched user email fetching
CREATE OR REPLACE FUNCTION get_user_emails_batched(user_ids uuid[])
RETURNS TABLE (id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, email FROM auth.users WHERE id = ANY(user_ids);
$$;
