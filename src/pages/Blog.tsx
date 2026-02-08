import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import AdSense from '@/components/common/AdSense';
import { usePublishedBlogPosts } from '@/hooks/useBlogPosts';

const Blog = () => {
  const { data: blogPosts = [], isLoading } = usePublishedBlogPosts();

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString));
  };

  return (
    <Layout>
      <Helmet>
        <title>المدونة - نصائح ومقالات عن سوق العمل | وظفني حالاً</title>
        <meta name="description" content="اقرأ أحدث المقالات والنصائح حول البحث عن وظيفة في الخليج العربي. نصائح للمقابلات، كتابة السيرة الذاتية، والمزيد." />
        <meta name="keywords" content="مقالات وظائف، نصائح توظيف، سيرة ذاتية، مقابلة عمل، سوق العمل الخليج" />
        <link rel="canonical" href="https://www.wazafnihalan.com/blog" />
        <meta property="og:title" content="المدونة - نصائح ومقالات عن سوق العمل" />
        <meta property="og:description" content="اقرأ أحدث المقالات والنصائح حول البحث عن وظيفة في الخليج العربي." />
        <meta property="og:type" content="website" />
      </Helmet>

      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">المدونة</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">نصائح ومقالات مفيدة للباحثين عن عمل</p>
        </div>
      </section>

      {/* AdSense 1 - After Hero */}
      <div className="py-4 overflow-hidden">
        <AdSense size="leaderboard" placement="blog_top" />
      </div>

      <div className="container-custom py-12">

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <div key={post.id}>
                <Link to={`/blog/${post.slug}`} className="job-card group h-full flex flex-col">
                  <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden relative">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ${post.image_url ? 'hidden' : ''}`}>
                      <span className="text-4xl">📝</span>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">{post.title}</h2>
                  {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border mt-auto">
                    <span className="flex items-center gap-1"><User className="w-4 h-4" />{post.author}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(post.created_at)}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* AdSense 2 - In Middle of Content */}
        <div className="my-8 md:my-10 overflow-hidden">
          <AdSense size="rectangle" placement="blog_middle" />
        </div>
      </div>

      {/* AdSense 3 - Before Footer */}
      <div className="py-4 md:py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <AdSense size="leaderboard" placement="blog_bottom" />
      </div>
    </Layout>
  );
};

export default Blog;
