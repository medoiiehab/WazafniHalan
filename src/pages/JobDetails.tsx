import { useParams, Navigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Building2, Banknote, Calendar, ExternalLink, Share2, ArrowRight, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import JobCard from '@/components/jobs/JobCard';
import AdSense from '@/components/common/AdSense';
import { useJob, usePublishedJobs } from '@/hooks/useJobs';
import { useTrackJobEvent } from '@/hooks/useJobAnalytics';
import { exclusiveTagLabels, Job } from '@/types/database';
import PageHeader from '@/components/layout/PageHeader';

// Placeholder work images
const placeholderImages = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=400&fit=crop',
];

const getJobImage = (job: Job) => {
  if (job.image_url) return job.image_url;
  const index = job.id.charCodeAt(0) % placeholderImages.length;
  return placeholderImages[index];
};

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { data: job, isLoading } = useJob(jobId || '');
  const { data: allJobs = [] } = usePublishedJobs();
  const trackEvent = useTrackJobEvent();

  // Track job view
  useEffect(() => {
    if (job?.id) {
      trackEvent.mutate({ jobId: job.id, eventType: 'view' });
    }
  }, [job?.id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!job) {
    return <Navigate to="/404" replace />;
  }

  const relatedJobs = allJobs.filter((j) => j.id !== job.id && j.country_slug === job.country_slug).slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: job.title, text: `وظيفة: ${job.title}`, url: window.location.href });
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>{job.title} | وظائف {job.country} | وظفني حالاً</title>
        <meta name="description" content={job.short_description || job.description.slice(0, 160)} />
        <meta name="keywords" content={job.focus_keyword || `${job.title}، وظائف ${job.country}، ${job.company || ''}، فرص عمل`} />
        <link rel="canonical" href={`https://www.wazafnihalan.com/job/${job.id}`} />
        <meta property="og:title" content={`${job.title} - ${job.company || 'وظيفة جديدة'}`} />
        <meta property="og:description" content={job.short_description || job.description.slice(0, 160)} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={getJobImage(job)} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={job.title} />
        <meta name="twitter:description" content={job.short_description || job.description.slice(0, 160)} />
        <meta name="twitter:image" content={getJobImage(job)} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": job.title,
            "description": job.description,
            "datePosted": job.created_at,
            "hiringOrganization": {
              "@type": "Organization",
              "name": job.company || "شركة غير محددة"
            },
            "jobLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": job.country
              }
            },
            "employmentType": job.job_type || "FULL_TIME",
            ...(job.salary && { "baseSalary": { "@type": "MonetaryAmount", "currency": "KWD", "value": job.salary } })
          })}
        </script>
      </Helmet>

      <PageHeader
        title={job.title}
        backgroundImage={getJobImage(job)}
        className="mb-[-60px] pb-32" // Negative margin to allow card overlap
      >
        <div className="flex flex-wrap items-center justify-center gap-4 text-blue-50 mt-4">
          {job.company && <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"><Building2 className="w-5 h-5" />{job.company}</span>}
          <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"><MapPin className="w-5 h-5" />{job.country}</span>
          <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"><Calendar className="w-5 h-5" />{formatDate(job.created_at)}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {job.job_type && <span className="px-4 py-1.5 rounded-full bg-blue-500/20 text-white border border-blue-400/30 text-sm font-medium">{job.job_type}</span>}
          {job.exclusive_tag && job.exclusive_tag !== 'none' && (
            <span className="px-4 py-1.5 rounded-full bg-yellow-500/20 text-yellow-200 border border-yellow-400/30 text-sm font-medium">{exclusiveTagLabels[job.exclusive_tag]}</span>
          )}
        </div>
      </PageHeader>

      <div className="container-custom relative z-20 pb-12">
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          <div className="flex-1 max-w-4xl mx-auto lg:mx-0">
            {/* Breadcrumb relocated */}
            <nav className="flex items-center gap-2 text-sm text-foreground/80 mb-6 bg-card/50 backdrop-blur-sm p-3 rounded-lg inline-flex shadow-sm">
              <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
              <ArrowRight className="w-4 h-4" />
              <Link to="/all-jobs" className="hover:text-primary transition-colors">الوظائف</Link>
              <ArrowRight className="w-4 h-4" />
              <span className="text-foreground max-w-[200px] truncate">{job.title}</span>
            </nav>

            <article className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden">
              {/* AdSense Top Inside Card */}
              <div className="px-4 py-6 border-b border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold mb-1 text-primary">{job.title}</h1>
                    <h3 className="text-xl mb-1 text-foreground">تفاصيل الوظيفة</h3>
                    <p className="text-foreground text-sm">اقرأ الوصف والمتطلبات بعناية قبل التقديم</p>
                  </div>
                  {job.salary && (
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-xl flex items-center gap-2 font-bold border border-green-200 dark:border-green-800">
                      <Banknote className="w-5 h-5" />
                      {job.salary}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">وصف الوظيفة</h2>
                  <div
                    className="text-foreground leading-relaxed prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </section>

                {/* AdSense 2 - Mid Content */}
                <div className="my-8 md:my-10 overflow-hidden">
                  <AdSense size="rectangle" placement="job_details_middle" />
                </div>

                {job.requirements && job.requirements.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">المتطلبات</h2>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-foreground">
                          <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </article>

            {/* Apply Button - Moved below article */}
            {job.apply_link && (
              <div className="mt-6 p-6 bg-card rounded-xl shadow-sm border border-border">
                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
                  onClick={() => trackEvent.mutate({ jobId: job.id, eventType: 'click' })}
                >
                  <ExternalLink className="w-5 h-5" />قدم الآن
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AdSense 3 - Before Footer */}
      <div className="py-4 md:py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <AdSense size="leaderboard" placement="job_details_bottom" />
      </div>
    </Layout>
  );
};

export default JobDetails;
