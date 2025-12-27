import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdSenseSettings {
  id: string;
  publisher_id: string | null;
  is_enabled: boolean | null;
  verification_script: string | null;
  hide_placeholders: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface AdUnit {
  id: string;
  name: string;
  slot_id: string;
  placement: string;
  ad_format: string | null;
  is_enabled: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useAdSenseSettings = () => {
  return useQuery({
    queryKey: ['adsense_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adsense_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.log('AdSense settings fetch error:', error.message);
        return null;
      }
      return data as AdSenseSettings | null;
    },
  });
};

export const useUpdateAdSenseSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<AdSenseSettings> & { id?: string }) => {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('adsense_settings')
        .select('id')
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('adsense_settings')
          .update({
            publisher_id: settings.publisher_id,
            is_enabled: settings.is_enabled,
            verification_script: settings.verification_script,
            hide_placeholders: settings.hide_placeholders,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('adsense_settings')
          .insert({
            publisher_id: settings.publisher_id,
            is_enabled: settings.is_enabled ?? false,
            verification_script: settings.verification_script,
            hide_placeholders: settings.hide_placeholders ?? false,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adsense_settings'] });
    },
  });
};

export const useAdUnits = () => {
  return useQuery({
    queryKey: ['ad_units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_units')
        .select('*')
        .order('placement');

      if (error) {
        console.log('Ad units fetch error:', error.message);
        return [];
      }
      return data as AdUnit[];
    },
  });
};

export const useAdUnitByPlacement = (placement: string) => {
  return useQuery({
    queryKey: ['ad_units', placement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_units')
        .select('*')
        .eq('placement', placement)
        .eq('is_enabled', true)
        .maybeSingle();

      if (error) {
        return null;
      }
      return data as AdUnit | null;
    },
  });
};

export const useCreateAdUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adUnit: Omit<AdUnit, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('ad_units')
        .insert(adUnit)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_units'] });
    },
  });
};

export const useUpdateAdUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...adUnit }: Partial<AdUnit> & { id: string }) => {
      const { data, error } = await supabase
        .from('ad_units')
        .update(adUnit)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_units'] });
    },
  });
};

export const useDeleteAdUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ad_units')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_units'] });
    },
  });
};
