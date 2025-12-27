import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search } from "lucide-react";
import Layout from "@/components/layout/Layout";
import AdSense from "@/components/common/AdSense";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      {/* AdSense 1 - Top Leaderboard */}
      <div className="py-4 bg-muted">
        <AdSense size="leaderboard" placement="home_top" />
      </div>

      {/* AdSense 2 - Banner */}
      <div className="py-4">
        <AdSense size="banner" placement="home_banner_1" />
      </div>

      <div className="container-custom py-20">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {/* AdSense 3 - Before Content */}
            <AdSense size="inline" className="mb-8" placement="home_mid_content_1" />

            <div className="max-w-lg mx-auto text-center">
              <div className="text-8xl font-bold text-primary mb-4">404</div>
              <h1 className="text-2xl font-bold text-foreground mb-4">الصفحة غير موجودة</h1>
              <p className="text-muted-foreground mb-8">
                عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى عنوان آخر.
              </p>

              {/* AdSense 4 - Mid Content */}
              <AdSense size="rectangle" className="mb-8 mx-auto" placement="home_large_rect" />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/" className="btn-primary inline-flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  العودة للرئيسية
                </Link>
                <Link to="/jobs/kuwait" className="btn-secondary inline-flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  تصفح الوظائف
                </Link>
              </div>
            </div>

            {/* AdSense 5 - After Buttons */}
            <AdSense size="leaderboard" className="mt-12" placement="home_after_latest" />

            {/* AdSense 6 - Large Rectangle */}
            <AdSense size="large-rectangle" className="mt-8 mx-auto" placement="home_large_rect" />

            {/* AdSense 7 - Inline */}
            <AdSense size="inline" className="mt-8" placement="home_bottom_inline" />
          </div>

          {/* Sidebar */}
          <div className="lg:w-[320px] space-y-6">
            {/* AdSense 8 - Sidebar Top */}
            <AdSense size="rectangle" placement="sidebar_top" />
            {/* AdSense 9 - Sidebar Middle */}
            <AdSense size="rectangle" placement="sidebar_middle" />
            {/* AdSense 10 - Sidebar Bottom */}
            <AdSense size="large-rectangle" placement="sidebar_bottom" />
          </div>
        </div>
      </div>

      {/* AdSense 11 - Before Footer */}
      <div className="py-4">
        <AdSense size="leaderboard" placement="footer_top" />
      </div>

      {/* AdSense 12 - Extra Banner */}
      <div className="py-4">
        <AdSense size="banner" placement="footer_top" />
      </div>
    </Layout>
  );
};

export default NotFound;
