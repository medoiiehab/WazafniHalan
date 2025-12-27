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
    queryFn: async (): Promise<AnalyticsData> => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Get all analytics
      const { data: allAnalytics, error } = await supabase
        .from('job_analytics')
        .select('event_type, created_at');

      if (error) throw error;

      const analytics = allAnalytics || [];

      return {
        total_views: analytics.filter(a => a.event_type === 'view').length,
        total_clicks: analytics.filter(a => a.event_type === 'click').length,
        views_today: analytics.filter(a => a.event_type === 'view' && a.created_at >= startOfDay).length,
        clicks_today: analytics.filter(a => a.event_type === 'click' && a.created_at >= startOfDay).length,
        views_this_week: analytics.filter(a => a.event_type === 'view' && a.created_at >= startOfWeek).length,
        clicks_this_week: analytics.filter(a => a.event_type === 'click' && a.created_at >= startOfWeek).length,
        views_this_month: analytics.filter(a => a.event_type === 'view' && a.created_at >= startOfMonth).length,
        clicks_this_month: analytics.filter(a => a.event_type === 'click' && a.created_at >= startOfMonth).length,
      };
    },
  });
};

export const useJobsAnalytics = () => {
  return useQuery({
    queryKey: ['jobs-analytics'],
    queryFn: async (): Promise<JobAnalytics[]> => {
      // Get all analytics with job info
      const { data: analytics, error: analyticsError } = await supabase
        .from('job_analytics')
        .select('job_id, event_type');

      if (analyticsError) throw analyticsError;

      // Get jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title');

      if (jobsError) throw jobsError;

      // Group by job_id
      const jobMap = new Map<string, { views: number; clicks: number }>();
      
      (analytics || []).forEach(a => {
        const existing = jobMap.get(a.job_id) || { views: 0, clicks: 0 };
        if (a.event_type === 'view') {
          existing.views++;
        } else if (a.event_type === 'click') {
          existing.clicks++;
        }
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
    queryFn: async (): Promise<CountryAnalytics[]> => {
      // Get all analytics with job info
      const { data: analytics, error: analyticsError } = await supabase
        .from('job_analytics')
        .select('job_id, event_type');

      if (analyticsError) throw analyticsError;

      // Get jobs with country info
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, country, country_slug');

      if (jobsError) throw jobsError;

      // Create job to country mapping
      const jobCountryMap = new Map<string, { country: string; country_slug: string }>();
      (jobs || []).forEach(job => {
        jobCountryMap.set(job.id, { country: job.country, country_slug: job.country_slug });
      });

      // Group analytics by country
      const countryMap = new Map<string, { country: string; views: number; clicks: number; jobs: Set<string> }>();
      
      (analytics || []).forEach(a => {
        const jobInfo = jobCountryMap.get(a.job_id);
        if (jobInfo) {
          const existing = countryMap.get(jobInfo.country_slug) || { 
            country: jobInfo.country, 
            views: 0, 
            clicks: 0,
            jobs: new Set<string>()
          };
          existing.jobs.add(a.job_id);
          if (a.event_type === 'view') {
            existing.views++;
          } else if (a.event_type === 'click') {
            existing.clicks++;
          }
          countryMap.set(jobInfo.country_slug, existing);
        }
      });

      // Count total jobs per country
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
    queryFn: async (): Promise<DailyAnalytics[]> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: analytics, error } = await supabase
        .from('job_analytics')
        .select('event_type, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Group by date
      const dateMap = new Map<string, { views: number; clicks: number }>();
      
      // Initialize all dates
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dateMap.set(dateStr, { views: 0, clicks: 0 });
      }

      (analytics || []).forEach(a => {
        const dateStr = a.created_at.split('T')[0];
        const existing = dateMap.get(dateStr);
        if (existing) {
          if (a.event_type === 'view') {
            existing.views++;
          } else if (a.event_type === 'click') {
            existing.clicks++;
          }
        }
      });

      return Array.from(dateMap.entries())
        .map(([date, data]) => ({
          date,
          views: data.views,
          clicks: data.clicks,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
  });
};

export const useTrackJobEvent = () => {
  return useMutation({
    mutationFn: async ({ jobId, eventType }: { jobId: string; eventType: 'view' | 'click' }) => {
      const { error } = await supabase
        .from('job_analytics')
        .insert({ job_id: jobId, event_type: eventType });

      if (error) throw error;
    },
  });
};
