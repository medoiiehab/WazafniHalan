import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Loader2, Filter, X, MapPin, Building2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import JobCard from '@/components/jobs/JobCard';
import AdSense from '@/components/common/AdSense';
import { useJobs } from '@/hooks/useJobs';
import { countries } from '@/types/database';

const AllJobs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

    const { data: allJobs = [], isLoading, error } = useJobs();

    // Debug log
    useEffect(() => {
        console.log('AllJobs - Data:', { allJobs, isLoading, error });
    }, [allJobs, isLoading, error]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Filter and sort jobs
    const filteredJobs = useMemo(() => {
        if (!Array.isArray(allJobs)) return [];

        let filtered = [...allJobs];

        // Filter by search term
        if (debouncedSearch.trim()) {
            const searchLower = debouncedSearch.toLowerCase();
            filtered = filtered.filter((job) => {
                const matchesTitle = job?.title?.toLowerCase().includes(searchLower) || false;
                const matchesCompany = job?.company?.toLowerCase().includes(searchLower) || false;
                const matchesDescription = job?.description?.toLowerCase().includes(searchLower) || false;
                const matchesCountry = job?.country?.toLowerCase().includes(searchLower) || false;
                const matchesTags = Array.isArray(job?.tags)
                    ? job.tags.some(tag => tag?.toLowerCase().includes(searchLower))
                    : false;
                return matchesTitle || matchesCompany || matchesDescription || matchesCountry || matchesTags;
            });
        }

        // Filter by selected countries
        if (selectedCountries.length > 0) {
            filtered = filtered.filter((job) =>
                job?.country_slug && selectedCountries.includes(job.country_slug)
            );
        }

        // Filter by selected companies
        if (selectedCompanies.length > 0) {
            filtered = filtered.filter((job) =>
                job?.company && selectedCompanies.includes(job.company)
            );
        }

        // Sort jobs
        filtered = filtered.sort((a, b) => {
            const dateA = new Date(a?.created_at || 0).getTime();
            const dateB = new Date(b?.created_at || 0).getTime();

            if (sortBy === 'newest') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });

        return filtered;
    }, [allJobs, debouncedSearch, selectedCountries, selectedCompanies, sortBy]);

    // Calculate job counts per country
    const countriesWithJobCount = useMemo(() => {
        if (!Array.isArray(allJobs)) return countries.map(c => ({ ...c, jobCount: 0 }));

        return countries.map(country => {
            const jobCount = allJobs.filter((job) =>
                job?.country_slug === country.slug
            ).length;
            return {
                ...country,
                jobCount
            };
        });
    }, [allJobs]);

    // Calculate job counts per company
    const companiesWithJobCount = useMemo(() => {
        if (!Array.isArray(allJobs)) return [];

        const companyMap = new Map<string, number>();
        allJobs.forEach((job) => {
            if (job?.company) {
                companyMap.set(job.company, (companyMap.get(job.company) || 0) + 1);
            }
        });

        return Array.from(companyMap.entries())
            .map(([company, jobCount]) => ({ company, jobCount }))
            .sort((a, b) => b.jobCount - a.jobCount);
    }, [allJobs]);

    // Toggle country selection
    const toggleCountry = (countrySlug: string) => {
        setSelectedCountries(prev =>
            prev.includes(countrySlug)
                ? prev.filter(slug => slug !== countrySlug)
                : [...prev, countrySlug]
        );
    };

    // Toggle company selection
    const toggleCompany = (company: string) => {
        setSelectedCompanies(prev =>
            prev.includes(company)
                ? prev.filter(c => c !== company)
                : [...prev, company]
        );
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCountries([]);
        setSelectedCompanies([]);
        setSortBy('newest');
    };

    const hasActiveFilters = searchTerm.trim() || selectedCountries.length > 0 || selectedCompanies.length > 0;

    if (error) {
        return (
            <Layout>
                <Helmet>
                    <title>خطأ في تحميل البيانات - وظفني حالاً</title>
                </Helmet>
                <div className="container-custom py-24 text-center">
                    <div className="bg-destructive/10 border border-destructive rounded-xl p-8 max-w-md mx-auto">
                        <h2 className="text-xl font-bold text-destructive mb-2">خطأ في تحميل البيانات</h2>
                        <p className="text-muted-foreground">تعذر تحميل الوظائف. يرجى المحاولة مرة أخرى.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary mt-4"
                        >
                            إعادة تحميل الصفحة
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Helmet>
                <title>{`جميع الوظائف - ${allJobs.length} فرصة عمل متاحة | وظفني حالاً`}</title>
                <meta
                    name="description"
                    content={`تصفح جميع الوظائف المتاحة في دول الخليج العربي ومصر. ${allJobs.length} فرصة عمل في مختلف المجالات والتخصصات. ابحث عن وظيفتك المثالية الآن.`}
                />
                <meta name="keywords" content="جميع الوظائف، فرص عمل، وظائف الخليج، وظائف الشرق الأوسط، توظيف، وظائف شاغرة" />
                <link rel="canonical" href="https://wazfni-now.com/all-jobs" />
            </Helmet>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-8 md:py-12">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                            جميع الوظائف المتاحة
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl opacity-90 mb-6">
                            {allJobs.length} فرصة عمل في مختلف الدول والمجالات
                        </p>
                    </div>

                    {/* Search Box */}
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-card/20 backdrop-blur-sm rounded-xl p-2 shadow-lg flex">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="ابحث عن وظيفة، شركة، دولة، مجال..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-transparent border-0 text-white placeholder-white/70 focus:outline-none focus:ring-0 pr-10 py-3 text-base sm:text-lg"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
                            </div>
                        </div>
                        <p className="text-xs sm:text-sm text-white/60 mt-2 text-center">
                            ابحث في: العناوين • الشركات • الدول • الوسوم • الوصف
                        </p>
                    </div>
                </div>
            </section>

            {/* AdSense - After Hero Section */}
            <div className="py-4 md:py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <AdSense size="leaderboard" placement="all_jobs_top" />
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden container-custom px-4 sm:px-6 lg:px-8 py-4">
                <button
                    onClick={() => setShowMobileFilters(true)}
                    className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-3 w-full justify-center text-foreground hover:bg-accent transition-colors"
                >
                    <Filter className="w-5 h-5" />
                    <span>تصفية الوظائف</span>
                    {hasActiveFilters && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center">
                            {selectedCountries.length + (searchTerm.trim() ? 1 : 0)}
                        </span>
                    )}
                </button>
            </div>

            {/* Main Content */}
            <div className="container-custom px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Desktop Filters Sidebar */}
                    <div className="hidden lg:block lg:w-80 space-y-6">
                        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-foreground">التصفية</h2>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                        <X className="w-4 h-4" />
                                        مسح الكل
                                    </button>
                                )}
                            </div>

                            {/* Countries Filter */}
                            <div className="mb-6">
                                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    الدول
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    <label className="flex items-center justify-between p-2 hover:bg-accent/10 rounded-lg cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedCountries.length === 0}
                                                onChange={clearFilters}
                                                className="rounded border-border text-primary focus:ring-primary"
                                            />
                                            <span className="text-foreground">جميع الدول</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground bg-accent px-2 py-1 rounded">
                                            {allJobs.length}
                                        </span>
                                    </label>
                                    {countriesWithJobCount.map((country) => (
                                        <label
                                            key={country.slug}
                                            className="flex items-center justify-between p-2 hover:bg-accent/10 rounded-lg cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCountries.includes(country.slug)}
                                                    onChange={() => toggleCountry(country.slug)}
                                                    className="rounded border-border text-primary focus:ring-primary"
                                                />
                                                <span className="text-xl">{country.flag}</span>
                                                <span className="text-foreground">{country.name}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground bg-accent px-2 py-1 rounded">
                                                {country.jobCount}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Companies Filter */}
                            <div className="mb-6">
                                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    الشركات
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {companiesWithJobCount.map((item) => (
                                        <label
                                            key={item.company}
                                            className="flex items-center justify-between p-2 hover:bg-accent/10 rounded-lg cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCompanies.includes(item.company)}
                                                    onChange={() => toggleCompany(item.company)}
                                                    className="rounded border-border text-primary focus:ring-primary"
                                                />
                                                <span className="text-foreground">{item.company}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground bg-accent px-2 py-1 rounded">
                                                {item.jobCount}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Sorting */}
                            <div>
                                <h3 className="font-medium text-foreground mb-3">ترتيب حسب</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 p-2 hover:bg-accent/10 rounded-lg cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sort"
                                            checked={sortBy === 'newest'}
                                            onChange={() => setSortBy('newest')}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span className="text-foreground">الأحدث أولاً</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-2 hover:bg-accent/10 rounded-lg cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sort"
                                            checked={sortBy === 'oldest'}
                                            onChange={() => setSortBy('oldest')}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span className="text-foreground">الأقدم أولاً</span>
                                    </label>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Jobs List */}
                    <div className="flex-1">
                        <div>
                        {/* Search Results Summary */}
                        {searchTerm.trim() && (
                            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                                <p className="text-sm text-foreground">
                                    <span className="font-semibold">نتائج البحث</span> عن "<span className="font-bold text-green-700 dark:text-green-300">{searchTerm}</span>": 
                                    <span className="font-bold text-green-700 dark:text-green-300 mr-1">{filteredJobs.length}</span> وظيفة متطابقة
                                </p>
                            </div>
                        )}

                        {/* Active Filters Bar */}
                        {(hasActiveFilters || isLoading) && (
                            <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-medium text-foreground">
                                            {isLoading ? 'جاري التحميل...' : `${filteredJobs.length} وظيفة`}
                                        </h3>
                                        {hasActiveFilters && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedCountries.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                                                        {selectedCountries.length} دولة
                                                        <button
                                                            onClick={() => setSelectedCountries([])}
                                                            className="hover:text-primary/70"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                )}
                                                {selectedCompanies.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full">
                                                        {selectedCompanies.length} شركة
                                                        <button
                                                            onClick={() => setSelectedCompanies([])}
                                                            className="hover:text-purple-500"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                )}
                                                {searchTerm.trim() && (
                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium">
                                                        🔍 "{searchTerm.substring(0, 15)}{searchTerm.length > 15 ? '...' : ''}"
                                                        <button
                                                            onClick={() => setSearchTerm('')}
                                                            className="hover:text-green-500"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-primary hover:underline flex items-center gap-1"
                                        >
                                            <X className="w-4 h-4" />
                                            مسح الفلاتر
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}



                        {/* AdSense - Rectangle Ad */}
                        <div className="my-6 md:my-8 overflow-hidden">
                            <AdSense size="rectangle" placement="all_jobs_middle" />
                        </div>

                        {/* Jobs Grid/List */}
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : filteredJobs.length > 0 ? (
                            <>
                                {/* Mobile View - List */}
                                <div className="lg:hidden space-y-4">
                                    {filteredJobs.map((job) => (
                                        <div key={job.id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                                            <Link to={`/job/${job.id}`} className="block p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                                                            {job.country}
                                                        </span>
                                                        {job.is_featured && (
                                                            <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                                مميز
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                                                    {job.title}
                                                </h3>

                                                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                                                    {job.company && (
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="w-4 h-4" />
                                                            {job.company}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(job.created_at).toLocaleDateString('ar-SA')}
                                                    </span>
                                                </div>

                                                {job.salary && (
                                                    <p className="text-primary font-bold text-lg">
                                                        {job.salary}
                                                    </p>
                                                )}
                                            </Link>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View - Grid */}
                                <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredJobs.map((job) => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 bg-card rounded-xl border border-border">
                                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    لا توجد نتائج
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    لم نتمكن من العثور على وظائف تطابق معايير البحث
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="btn-primary px-6 py-2"
                                >
                                    عرض جميع الوظائف
                                </button>
                            </div>
                        )}


                        </div>
                    </div>
                </div>
            </div>

            {/* AdSense - Before Footer */}
            <div className="py-4 md:py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <AdSense size="leaderboard" placement="all_jobs_bottom" />
            </div>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
                    <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-card shadow-xl">
                        <div className="h-full overflow-y-auto">
                            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-foreground">تصفية الوظائف</h2>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="p-2 hover:bg-accent rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-4 space-y-6">
                                {/* Countries Filter */}
                                <div>
                                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        الدول
                                    </h3>
                                    <div className="space-y-2">
                                        <label className="flex items-center justify-between p-3 hover:bg-accent/10 rounded-lg cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCountries.length === 0}
                                                    onChange={clearFilters}
                                                    className="rounded border-border text-primary focus:ring-primary"
                                                />
                                                <span className="text-foreground">جميع الدول</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground bg-accent px-2 py-1 rounded">
                                                {allJobs.length}
                                            </span>
                                        </label>
                                        {countriesWithJobCount.map((country) => (
                                            <label
                                                key={country.slug}
                                                className="flex items-center justify-between p-3 hover:bg-accent/10 rounded-lg cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCountries.includes(country.slug)}
                                                        onChange={() => toggleCountry(country.slug)}
                                                        className="rounded border-border text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-xl">{country.flag}</span>
                                                    <span className="text-foreground">{country.name}</span>
                                                </div>
                                                <span className="text-sm text-muted-foreground bg-accent px-2 py-1 rounded">
                                                    {country.jobCount}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Companies Filter */}
                                <div>
                                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        الشركات
                                    </h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {companiesWithJobCount.map((item) => (
                                            <label
                                                key={item.company}
                                                className="flex items-center justify-between p-3 hover:bg-accent/10 rounded-lg cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCompanies.includes(item.company)}
                                                        onChange={() => toggleCompany(item.company)}
                                                        className="rounded border-border text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-foreground">{item.company}</span>
                                                </div>
                                                <span className="text-sm text-muted-foreground bg-accent px-2 py-1 rounded">
                                                    {item.jobCount}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Sorting */}
                                <div>
                                    <h3 className="font-medium text-foreground mb-3">ترتيب حسب</h3>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 p-3 hover:bg-accent/10 rounded-lg cursor-pointer">
                                            <input
                                                type="radio"
                                                name="sort-mobile"
                                                checked={sortBy === 'newest'}
                                                onChange={() => setSortBy('newest')}
                                                className="text-primary focus:ring-primary"
                                            />
                                            <span className="text-foreground">الأحدث أولاً</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 hover:bg-accent/10 rounded-lg cursor-pointer">
                                            <input
                                                type="radio"
                                                name="sort-mobile"
                                                checked={sortBy === 'oldest'}
                                                onChange={() => setSortBy('oldest')}
                                                className="text-primary focus:ring-primary"
                                            />
                                            <span className="text-foreground">الأقدم أولاً</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Apply Filters Button */}
                                <div className="sticky bottom-0 bg-card pt-4 border-t border-border">
                                    <button
                                        onClick={() => setShowMobileFilters(false)}
                                        className="btn-primary w-full py-3 text-lg"
                                    >
                                        تطبيق الفلاتر
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AllJobs;