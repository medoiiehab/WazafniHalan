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
interface DbStatRow {
  date_key: string;
  views: number | string;
  clicks: number | string;
}
export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: ['analytics-summary'],
    refetchInterval: 15000,
    queryFn: async (): Promise<AnalyticsData> => {
      const { data, error } = await (supabase as any).rpc('get_analytics_summary_optimized');
      if (error) throw error;
      return data as AnalyticsData;
    },
  });
};

export const useJobsAnalytics = () => {
  return useQuery({
    queryKey: ['jobs-analytics'],
    refetchInterval: 30000,
    queryFn: async (): Promise<JobAnalytics[]> => {
      const { data, error } = await (supabase as any).rpc('get_top_jobs_analytics_optimized', { limit_count: 20 });
      if (error) throw error;
      return data as JobAnalytics[];
    },
  });
};

export const useCountryAnalytics = () => {
  return useQuery({
    queryKey: ['country-analytics'],
    refetchInterval: 30000,
    queryFn: async (): Promise<CountryAnalytics[]> => {
      const { data, error } = await (supabase as any).rpc('get_country_analytics_optimized');
      if (error) throw error;
      return data as CountryAnalytics[];
    },
  });
};

export const useDailyAnalytics = (days: number = 7) => {
  return useQuery({
    queryKey: ['daily-analytics', days],
    refetchInterval: 15000,
    queryFn: async (): Promise<DailyAnalytics[]> => {
      // 2. استخدام (supabase as any) لتخطي خطأ TypeScript في تعريف الدوال
      // مع تحديد المعاملات والبيانات المسترجعة
      const { data, error } = await (supabase as any)
        .rpc('get_daily_stats', { lookback_days: days });

      if (error) {
        console.error('❌ Supabase RPC Error:', error.message);
        throw new Error(error.message);
      }

      // تحويل النتيجة لمصفوفة صريحة من النوع الذي عرفناه
      const dbStats = (data as DbStatRow[]) || [];

      const result: DailyAnalytics[] = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // الآن لن يظهر خطأ على date_key أو views
        const dayStats = dbStats.find((item) => item.date_key === dateStr);

        result.push({
          date: dateStr,
          views: dayStats ? Number(dayStats.views) : 0,
          clicks: dayStats ? Number(dayStats.clicks) : 0
        });
      }

      console.log('✅ Chart Data Ready:', result);
      return result;
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
