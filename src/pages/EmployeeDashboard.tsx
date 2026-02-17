import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Briefcase, FileText, Plus, Edit, Search, Loader2, Home, Menu } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { exclusiveTagLabels, Job, BlogPost } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { getDirection } from "@/lib/utils";

type TabType = "jobs" | "blog";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("jobs");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [blogStatusFilter, setBlogStatusFilter] = useState<"all" | "published" | "draft">("all");

  const { toast } = useToast();
  const { data: jobs = [], isLoading: isLoadingJobs } = useJobs();
  const { data: blogPosts = [], isLoading: isLoadingBlogs } = useBlogPosts();

  const tabs = [
    { id: "jobs" as TabType, label: "الوظائف", icon: Briefcase },
    { id: "blog" as TabType, label: "المدونة", icon: FileText },
  ];

  const filteredJobs = jobs.filter(
    (job) => {
      const matchesSearch = job.title.includes(searchTerm) ||
        (job.company && job.company.includes(searchTerm)) ||
        job.country.includes(searchTerm);

      if (statusFilter === "all") return matchesSearch;
      if (statusFilter === "published") return matchesSearch && job.is_published !== false;
      if (statusFilter === "draft") return matchesSearch && job.is_published === false;
      return matchesSearch;
    }
  );

  const filteredBlogPosts = blogPosts.filter(
    (post) => {
      const matchesSearch = post.title.includes(searchTerm) || post.slug.includes(searchTerm);

      if (blogStatusFilter === "all") return matchesSearch;
      if (blogStatusFilter === "published") return matchesSearch && post.is_published !== false;
      if (blogStatusFilter === "draft") return matchesSearch && post.is_published === false;
      return matchesSearch;
    }
  );

  const openJobEditor = (job?: Job) => {
    if (job) {
      navigate(`/editor/job/${job.id}`);
    } else {
      navigate("/editor/job");
    }
  };

  const openBlogEditor = (blog?: BlogPost) => {
    if (blog) {
      navigate(`/editor/blog/${blog.id}`);
    } else {
      navigate("/editor/blog");
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className={mobile ? "py-4" : "p-6"}>
        {!mobile && (
          <div className="flex items-center gap-2 mb-8">
            <a href="/">
              <span className="text-lg font-bold text-foreground">لوحة الموظف</span>
            </a>
          </div>
        )}

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (mobile) setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right ${activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-foreground"
                }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className={mobile ? "mt-auto py-6 border-t border-border" : "absolute bottom-0 right-0 left-0 p-6 border-t border-border"}>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 text-foreground hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
          العودة للموقع
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Helmet>
        <title>لوحة الموظف | وظفني حالاً</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="p-2 -mr-2 hover:bg-accent rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[300px] p-0">
              <div className="h-full flex flex-col p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-lg font-bold">لوحة الموظف</span>
                </div>
                <SidebarContent mobile={true} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-bold text-lg">لوحة الموظف</span>
        </div>
        <a href="/" className="text-sm font-medium text-primary">
          الموقع
        </a>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-card border-l border-border min-h-screen sticky top-0">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {/* Jobs Tab */}
          {activeTab === "jobs" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">إدارة الوظائف</h1>
                <button onClick={() => openJobEditor()} className="btn-primary inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  إضافة وظيفة
                </button>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      placeholder="البحث في الوظائف..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="input-field w-auto min-w-[150px]"
                    >
                      <option value="all">الكل</option>
                      <option value="published">منشور</option>
                      <option value="draft">مسودة</option>
                    </select>
                  </div>
                </div>

                {isLoadingJobs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-right py-3 px-4 font-medium text-foreground">العنوان</th>
                          <th className="text-right py-3 px-4 font-medium text-foreground">الشركة</th>
                          <th className="text-right py-3 px-4 font-medium text-foreground">الدولة</th>
                          <th className="text-right py-3 px-4 font-medium text-foreground">الوسم</th>
                          <th className="text-right py-3 px-4 font-medium text-foreground">التاريخ</th>
                          <th className="text-right py-3 px-4 font-medium text-foreground">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobs.map((job) => (
                          <tr key={job.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <span className="font-medium text-foreground" dir={getDirection(job.title)}>{job.title}</span>
                              {job.is_featured && (
                                <span className="mr-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                                  مميز
                                </span>
                              )}
                              {!job.is_published && (
                                <span className="mr-2 px-2 py-0.5 rounded-full bg-muted text-foreground text-xs">
                                  مسودة
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-foreground">{job.company}</td>
                            <td className="py-3 px-4 text-foreground">{job.country}</td>
                            <td className="py-3 px-4">
                              {job.exclusive_tag && job.exclusive_tag !== "none" && (
                                <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">
                                  {exclusiveTagLabels[job.exclusive_tag]}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-foreground">{formatDate(job.created_at)}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openJobEditor(job)}
                                  className="p-2 rounded-lg hover:bg-accent transition-colors text-foreground hover:text-foreground"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Blog Tab */}
          {activeTab === "blog" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">إدارة المدونة</h1>
                <button onClick={() => openBlogEditor()} className="btn-primary inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  مقال جديد
                </button>
                <div className="flex items-center gap-2">
                  <select
                    value={blogStatusFilter}
                    onChange={(e) => setBlogStatusFilter(e.target.value as any)}
                    className="input-field w-auto min-w-[150px]"
                  >
                    <option value="all">الكل</option>
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                  </select>
                </div>
              </div>

              {isLoadingBlogs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredBlogPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-card rounded-xl p-5 border border-border flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-foreground mb-1" dir={getDirection(post.title)}>{post.title}</h3>
                        <p className="text-sm text-foreground">
                          {post.author} • {formatDate(post.created_at)}
                          {!post.is_published && (
                            <span className="mr-2 px-2 py-0.5 rounded-full bg-muted text-foreground text-xs">
                              مسودة
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openBlogEditor(post)}
                          className="p-2 rounded-lg hover:bg-accent transition-colors text-foreground hover:text-foreground"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
