import { useParams, Navigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Building2, Banknote, Calendar, ExternalLink, Share2, ArrowRight, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import JobCard from '@/components/jobs/JobCard';
import AdSense from '@/components/common/AdSense';
import { useJob, useJobs } from '@/hooks/useJobs';
import { useTrackJobEvent } from '@/hooks/useJobAnalytics';
import { exclusiveTagLabels, Job } from '@/types/database';

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
  const { data: allJobs = [] } = useJobs();
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
        <meta name="keywords" content={`${job.title}، وظائف ${job.country}، ${job.company || ''}، فرص عمل`} />
        <link rel="canonical" href={`https://wazfni-now.com/job/${job.id}`} />
        <meta property="og:title" content={`${job.title} - ${job.company || 'وظيفة جديدة'}`} />
        <meta property="og:description" content={job.short_description || job.description.slice(0, 160)} />
        <meta property="og:type" content="website" />
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

      {/* AdSense 1 - Top Leaderboard */}
      <div className="py-4 bg-muted">
        <AdSense size="leaderboard" placement="job_details_top" />
      </div>

      {/* AdSense 2 - Banner */}
      <div className="py-4">
        <AdSense size="banner" placement="job_details_banner_1" />
      </div>

      <div className="container-custom py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-foreground">{job.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {/* AdSense 3 - Before Article */}
            <AdSense size="inline" className="mb-6" placement="job_details_banner_1" />

            <article className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              {/* Job Header Image */}
              <div className="w-full h-64 overflow-hidden">
                <img
                  src={getJobImage(job)}
                  alt={job.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 border-b border-border">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="country-badge">{job.country}</span>
                  {job.job_type && <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">{job.job_type}</span>}
                  {job.exclusive_tag && job.exclusive_tag !== 'none' && (
                    <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium">{exclusiveTagLabels[job.exclusive_tag]}</span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  {job.company && <span className="flex items-center gap-2"><Building2 className="w-5 h-5" />{job.company}</span>}
                  <span className="flex items-center gap-2"><MapPin className="w-5 h-5" />{job.country}</span>
                  <span className="flex items-center gap-2"><Calendar className="w-5 h-5" />{formatDate(job.created_at)}</span>
                </div>
                {job.salary && <p className="flex items-center gap-2 text-primary font-bold text-xl mt-4"><Banknote className="w-5 h-5" />{job.salary}</p>}
              </div>

              {/* AdSense 4 - In Article */}
              <AdSense size="inline" className="m-6" placement="job_details_banner_1" />

              <div className="p-6 space-y-6">
                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">وصف الوظيفة</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
                </section>

                {/* AdSense 5 - Mid Content */}
                <AdSense size="rectangle" className="mx-auto" placement="home_mid_content_1" />

                {job.requirements && job.requirements.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">المتطلبات</h2>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section>
                  <div className="flex flex-wrap gap-3">
                    {job.apply_link && (
                      <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center gap-2"
                        onClick={() => trackEvent.mutate({ jobId: job.id, eventType: 'click' })}
                      >
                        <ExternalLink className="w-5 h-5" />قدم الآن
                      </a>
                    )}

                  </div>
                </section>
              </div>
            </article>

            {/* AdSense 6 - After Article */}
            <AdSense size="leaderboard" className="mt-8" placement="home_after_featured" />

            {/* AdSense 7 - Large Rectangle */}
            <AdSense size="large-rectangle" className="mt-8 mx-auto" placement="home_large_rect" />

            {relatedJobs.length > 0 && (
              <section className="mt-12">
                <h2 className="section-title">وظائف مشابهة</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-4">
                  {relatedJobs.map((relatedJob) => (
                    <JobCard key={relatedJob.id} job={relatedJob} />
                  ))}
                </div>
              </section>
            )}

            {/* AdSense 8 - After Related */}
            <AdSense size="inline" className="mt-8" placement="home_bottom_inline" />
          </div>

          <div className="hidden lg:block lg:w-[320px] space-y-6">
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">التقديم السريع</h3>
              {job.apply_link && (
                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  onClick={() => trackEvent.mutate({ jobId: job.id, eventType: 'click' })}
                >
                  <ExternalLink className="w-5 h-5" />قدم الآن
                </a>
              )}
            </div>
            {/* AdSense 9 - Sidebar Top */}
            <AdSense size="rectangle" placement="sidebar_top" />
            {/* AdSense 10 - Sidebar Middle */}
            <AdSense size="rectangle" placement="sidebar_middle" />
            {/* AdSense 11 - Sidebar Bottom */}
            <AdSense size="large-rectangle" placement="sidebar_bottom" />
          </div>
        </div>
      </div>

      {/* AdSense 12 - Before Footer */}
      <div className="py-4">
        <AdSense size="leaderboard" placement="footer_top" />
      </div>
    </Layout>
  );
};

export default JobDetails;
