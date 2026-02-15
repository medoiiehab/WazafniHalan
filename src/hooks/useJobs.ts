import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Job, JobExclusiveTag } from '@/types/database';

export const useJobs = () => {
  return useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async (): Promise<Job[]> => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Job[];
    },
  });
};

export const usePublishedJobs = () => {
  return useQuery<Job[]>({
    queryKey: ['jobs', 'published'],
    queryFn: async (): Promise<Job[]> => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_published', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Job[];
    },
  });
};

export const useFeaturedJobs = () => {
  return useQuery<Job[]>({
    queryKey: ['jobs', 'featured'],
    queryFn: async (): Promise<Job[]> => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_featured', true)
        .eq('is_published', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Job[];
    },
  });
};

export const useJobsByCountry = (countrySlug: string) => {
  return useQuery<Job[]>({
    queryKey: ['jobs', 'country', countrySlug],
    queryFn: async (): Promise<Job[]> => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('country_slug', countrySlug)
        .eq('is_published', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Job[];
    },
    enabled: !!countrySlug,
  });
};

export const useJob = (jobId: string) => {
  return useQuery<Job | null>({
    queryKey: ['jobs', jobId],
    queryFn: async (): Promise<Job | null> => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();

      if (error) throw error;
      return data as Job | null;
    },
    enabled: !!jobId,
  });
};

export const useSearchJobs = (searchTerm: string) => {
  return useQuery<Job[]>({
    queryKey: ['jobs', 'search', searchTerm],
    queryFn: async (): Promise<Job[]> => {
      if (!searchTerm.trim()) {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_published', true)
          .order('updated_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        return (data || []) as Job[];
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_published', true)
        .or(`title.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as Job[];
    },
    enabled: true,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert(job)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...job }: Partial<Job> & { id: string }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(job)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};
