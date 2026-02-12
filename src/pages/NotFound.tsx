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
      <div className="container-custom py-20">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-8xl font-bold text-primary mb-4">404</div>
          <h1 className="text-2xl font-bold text-foreground mb-4">الصفحة غير موجودة</h1>
          <p className="text-foreground mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى عنوان آخر.
          </p>

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
      </div>
      </Layout>
  );
};

export default NotFound;
