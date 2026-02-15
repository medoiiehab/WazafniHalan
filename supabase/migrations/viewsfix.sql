CREATE OR REPLACE FUNCTION get_daily_stats(days_count int)
RETURNS TABLE (
  stat_date date,
  views_count bigint,
  clicks_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    created_at::date as stat_date,
    count(*) FILTER (WHERE event_type = 'view')::bigint as views_count,
    count(*) FILTER (WHERE event_type = 'click')::bigint as clicks_count
  FROM job_analytics
  WHERE created_at >= (now() AT TIME ZONE 'UTC' - (days_count || ' days')::interval)
  GROUP BY stat_date
  ORDER BY stat_date DESC;
END;
$$;