import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, ArrowRight, Share2, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import AdSense from '@/components/common/AdSense';
import { useBlogPost, usePublishedBlogPosts } from '@/hooks/useBlogPosts';
import PageHeader from '@/components/layout/PageHeader';

const BlogPost = () => {
  const { postId } = useParams<{ postId: string }>();
  const { data: post, isLoading } = useBlogPost(postId || '');
  const { data: allPosts = [] } = usePublishedBlogPosts();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return <Navigate to="/404" replace />;
  }

  const relatedPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 2);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post.title, text: post.excerpt || '', url: window.location.href });
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>{post.title} | مدونة وظفني حالاً</title>
        <meta name="description" content={post.excerpt || ''} />
      </Helmet>

      {/* AdSense 1 - Top Leaderboard */}
      <div className="py-4 md:py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <AdSense size="leaderboard" placement="blog_post_top" />
      </div>

      <PageHeader
        title={post.title}
        backgroundImage={post.image_url || undefined}
        className="mb-8"
      >
        <div className="flex flex-wrap items-center justify-center gap-6 text-blue-50 mt-4 text-sm md:text-base">
          <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"><User className="w-4 h-4" />{post.author || 'فريق التحرير'}</span>
          <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"><Calendar className="w-4 h-4" />{formatDate(post.created_at)}</span>
        </div>
      </PageHeader>

      <div className="container-custom py-8">
        <nav className="flex items-center gap-2 text-sm text-foreground mb-6 justify-center">
          <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ArrowRight className="w-4 h-4" />
          <Link to="/blog" className="hover:text-primary transition-colors">المدونة</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-foreground line-clamp-1">{post.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          <div className="flex-1 max-w-4xl mx-auto lg:mx-0">
            <article className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden">
              {post.image_url && (
                <div className="aspect-video bg-muted relative">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                </div>
              )}

              <div className="p-6 md:p-10">
                <h2 className="section-title">{post.title}</h2>
                <div
                  className="prose prose-lg max-w-none text-foreground leading-relaxed dark:prose-invert 
                  prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground
                  prose-img:rounded-xl prose-img:w-full prose-img:object-cover"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* AdSense 2 - Mid Article */}
                <div className="my-8 md:my-10 overflow-hidden">
                  <AdSense size="rectangle" placement="blog_post_middle" />
                </div>

              </div>
            </article>

            {relatedPosts.length > 0 && (
              <section className="mt-12">
                <h2 className="section-title">مقالات ذات صلة</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`} className="job-card block group">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">{relatedPost.title}</h3>
                      {relatedPost.excerpt && <p className="text-sm text-foreground line-clamp-2">{relatedPost.excerpt}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* AdSense 3 - Before Footer */}
            <div className="py-4 md:py-6 px-4 sm:px-6 lg:px-8 overflow-hidden mt-8">
              <AdSense size="leaderboard" placement="blog_post_bottom" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPost;
