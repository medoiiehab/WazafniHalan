-- Create job tags enum for exclusive tags
CREATE TYPE public.job_exclusive_tag AS ENUM ('none', 'best', 'high_pay', 'urgent', 'featured', 'new');

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  company TEXT,
  country TEXT NOT NULL,
  country_slug TEXT NOT NULL,
  salary TEXT,
  job_type TEXT DEFAULT 'دوام كامل',
  requirements TEXT[],
  tags TEXT[],
  exclusive_tag job_exclusive_tag DEFAULT 'none',
  apply_link TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  author TEXT DEFAULT 'فريق وظفني حالاً',
  tags TEXT[],
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  job_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can read jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Anyone can read blog posts" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);

-- Admin write policies (for now, allow all authenticated or use service role)
CREATE POLICY "Allow all operations on jobs" ON public.jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on blog_posts" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample jobs
INSERT INTO public.jobs (title, description, short_description, company, country, country_slug, salary, job_type, requirements, tags, exclusive_tag, apply_link, is_featured) VALUES
('مطور واجهات أمامية', 'نبحث عن مطور واجهات أمامية متميز للعمل على مشاريع تقنية متنوعة. يجب أن يكون لديك خبرة في React و TypeScript.', 'فرصة عمل مميزة لمطور واجهات أمامية', 'شركة التقنية المتقدمة', 'الكويت', 'kuwait', '1500 - 2500 د.ك', 'دوام كامل', ARRAY['خبرة 3 سنوات في React', 'معرفة TypeScript', 'خبرة في Git'], ARRAY['تقنية', 'برمجة', 'React'], 'featured', 'https://example.com/apply', true),
('محاسب قانوني', 'مطلوب محاسب قانوني للعمل في شركة استثمارية كبرى. خبرة لا تقل عن 5 سنوات.', 'وظيفة محاسب قانوني في شركة استثمارية', 'مجموعة الاستثمار العربي', 'السعودية', 'saudi', '15000 - 25000 ر.س', 'دوام كامل', ARRAY['شهادة CPA', 'خبرة 5 سنوات', 'إجادة برامج المحاسبة'], ARRAY['محاسبة', 'مالية'], 'high_pay', 'https://example.com/apply', true),
('مدير تسويق رقمي', 'نبحث عن مدير تسويق رقمي لقيادة فريق التسويق وتطوير استراتيجيات النمو.', 'قيادة فريق التسويق الرقمي', 'شركة الإمارات للتجارة', 'الإمارات', 'uae', '20000 - 35000 د.إ', 'دوام كامل', ARRAY['خبرة 7 سنوات', 'إدارة الحملات الإعلانية', 'تحليل البيانات'], ARRAY['تسويق', 'إدارة'], 'best', 'https://example.com/apply', true),
('مهندس شبكات', 'مطلوب مهندس شبكات للعمل في قطاع الاتصالات.', 'وظيفة مهندس شبكات', 'شركة الاتصالات القطرية', 'قطر', 'qatar', '18000 - 28000 ر.ق', 'دوام كامل', ARRAY['شهادة CCNA', 'خبرة 4 سنوات'], ARRAY['شبكات', 'IT'], 'urgent', 'https://example.com/apply', false),
('مصمم جرافيك', 'نبحث عن مصمم جرافيك مبدع للعمل على مشاريع متنوعة.', 'فرصة لمصمم جرافيك مبدع', 'وكالة الإبداع', 'عمان', 'oman', '800 - 1200 ر.ع', 'دوام جزئي', ARRAY['إجادة Adobe Creative Suite', 'خبرة سنتين'], ARRAY['تصميم', 'إبداع'], 'new', 'https://example.com/apply', false),
('مدير موارد بشرية', 'مطلوب مدير موارد بشرية لإدارة شؤون الموظفين.', 'إدارة الموارد البشرية', 'مجموعة البحرين المالية', 'البحرين', 'bahrain', '2000 - 3500 د.ب', 'دوام كامل', ARRAY['خبرة 6 سنوات', 'شهادة PHR'], ARRAY['موارد بشرية', 'إدارة'], 'none', 'https://example.com/apply', false),
('مطور تطبيقات موبايل', 'نبحث عن مطور تطبيقات موبايل للعمل على تطبيقات iOS و Android.', 'تطوير تطبيقات الجوال', 'شركة التطبيقات الذكية', 'مصر', 'egypt', '25000 - 45000 ج.م', 'دوام كامل', ARRAY['خبرة في Flutter', 'خبرة في React Native'], ARRAY['برمجة', 'موبايل'], 'featured', 'https://example.com/apply', true);

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, author, tags, is_published) VALUES
('كيف تكتب سيرة ذاتية احترافية', 'how-to-write-cv', 'تعلم أسرار كتابة السيرة الذاتية التي تجذب أصحاب العمل', 'محتوى المقال الكامل هنا...', 'فريق وظفني حالاً', ARRAY['نصائح', 'سيرة ذاتية'], true),
('أفضل 10 مهارات مطلوبة في 2024', 'top-skills-2024', 'اكتشف المهارات الأكثر طلباً في سوق العمل', 'محتوى المقال الكامل هنا...', 'فريق وظفني حالاً', ARRAY['مهارات', 'تطوير'], true),
('نصائح لمقابلة العمل الناجحة', 'interview-tips', 'كيف تستعد لمقابلة العمل وتترك انطباعاً إيجابياً', 'محتوى المقال الكامل هنا...', 'فريق وظفني حالاً', ARRAY['مقابلات', 'نصائح'], true);

-- Insert categories
INSERT INTO public.categories (name, slug, job_count) VALUES
('تقنية المعلومات', 'it', 15),
('المحاسبة والمالية', 'accounting', 12),
('التسويق', 'marketing', 8),
('الموارد البشرية', 'hr', 6),
('الهندسة', 'engineering', 10),
('التصميم', 'design', 5);