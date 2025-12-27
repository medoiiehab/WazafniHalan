import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import JobCard from '@/components/jobs/JobCard';
import FeaturedJobsSlider from '@/components/jobs/FeaturedJobsSlider';
import AdSense from '@/components/common/AdSense';
import Sidebar from '@/components/common/Sidebar';
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

  const latestJobs = filteredJobsByCountry.slice(0, 6);
  const displayJobs = isSearching ? searchResults : latestJobs;

  return (
    <Layout>
      <Helmet>
        <title>وظفني حالاً - أحدث الوظائف في الكويت والسعودية والإمارات وقطر</title>
        <meta
          name="description"
          content="ابحث عن أحدث الوظائف في دول الخليج العربي ومصر. وظائف في الكويت، السعودية، الإمارات، قطر، عمان، البحرين ومصر. آلاف الفرص الوظيفية تنتظرك."
        />
        <meta name="keywords" content="وظائف الخليج، وظائف الكويت، وظائف السعودية، وظائف الإمارات، وظائف قطر، عمل، توظيف، فرص عمل" />
        <link rel="canonical" href="https://wazfni-now.com" />
        <meta property="og:title" content="وظفني حالاً - أحدث الوظائف في الخليج العربي" />
        <meta property="og:description" content="ابحث عن أحدث الوظائف في دول الخليج العربي ومصر. آلاف الفرص الوظيفية تنتظرك." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wazfni-now.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="وظفني حالاً - أحدث الوظائف في الخليج العربي" />
        <meta name="twitter:description" content="ابحث عن أحدث الوظائف في دول الخليج العربي ومصر." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "وظفني حالاً",
            "url": "https://wazfni-now.com",
            "description": "منصة البحث عن الوظائف في الخليج العربي ومصر",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://wazfni-now.com/?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-8 md:py-16 lg:py-24">
        <div className="container-custom px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 animate-fade-in">
            ابحث عن وظيفة أحلامك في الخليج
          </h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90 mb-6 md:mb-8 max-w-2xl mx-auto px-2 animate-fade-in">
            آلاف الفرص الوظيفية في دول الخليج العربي ومصر في انتظارك
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto px-2 sm:px-0 animate-slide-up">
            <div className="bg-card rounded-xl p-2 shadow-lg flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ابحث عن وظيفة بالعنوان أو الوسم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field text-foreground pr-10 w-full"
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
        <div className="container-custom px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground break-words">
                نتائج البحث عن "{searchTerm}"
              </h2>
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-primary hover:underline self-start sm:self-center"
              >
                مسح البحث
              </button>
            </div>

            {isSearchLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid gap-3 md:gap-4">
                {searchResults.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                لا توجد نتائج مطابقة لبحثك
              </p>
            )}
          </div>
        </div>
      )}

      {/* AdSense 1 - After Hero */}
      {!isSearching && (
        <div className="py-4 md:py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <AdSense size="leaderboard" placement="home_top" />
        </div>
      )}

      {/* AdSense 2 - Banner */}
      {!isSearching && (
        <div className="py-4 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <AdSense size="banner" placement="home_banner_1" />
        </div>
      )}

      {!isSearching && (
        <div className="container-custom px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              {/* AdSense 3 - Before Featured */}
              <div className="mb-6 md:mb-8 overflow-hidden">
                <AdSense size="inline" placement="home_before_featured" />
              </div>

              {/* Featured Jobs */}
              {featuredJobs.length > 0 && (
                <section className="mb-8 md:mb-12">
                  <h2 className="section-title text-lg sm:text-xl md:text-2xl">الوظائف المميزة</h2>
                  <div className="mt-4">
                    <FeaturedJobsSlider jobs={featuredJobs} />
                  </div>
                </section>
              )}

              {/* AdSense 4 - After Featured */}
              <div className="my-6 md:my-8 overflow-hidden">
                <AdSense size="rectangle" placement="home_after_featured" />
              </div>

              {/* AdSense 5 - Inline */}
              <div className="my-6 md:my-8 overflow-hidden">
                <AdSense size="inline" placement="home_mid_content_1" />
              </div>

              {/* Jobs by Country - Dropdown Filter */}
              <section className="overflow-hidden">
                <h2 className="section-title text-lg sm:text-xl md:text-2xl">تصفية الوظائف حسب الدولة</h2>
                <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border mt-4">
                  <label htmlFor="country-filter" className="block text-sm font-medium text-foreground mb-3">
                    اختر الدولة
                  </label>
                  <select
                    id="country-filter"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm md:text-base"
                  >
                    <option value="all">جميع الدول ({allJobs.length} وظيفة)</option>
                    {countriesWithJobCount.map((country) => (
                      <option key={country.slug} value={country.slug}>
                        {country.flag} {country.name} ({country.jobCount} وظيفة)
                      </option>
                    ))}
                  </select>

                  {selectedCountry !== 'all' && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">
                          {countriesWithJobCount.find(c => c.slug === selectedCountry)?.name}:
                        </span>{' '}
                        {filteredJobsByCountry.length} وظيفة متاحة
                      </p>
                      <button
                        onClick={() => setSelectedCountry('all')}
                        className="text-sm text-primary hover:underline self-start sm:self-center"
                      >
                        عرض جميع الوظائف
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* AdSense 6 - After Latest Jobs */}
              <div className="my-6 md:my-8 overflow-hidden">
                <AdSense size="leaderboard" placement="home_after_latest" />
              </div>

              {/* AdSense 7 - Large Rectangle */}
              <div className="my-6 md:my-8 overflow-hidden">
                <AdSense size="large-rectangle" placement="home_large_rect" />
              </div>

              {/* Latest Jobs */}
              <section className="mb-8 md:mb-12 overflow-hidden" style={{ marginTop: '2rem' }}>
                <h2 className="section-title text-lg sm:text-xl md:text-2xl">
                  {selectedCountry === 'all'
                    ? 'أحدث الوظائف'
                    : `أحدث الوظائف في ${countriesWithJobCount.find(c => c.slug === selectedCountry)?.name}`
                  }
                </h2>
                {isLoadingJobs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : latestJobs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-4">
                    {latestJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12 bg-card rounded-xl border border-border mt-4">
                    <p className="text-muted-foreground text-base md:text-lg mb-4 px-2">
                      {selectedCountry === 'all'
                        ? 'لا توجد وظائف متاحة حالياً'
                        : `لا توجد وظائف متاحة في ${countriesWithJobCount.find(c => c.slug === selectedCountry)?.name}`
                      }
                    </p>
                    {selectedCountry !== 'all' && (
                      <button
                        onClick={() => setSelectedCountry('all')}
                        className="btn-primary text-sm md:text-base"
                      >
                        عرض جميع الوظائف
                      </button>
                    )}
                  </div>
                )}
              </section>

              {/* AdSense 8 - After Countries */}
              <div className="mt-6 md:mt-8 overflow-hidden">
                <AdSense size="inline" placement="home_bottom_inline" />
              </div>
            </div>


          </div>
        </div>
      )}

      {/* AdSense 12 - Before Footer */}
      {!isSearching && (
        <div className="py-4 md:py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <AdSense size="leaderboard" placement="footer_top" />
        </div>
      )}
    </Layout>
  );
};

export default Index;