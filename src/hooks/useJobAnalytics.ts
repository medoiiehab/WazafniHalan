import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  total_views: number;
  total_clicks: number;
  views_today: number;
  clicks_today: number;
  views_this_week: number;
  clicks_this_week: number;
  views_this_month: number;
  clicks_this_month: number;
}

interface JobAnalytics {
  job_id: string;
  job_title: string;
  views: number;
  clicks: number;
}

interface CountryAnalytics {
  country: string;
  country_slug: string;
  total_jobs: number;
  views: number;
  clicks: number;
}

interface DailyAnalytics {
  date: string;
  views: number;
  clicks: number;
}

export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: ['analytics-summary'],
    refetchInterval: 15000,
    queryFn: async (): Promise<AnalyticsData> => {
      const now = new Date();

      // Strict UTC boundaries to match Supabase timestamps exactly
      const startOfToday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString();
      const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString();

      const dayOfWeek = now.getUTCDay(); // Use UTC day
      const daysSinceSaturday = (dayOfWeek + 1) % 7;
      const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceSaturday)).toISOString();

      const [
        totalViews, totalClicks,
        todayViews, todayClicks,
        weekViews, weekClicks,
        monthViews, monthClicks
      ] = await Promise.all([
        supabase.from('job_analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'view'),
        supabase.from('job_analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'click'),
        supabase.from('job_analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'view').gte('created_at', startOfToday),
        supabase.from('job_analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'click').gte('created_at', startOfToday),
        supabase.from('job_analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'view').gte('created_at', startOfWeek),
        supabase.from('job_analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'click').gte('created_at', startOfWeek),
        supabase.from('job_analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'view').gte('created_at', startOfMonth),
        supabase.from('job_analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'click').gte('created_at', startOfMonth),
      ]);

      return {
        total_views: totalViews.count || 0,
        total_clicks: totalClicks.count || 0,
        views_today: todayViews.count || 0,
        clicks_today: todayClicks.count || 0,
        views_this_week: weekViews.count || 0,
        clicks_this_week: weekClicks.count || 0,
        views_this_month: monthViews.count || 0,
        clicks_this_month: monthClicks.count || 0,
      };
    },
  });
};

export const useJobsAnalytics = () => {
  return useQuery({
    queryKey: ['jobs-analytics'],
    refetchInterval: 30000,
    queryFn: async (): Promise<JobAnalytics[]> => {
      const { data: analytics, error: analyticsError } = await supabase.from('job_analytics').select('job_id, event_type');
      if (analyticsError) throw analyticsError;

      const { data: jobs, error: jobsError } = await supabase.from('jobs').select('id, title');
      if (jobsError) throw jobsError;

      const jobMap = new Map<string, { views: number; clicks: number }>();
      (analytics || []).forEach(a => {
        const existing = jobMap.get(a.job_id) || { views: 0, clicks: 0 };
        if (a.event_type === 'view') existing.views++;
        else if (a.event_type === 'click') existing.clicks++;
        jobMap.set(a.job_id, existing);
      });

      return (jobs || [])
        .map(job => ({
          job_id: job.id,
          job_title: job.title,
          views: jobMap.get(job.id)?.views || 0,
          clicks: jobMap.get(job.id)?.clicks || 0,
        }))
        .sort((a, b) => (b.views + b.clicks) - (a.views + a.clicks))
        .slice(0, 20);
    },
  });
};

export const useCountryAnalytics = () => {
  return useQuery({
    queryKey: ['country-analytics'],
    refetchInterval: 30000,
    queryFn: async (): Promise<CountryAnalytics[]> => {
      const { data: analytics, error: analyticsError } = await supabase.from('job_analytics').select('job_id, event_type');
      if (analyticsError) throw analyticsError;

      const { data: jobs, error: jobsError } = await supabase.from('jobs').select('id, country, country_slug');
      if (jobsError) throw jobsError;

      const jobCountryMap = new Map<string, { country: string; country_slug: string }>();
      (jobs || []).forEach(job => jobCountryMap.set(job.id, { country: job.country, country_slug: job.country_slug }));

      const countryMap = new Map<string, { country: string; views: number; clicks: number; jobs: Set<string> }>();
      (analytics || []).forEach(a => {
        const jobInfo = jobCountryMap.get(a.job_id);
        if (jobInfo) {
          const existing = countryMap.get(jobInfo.country_slug) || { country: jobInfo.country, views: 0, clicks: 0, jobs: new Set<string>() };
          existing.jobs.add(a.job_id);
          if (a.event_type === 'view') existing.views++;
          else if (a.event_type === 'click') existing.clicks++;
          countryMap.set(jobInfo.country_slug, existing);
        }
      });

      const jobCountByCountry = new Map<string, number>();
      (jobs || []).forEach(job => {
        const count = jobCountByCountry.get(job.country_slug) || 0;
        jobCountByCountry.set(job.country_slug, count + 1);
      });

      return Array.from(countryMap.entries())
        .map(([country_slug, data]) => ({
          country: data.country,
          country_slug,
          total_jobs: jobCountByCountry.get(country_slug) || 0,
          views: data.views,
          clicks: data.clicks,
        }))
        .sort((a, b) => (b.views + b.clicks) - (a.views + a.clicks));
    },
  });
};

export const useDailyAnalytics = (days: number = 7) => {
  return useQuery({
    queryKey: ['daily-analytics', days],
    refetchInterval: 15000,
    queryFn: async (): Promise<DailyAnalytics[]> => {
      const now = new Date();
      // Calculate start date in UTC - get the date that is `days - 1` days ago
      // For example, with days=7, we get data from today back to 6 days ago (7 days total)
      const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1)));

      const { data: analytics, error } = await supabase
        .from('job_analytics')
        .select('event_type, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('useDailyAnalytics -Error fetching job analytics:', error);
        throw error;
      }

      // Initialize the map with all the dates we're interested in
      const dateMap = new Map<string, { views: number; clicks: number }>();
      for (let i = 0; i < days; i++) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
        const dateKey = d.toISOString().substring(0, 10); // "YYYY-MM-DD"
        dateMap.set(dateKey, { views: 0, clicks: 0 });
      }

      // Aggregate events by date
      (analytics || []).forEach(a => {
        const dateStr = a.created_at.substring(0, 10);
        const existing = dateMap.get(dateStr);
        if (existing) {
          if (a.event_type === 'view') existing.views++;
          else if (a.event_type === 'click') existing.clicks++;
        }
      });

      // Return results sorted by date (ascending)
      return Array.from(dateMap.entries())
        .map(([date, data]) => ({ date, views: data.views, clicks: data.clicks }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
  });
};

export const useTrackJobEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, eventType }: { jobId: string; eventType: 'view' | 'click' }) => {
      const { error } = await supabase
        .from('job_analytics')
        .insert({
          job_id: jobId,
          event_type: eventType
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      queryClient.invalidateQueries({ queryKey: ['jobs-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['country-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['daily-analytics'] });
    }
  });
};
