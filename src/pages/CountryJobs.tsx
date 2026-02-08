import { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Loader2, ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import JobCard from '@/components/jobs/JobCard';
import FeaturedJobsSlider from '@/components/jobs/FeaturedJobsSlider';
import Sidebar from '@/components/common/Sidebar';
import AdSense from '@/components/common/AdSense';
import { useJobsByCountry } from '@/hooks/useJobs';
import { countries } from '@/types/database';

const CountryJobs = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);



  const country = countries.find((c) => c.slug === countrySlug);
  const { data: countryJobs = [], isLoading } = useJobsByCountry(countrySlug || '');

  console.log('CountryJobs: Rendering', { countrySlug, country, isLoading, jobsCount: countryJobs.length });

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

  // Filter jobs by search term
  const searchResults = useMemo(() => {
    if (!debouncedSearch.trim()) return countryJobs;

    return countryJobs.filter((job) => {
      const matchesTitle = job.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCompany = job.company?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesTags = job.tags?.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()));
      return matchesTitle || matchesCompany || matchesTags;
    });
  }, [countryJobs, debouncedSearch]);

  // Get featured jobs for this country
  const featuredJobs = useMemo(() => {
    return countryJobs.filter(job => job.is_featured);
  }, [countryJobs]);

  // Get all jobs for this country
  const allCountryJobs = useMemo(() => {
    return countryJobs;
  }, [countryJobs]);



  if (!country) {
    return <Navigate to="/404" replace />;
  }

  const countryIntros: Record<string, string> = {
    kuwait: 'اكتشف أحدث الفرص الوظيفية في دولة الكويت.',
    saudi: 'ابحث عن وظيفتك المثالية في المملكة العربية السعودية.',
    uae: 'استكشف سوق العمل في الإمارات العربية المتحدة.',
    qatar: 'فرص وظيفية مميزة في دولة قطر.',
    oman: 'اعثر على وظيفتك في سلطنة عمان.',
    bahrain: 'وظائف متاحة في مملكة البحرين.',
    egypt: 'أحدث الوظائف في جمهورية مصر العربية.',
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <Layout>
        <div className="container-custom py-24 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">جاري تحميل الوظائف...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>وظائف {country.name} - أحدث فرص العمل {new Date().getFullYear()} | وظفني حالاً</title>
        <meta name="description" content={`ابحث عن أحدث الوظائف في ${country.name}. ${countryJobs.length} فرصة عمل متاحة الآن. تصفح وقدم على أفضل الوظائف في ${country.name}.`} />
        <meta name="keywords" content={`وظائف ${country.name}، فرص عمل ${country.name}، توظيف ${country.name}، شواغر ${country.name}`} />
        <link rel="canonical" href={`https://www.wazafnihalan.com/jobs/${country.slug}`} />
        <meta property="og:title" content={`وظائف ${country.name} - ${countryJobs.length} فرصة عمل متاحة`} />
        <meta property="og:description" content={`ابحث عن أحدث الوظائف في ${country.name}. ${countryJobs.length} فرصة عمل متاحة الآن.`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": `وظائف ${country.name}`,
            "description": `قائمة الوظائف المتاحة في ${country.name}`,
            "numberOfItems": countryJobs.length,
            "itemListElement": countryJobs.slice(0, 5).map((job, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "JobPosting",
                "title": job.title || "وظيفة",
                "description": job.short_description || job.description?.slice(0, 200) || "لا يوجد وصف",
                "datePosted": job.created_at,
                "hiringOrganization": {
                  "@type": "Organization",
                  "name": job.company || "شركة غير محددة"
                },
                "jobLocation": {
                  "@type": "Place",
                  "address": {
                    "@type": "PostalAddress",
                    "addressCountry": country.name
                  }
                }
              }
            }))
          })}
        </script>
      </Helmet>

      {/* Breadcrumb Navigation */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-primary hover:underline flex items-center gap-1">
              الرئيسية
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">وظائف {country.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16 md:py-24">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in">
            <span className="text-5xl md:text-6xl">{country.flag}</span>
            <h1 className="text-3xl md:text-5xl font-bold">
              وظائف {country.name}
            </h1>
          </div>
          <p className="text-lg md:text-xl opacity-90 mb-2 max-w-2xl mx-auto animate-fade-in">
            {countryIntros[country.slug] || `ابحث عن أحدث الوظائف في ${country.name}`}
          </p>
          <p className="text-md opacity-75 mb-8 animate-fade-in">
            {countryJobs.length} وظيفة متاحة
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto animate-slide-up">
            <div className="bg-card rounded-xl p-2 shadow-lg flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ابحث عن وظيفة بالعنوان أو الوسم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field text-foreground pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
              <button className="btn-primary whitespace-nowrap">
                بحث
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      {isSearching && (
        <div className="container-custom py-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                نتائج البحث عن "{searchTerm}" في {country.name}
              </h2>
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-primary hover:underline"
              >
                مسح البحث
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid gap-4">
                {searchResults.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                لا توجد نتائج مطابقة لبحثك في {country.name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* AdSense 1 - After Hero */}
      {!isSearching && (
        <div className="py-6">
          <AdSense size="leaderboard" placement="home_top" />
        </div>
      )}

      {/* AdSense 2 - Banner */}
      {!isSearching && (
        <div className="py-4">
          <AdSense size="banner" placement="home_banner_1" />
        </div>
      )}

      {!isSearching && (
        <div className="container-custom py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* AdSense 3 - Before Featured */}
              <AdSense size="inline" className="mb-8" placement="home_before_featured" />

              {/* Featured Jobs */}
              {featuredJobs.length > 0 && (
                <section className="mb-12">
                  <h2 className="section-title">الوظائف المميزة في {country.name}</h2>
                  <FeaturedJobsSlider jobs={featuredJobs} />
                </section>
              )}

              {/* AdSense 4 - After Featured */}
              <AdSense size="rectangle" className="my-8 mx-auto" placement="home_after_featured" />

              {/* AdSense 5 - Inline */}
              <AdSense size="inline" className="my-8" placement="home_mid_content_1" />

              {/* Latest Jobs */}
              <section className="mb-12">
                <h2 className="section-title">الوظائف المتاحة في {country.name}</h2>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : allCountryJobs.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {allCountryJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                    {/* Pagination/Count message removed as we show all jobs */}
                  </>
                ) : (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <p className="text-muted-foreground text-lg mb-4">
                      لا توجد وظائف متاحة حالياً في {country.name}
                    </p>
                    <Link to="/" className="btn-primary inline-block">
                      العودة للصفحة الرئيسية
                    </Link>
                  </div>
                )}
              </section>

              {/* AdSense 6 - After Latest Jobs */}
              <AdSense size="leaderboard" className="my-8" placement="home_after_latest" />

              {/* AdSense 7 - Large Rectangle */}
              <AdSense size="large-rectangle" className="my-8 mx-auto" placement="home_large_rect" />

              {/* Other Countries */}
              <section>
                <h2 className="section-title">دول أخرى</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {countries
                    .filter(c => c.slug !== countrySlug)
                    .map((otherCountry) => (
                      <Link
                        key={otherCountry.slug}
                        to={`/jobs/${otherCountry.slug}`}
                        className="job-card flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{otherCountry.flag}</span>
                          <div>
                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                              وظائف {otherCountry.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              استكشف الوظائف المتاحة
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </section>

              {/* AdSense 8 - After Countries */}
              <AdSense size="inline" className="mt-8" placement="home_bottom_inline" />
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block lg:w-[320px] space-y-6">
              {/* AdSense 9 - Sidebar Top */}
              <AdSense size="rectangle" placement="sidebar_top" />
              <Sidebar showSearch={false} />
              {/* AdSense 10 - Sidebar Middle */}
              <AdSense size="rectangle" placement="sidebar_middle" />
              {/* AdSense 11 - Sidebar Bottom */}
              <AdSense size="large-rectangle" placement="sidebar_bottom" />
            </div>
          </div>
        </div>
      )}

      {/* AdSense 12 - Before Footer */}
      {!isSearching && (
        <div className="py-6">
          <AdSense size="leaderboard" placement="footer_top" />
        </div>
      )}
    </Layout>
  );
};

export default CountryJobs;
