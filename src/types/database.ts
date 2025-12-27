export type JobExclusiveTag = 'none' | 'best' | 'high_pay' | 'urgent' | 'featured' | 'new';

export interface Job {
  id: string;
  title: string;
  description: string;
  short_description: string | null;
  company: string | null;
  country: string;
  country_slug: string;
  salary: string | null;
  job_type: string | null;
  requirements: string[] | null;
  tags: string[] | null;
  exclusive_tag: JobExclusiveTag | null;
  apply_link: string | null;
  is_featured: boolean | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  author: string | null;
  tags: string[] | null;
  is_published: boolean | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  job_count: number | null;
  created_at: string;
}

export const countries = [
  { name: 'الكويت', slug: 'kuwait', flag: '🇰🇼', jobCount: 0 },
  { name: 'السعودية', slug: 'saudi', flag: '🇸🇦', jobCount: 0 },
  { name: 'الإمارات', slug: 'uae', flag: '🇦🇪', jobCount: 0 },
  { name: 'قطر', slug: 'qatar', flag: '🇶🇦', jobCount: 0 },
  { name: 'عمان', slug: 'oman', flag: '🇴🇲', jobCount: 0 },
  { name: 'البحرين', slug: 'bahrain', flag: '🇧🇭', jobCount: 0 },
  { name: 'مصر', slug: 'egypt', flag: '🇪🇬', jobCount: 0 },
];

export const exclusiveTagLabels: Record<JobExclusiveTag, string> = {
  none: 'بدون',
  best: 'الأفضل',
  high_pay: 'راتب مرتفع',
  urgent: 'مطلوب بشكل عاجل',
  featured: 'مميز',
  new: 'جديد',
};
