import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Loader2, Briefcase, Users, Globe, ArrowRight, CheckCircle2, TrendingUp, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import JobCard from '@/components/jobs/JobCard';
import FeaturedJobsSlider from '@/components/jobs/FeaturedJobsSlider';
import AdSense from '@/components/common/AdSense';
import { useJobs, useFeaturedJobs, useSearchJobs } from '@/hooks/useJobs';
import { countries } from '@/types/database';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  const { data: allJobs = [], isLoading: isLoadingJobs } = useJobs();
  const { data: featuredJobs = [] } = useFeaturedJobs();
  const { data: searchResults = [], isLoading: isSearchLoading } = useSearchJobs(debouncedSearch);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setIsSearching(searchTerm.length > 0);
  }, [searchTerm]);

  // Filter jobs by selected country
  const filteredJobsByCountry = useMemo(() => {
    if (selectedCountry === 'all') return allJobs;
    return allJobs.filter(job => job.country_slug === selectedCountry);
  }, [allJobs, selectedCountry]);

  // Calculate job counts per country
  const countriesWithJobCount = useMemo(() => {
    return countries.map(country => {
      const jobCount = allJobs.filter(job => job.country_slug === country.slug).length;
      return {
        ...country,
        jobCount
      };
    });
  }, [allJobs]);

  const latestJobs = filteredJobsByCountry.slice(0, 9);
  const displayJobs = isSearching ? searchResults : latestJobs;

  return (
    <Layout>
      <Helmet>
        <title>وظفني حالاً | محرك البحث الأول لوظائف الخليج ومصر</title>
        <meta
          name="description"
          content="بوابة التوظيف الأولى في الوطن العربي. ابحث عن أحدث الوظائف في الكويت، السعودية، الإمارات، قطر، عمان، البحرين ومصر. آلاف الفرص المتجددة يومياً للمواطنين والوافدين."
        />
        <meta name="keywords" content="وظائف الخليج، وظائف الكويت اليوم، وظائف السعودية ٢٠٢٤، وظائف دبي، وظائف قطر، عمل، توظيف، فرص عمل للمصريين، وظائف شاغرة، البحث عن عمل" />
        <link rel="canonical" href="https://www.wazafnihalan.com" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.wazafnihalan.com" />
        <meta property="og:title" content="وظفني حالاً | محرك البحث الأول لوظائف الخليج ومصر" />
        <meta property="og:description" content="آلاف الفرص الوظيفية بانتظارك. منصة واحدة تجمع لك أحدث فرص العمل في دول الخليج العربي ومصر." />
        <meta property="og:image" content="https://www.wazafnihalan.com/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.wazafnihalan.com" />
        <meta property="twitter:title" content="وظفني حالاً | أحدث وظائف الخليج" />
        <meta property="twitter:description" content="ابحث عن وظيفتك القادمة الآن في الكويت والسعودية والإمارات." />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "وظفني حالاً",
            "alternateName": "Wazafni Halan",
            "url": "https://www.wazafnihalan.com",
            "description": "منصة البحث عن الوظائف في الخليج العربي ومصر",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.wazafnihalan.com/?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-mesh min-h-[500px] flex items-center justify-center pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container-custom relative z-10 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs md:text-sm mb-6 animate-fade-in shadow-sm">
            <TrendingUp className="w-4 h-4 text-blue-300" />
            <span>نحدث الوظائف على مدار الساعة</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight animate-slide-up text-glow">
            طريقك نحو <span className="">الوظيفة المثالية</span> <br className="hidden md:block" /> في لمح البصر
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto px-2 animate-slide-up animate-delay-100 font-medium leading-relaxed">
            انضم إلى أكثر من <span className="text-blue-100 font-bold">٥٠,٠٠٠</span> باحث عن عمل يجدون فرصهم يومياً في الخليج العربي ومصر.
          </p>

          {/* Search Box */}
          <div className="max-w-3xl mx-auto animate-slide-up animate-delay-200">
            <div className="glass-card p-2 md:p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="مسمى الوظيفة، كلمات مفتاحية (مثل: محاسب، مهندس...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white text-foreground pr-12 pl-4 py-3 md:py-4 rounded-xl border-none focus:ring-2 focus:ring-blue-400 text-base md:text-lg transition-all placeholder:text-muted-foreground/60"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <button className="bg-primary hover:bg-primary/90 text-white font-bold py-3 md:py-4 px-8 md:px-10 rounded-xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 text-base md:text-lg">
                <Search className="w-5 h-5" />
                <span>ابحث الآن</span>
              </button>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 text-white/80 text-sm">
              <span>البحث الرائج:</span>
              <button onClick={() => setSearchTerm('مهندس')} className="hover:text-white underline underline-offset-4 decoration-white/30">مهندس</button>
              <button onClick={() => setSearchTerm('محاسب')} className="hover:text-white underline underline-offset-4 decoration-white/30">محاسب</button>
              <button onClick={() => setSearchTerm('مبيعات')} className="hover:text-white underline underline-offset-4 decoration-white/30">مبيعات</button>
              <button onClick={() => setSearchTerm('طبيب')} className="hover:text-white underline underline-offset-4 decoration-white/30">طبيب</button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="container-custom -mt-8 relative z-20 px-4">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-center text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Briefcase className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xl md:text-2xl font-bold">١,٠٠٠+</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">وظيفة شاغرة</p>
          </div>
          <div className="space-y-1 border-r border-border md:border-none lg:border-r">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Globe className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xl md:text-2xl font-bold">٧</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">دول عربية</p>
          </div>
          <div className="space-y-1 border-t border-border pt-4 md:border-t-0 md:pt-0 lg:border-r">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Users className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xl md:text-2xl font-bold">٥٠ ألف+</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">باحث عن عمل</p>
          </div>
          <div className="space-y-1 border-t border-border pt-4 md:border-t-0 md:pt-0 lg:border-r">
            <div className="flex items-center justify-center gap-2 text-primary">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xl md:text-2xl font-bold">٩٩٪</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">تحديث يومي</p>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="container-custom px-4 py-8 md:py-12">
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
              <h2 className="text-xl md:text-2xl font-bold">
                نتائج البحث عن "<span className="text-primary">{searchTerm}</span>"
              </h2>
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                مسح البحث
              </button>
            </div>

            {isSearchLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">جاري البحث عن أفضل الفرص...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {searchResults.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">عذراً، لم نجد نتائج لـ "{searchTerm}"</h3>
                <p className="text-muted-foreground">جرب كلمات مفتاحية أخرى أو تصفح الوظائف حسب الدولة.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!isSearching && (
        <>
          {/* AdSense Top */}
          <div className="container-custom py-8 px-4">
            <AdSense size="leaderboard" placement="home_top" />
          </div>

          <main className="container-custom px-4 py-12 md:py-20">
            {/* Featured Jobs Section */}
            {featuredJobs.length > 0 && (
              <section className="mb-16 md:mb-24">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">الوظائف المميزة</h2>
                    <p className="text-muted-foreground">فرص عمل مختارة بعناية لأجلك</p>
                  </div>
                  <Link to="/all-jobs" className="text-primary font-bold hover:underline flex items-center gap-1">
                    عرض الكل <ArrowRight className="w-4 h-4 rotate-180" />
                  </Link>
                </div>
                <FeaturedJobsSlider jobs={featuredJobs} />
              </section>
            )}

            {/* Browse by Country Section (Visual Overhaul) */}
            <section className="mb-16 md:mb-24">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">تصفح الوظائف حسب الدولة</h2>
                <div className="h-1.5 w-20 bg-primary mx-auto rounded-full mb-4"></div>
                <p className="text-muted-foreground max-w-xl mx-auto">اختر وجهتك المفضلة واستكشف آلاف الفرص الوظيفية في كل بلد</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6">
                {countriesWithJobCount.map((country) => (
                  <button
                    key={country.slug}
                    onClick={() => setSelectedCountry(prev => prev === country.slug ? 'all' : country.slug)}
                    className={`group relative overflow-hidden p-6 rounded-2xl border transition-all flex flex-col items-center justify-center gap-3 ${selectedCountry === country.slug
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                      : 'bg-card text-foreground border-border hover:border-primary/50 hover:shadow-md'
                      }`}
                  >
                    <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-300 transform-gpu" role="img" aria-label={country.name}>
                      {country.flag}
                    </span>
                    <span className="font-bold text-sm md:text-base whitespace-nowrap">{country.name}</span>
                    <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full ${selectedCountry === country.slug ? 'bg-white/20' : 'bg-muted'
                      }`}>
                      {country.jobCount} وظيفة
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* AdSense Middle */}
            <div className="my-16">
              <AdSense size="rectangle" placement="home_middle" />
            </div>

            {/* Latest Jobs Section */}
            <section id="jobs-section" className="mb-16 md:mb-24">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {selectedCountry === 'all'
                      ? 'أحدث الوظائف المضافة'
                      : `أحدث الوظائف في ${countriesWithJobCount.find(c => c.slug === selectedCountry)?.name}`
                    }
                  </h2>
                  <p className="text-muted-foreground">كن أول المتقدمين للوظائف الجديدة في منطقتك</p>
                </div>

                {selectedCountry !== 'all' && (
                  <button
                    onClick={() => setSelectedCountry('all')}
                    className="flex items-center gap-2 text-sm font-bold bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-lg transition-all"
                  >
                    <span>عرض كافة الدول</span>
                    <Globe className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isLoadingJobs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl h-48 animate-pulse"></div>
                  ))}
                </div>
              ) : latestJobs.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {latestJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                  <div className="mt-12 text-center">
                    <Link to="/all-jobs">
                      <button className="inline-flex items-center gap-2 bg-primary text-white font-bold px-10 py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30">
                        <span>تصفح كافة الوظائف</span>
                        <ArrowRight className="w-5 h-5 rotate-180" />
                      </button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="bg-card rounded-2xl border border-border p-20 text-center">
                  <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">لا توجد وظائف حالياً في هذا القسم</h3>
                  <p className="text-muted-foreground mb-6">برجاء اختيار دولة أخرى أو العودة لاحقاً.</p>
                  <button onClick={() => setSelectedCountry('all')} className="btn-primary">عرض جميع الوظائف</button>
                </div>
              )}
            </section>

            {/* How it Works Section */}
            <section className="bg-secondary/30 rounded-3xl p-8 md:p-16 mb-16 md:mb-24">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">كيف تجد وظيفتك معنا؟</h2>
                <p className="text-muted-foreground">٣ خطوات بسيطة تفصلك عن حلمك الوظيفي القادم</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-white border border-border shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">١. ابحث</h3>
                  <p className="text-muted-foreground leading-relaxed">استخدم محرك البحث الذكي للعثور على الوظائف التي تناسب مهاراتك.</p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-white border border-border shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:-rotate-6">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">٢. اختر</h3>
                  <p className="text-muted-foreground leading-relaxed">تصفح التفاصيل وقم باختيار الوظائف التي تطمح بالانضمام إليها.</p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-white border border-border shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">٣. قدم</h3>
                  <p className="text-muted-foreground leading-relaxed">قدم طلبك مباشرة عبر الروابط الرسمية لكل شركة أو معلن.</p>
                </div>
              </div>
            </section>
          </main>

          {/* Call to Action Section */}
          <section className="container-custom px-4 mb-16 md:mb-24">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/20 bg-primary group">
              {/* Section Background Image */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-110 opacity-40"
                style={{
                  backgroundImage: "url('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/dfb430a7-2410-42ab-9748-17ff0353bac5/dbybn6x-a81b5f5f-4525-4a45-9d8f-b1b53f8e3043.png/v1/fill/w_1192,h_670,q_70,strp/diamond_pattern_by_lazururh_dbybn6x-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MjE2MCIsInBhdGgiOiIvZi9kZmI0MzBhNy0yNDEwLTQyYWItOTc0OC0xN2ZmMDM1M2JhYzUvZGJ5Ym42eC1hODFiNWY1Zi00NTI1LTRhNDUtOWQ4Zi1iMWI1M2Y4ZTMwNDMucG5nIiwid2lkdGgiOiI8PTM4NDAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.VnZxVJy01oPvLiY0yV0G_eGmQsoji-9XVKQXnx4gcd4')",
                }}
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary via-primary/80 to-blue-900/40" />

              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

              <div className="relative z-10 p-8 md:p-16 text-center text-white max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">مستعد لبدء مسيرتك المهنية؟</h2>
                <p className="text-lg md:text-xl text-blue-50 mb-10 leading-relaxed opacity-90">
                  لا تضيع المزيد من الوقت. آلاف الشركات تبحث عن موهبتك الآن في أكبر منصة وظائف بالخليج.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/all-jobs" className="w-full sm:w-auto bg-white text-primary font-bold px-10 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg text-lg transform hover:-translate-y-1 active:scale-95">
                    تصفح كافة الوظائف
                  </Link>

                </div>
              </div>
            </div>
          </section>

          {/* AdSense Footer */}
          <div className="container-custom py-8 px-4 text-center">
            <AdSense size="leaderboard" placement="footer_top" />
          </div>
        </>
      )}
    </Layout>
  );
};

export default Index;