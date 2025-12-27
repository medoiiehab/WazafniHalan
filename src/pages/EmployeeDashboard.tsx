import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Briefcase, FileText, Plus, Edit, Trash2, Search, Loader2, Home, Globe, Menu } from "lucide-react";
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from "@/hooks/useJobs";
import { useBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost } from "@/hooks/useBlogPosts";
import { countries, exclusiveTagLabels, JobExclusiveTag, Job, BlogPost } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import RichTextEditor from "@/components/editor/RichTextEditor";

type TabType = "jobs" | "blog";

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("jobs");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();
  const { data: jobs = [], isLoading: isLoadingJobs } = useJobs();
  const { data: blogPosts = [], isLoading: isLoadingBlogs } = useBlogPosts();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  const createBlogPost = useCreateBlogPost();
  const updateBlogPost = useUpdateBlogPost();
  const deleteBlogPost = useDeleteBlogPost();

  // Job form state
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    short_description: "",
    company: "",
    country: "الكويت",
    country_slug: "kuwait",
    salary: "",
    job_type: "دوام كامل",
    requirements: "",
    tags: "",
    exclusive_tag: "none" as JobExclusiveTag,
    apply_link: "",
    is_featured: false,
    image_url: "",
  });

  // Blog form state
  const [blogForm, setBlogForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    author: "فريق وظفني حالاً",
    tags: "",
    is_published: true,
    meta_title: "",
    meta_description: "",
  });

  const tabs = [
    { id: "jobs" as TabType, label: "الوظائف", icon: Briefcase },
    { id: "blog" as TabType, label: "المدونة", icon: FileText },
  ];

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.includes(searchTerm) ||
      (job.company && job.company.includes(searchTerm)) ||
      job.country.includes(searchTerm),
  );

  const openJobModal = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setJobForm({
        title: job.title,
        description: job.description,
        short_description: job.short_description || "",
        company: job.company || "",
        country: job.country,
        country_slug: job.country_slug,
        salary: job.salary || "",
        job_type: job.job_type || "دوام كامل",
        requirements: job.requirements?.join("\n") || "",
        tags: job.tags?.join(", ") || "",
        exclusive_tag: job.exclusive_tag || "none",
        apply_link: job.apply_link || "",
        is_featured: job.is_featured || false,
        image_url: job.image_url || "",
      });
    } else {
      setEditingJob(null);
      setJobForm({
        title: "",
        description: "",
        short_description: "",
        company: "",
        country: "الكويت",
        country_slug: "kuwait",
        salary: "",
        job_type: "دوام كامل",
        requirements: "",
        tags: "",
        exclusive_tag: "none",
        apply_link: "",
        is_featured: false,
        image_url: "",
      });
    }
    setIsJobModalOpen(true);
  };

  const openBlogModal = (blog?: BlogPost) => {
    if (blog) {
      setEditingBlog(blog);
      setBlogForm({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt || "",
        content: blog.content,
        image_url: blog.image_url || "",
        author: blog.author || "فريق وظفني حالاً",
        tags: blog.tags?.join(", ") || "",
        is_published: blog.is_published ?? true,
        meta_title: blog.meta_title || "",
        meta_description: blog.meta_description || "",
      });
    } else {
      setEditingBlog(null);
      setBlogForm({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        image_url: "",
        author: "فريق وظفني حالاً",
        tags: "",
        is_published: true,
        meta_title: "",
        meta_description: "",
      });
    }
    setIsBlogModalOpen(true);
  };

  const handleSaveJob = async () => {
    try {
      const jobData = {
        title: jobForm.title,
        description: jobForm.description,
        short_description: jobForm.short_description || null,
        company: jobForm.company || null,
        country: jobForm.country,
        country_slug: jobForm.country_slug,
        salary: jobForm.salary || null,
        job_type: jobForm.job_type || null,
        requirements: jobForm.requirements ? jobForm.requirements.split("\n").filter((r) => r.trim()) : null,
        tags: jobForm.tags
          ? jobForm.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
          : null,
        exclusive_tag: jobForm.exclusive_tag,
        apply_link: jobForm.apply_link || null,
        is_featured: jobForm.is_featured,
        image_url: jobForm.image_url || null,
      };

      if (editingJob) {
        await updateJob.mutateAsync({ id: editingJob.id, ...jobData });
        toast({ title: "تم تحديث الوظيفة بنجاح" });
      } else {
        await createJob.mutateAsync(jobData);
        toast({ title: "تم إضافة الوظيفة بنجاح" });
      }
      setIsJobModalOpen(false);
    } catch (error) {
      toast({ title: "حدث خطأ", description: "يرجى المحاولة مرة أخرى", variant: "destructive" });
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الوظيفة؟")) {
      try {
        await deleteJob.mutateAsync(id);
        toast({ title: "تم حذف الوظيفة بنجاح" });
      } catch (error) {
        toast({ title: "حدث خطأ", variant: "destructive" });
      }
    }
  };

  const handleSaveBlog = async () => {
    try {
      const blogData = {
        title: blogForm.title,
        slug: blogForm.slug || blogForm.title.toLowerCase().replace(/\s+/g, "-"),
        excerpt: blogForm.excerpt || null,
        content: blogForm.content,
        image_url: blogForm.image_url || null,
        author: blogForm.author || null,
        tags: blogForm.tags
          ? blogForm.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
          : null,
        is_published: blogForm.is_published,
        meta_title: blogForm.meta_title || null,
        meta_description: blogForm.meta_description || null,
      };

      if (editingBlog) {
        await updateBlogPost.mutateAsync({ id: editingBlog.id, ...blogData });
        toast({ title: "تم تحديث المقال بنجاح" });
      } else {
        await createBlogPost.mutateAsync(blogData);
        toast({ title: "تم إضافة المقال بنجاح" });
      }
      setIsBlogModalOpen(false);
    } catch (error) {
      toast({ title: "حدث خطأ", description: "يرجى المحاولة مرة أخرى", variant: "destructive" });
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المقال؟")) {
      try {
        await deleteBlogPost.mutateAsync(id);
        toast({ title: "تم حذف المقال بنجاح" });
      } catch (error) {
        toast({ title: "حدث خطأ", variant: "destructive" });
      }
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = countries.find((c) => c.name === e.target.value);
    if (selectedCountry) {
      setJobForm({
        ...jobForm,
        country: selectedCountry.name,
        country_slug: selectedCountry.slug,
      });
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
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
          className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
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
                <button onClick={() => openJobModal()} className="btn-primary inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  إضافة وظيفة
                </button>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث في الوظائف..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">العنوان</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">الشركة</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">الدولة</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">الوسم</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">التاريخ</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobs.map((job) => (
                          <tr key={job.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <span className="font-medium text-foreground">{job.title}</span>
                              {job.is_featured && (
                                <span className="mr-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                                  مميز
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{job.company}</td>
                            <td className="py-3 px-4 text-muted-foreground">{job.country}</td>
                            <td className="py-3 px-4">
                              {job.exclusive_tag && job.exclusive_tag !== "none" && (
                                <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">
                                  {exclusiveTagLabels[job.exclusive_tag]}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{formatDate(job.created_at)}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openJobModal(job)}
                                  className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
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
                <button onClick={() => openBlogModal()} className="btn-primary inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  مقال جديد
                </button>
              </div>

              {isLoadingBlogs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {blogPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-card rounded-xl p-5 border border-border flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-foreground mb-1">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {post.author} • {formatDate(post.created_at)}
                          {!post.is_published && (
                            <span className="mr-2 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                              مسودة
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openBlogModal(post)}
                          className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(post.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Job Modal */}
      <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingJob ? "تعديل الوظيفة" : "إضافة وظيفة جديدة"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">عنوان الوظيفة *</label>
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="input-field"
                  placeholder="مثال: مطور واجهات أمامية"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">الشركة</label>
                <input
                  type="text"
                  value={jobForm.company}
                  onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                  className="input-field"
                  placeholder="اسم الشركة"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">الدولة *</label>
                <select value={jobForm.country} onChange={handleCountryChange} className="input-field">
                  {countries.map((country) => (
                    <option key={country.slug} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">نوع العمل</label>
                <select
                  value={jobForm.job_type}
                  onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                  className="input-field"
                >
                  <option value="دوام كامل">دوام كامل</option>
                  <option value="دوام جزئي">دوام جزئي</option>
                  <option value="عن بعد">عن بعد</option>
                  <option value="عقد">عقد</option>
                  <option value="تدريب">تدريب</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">الراتب</label>
                <input
                  type="text"
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  className="input-field"
                  placeholder="مثال: 3000 - 5000 دولار"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">الوسم المميز</label>
                <select
                  value={jobForm.exclusive_tag}
                  onChange={(e) => setJobForm({ ...jobForm, exclusive_tag: e.target.value as JobExclusiveTag })}
                  className="input-field"
                >
                  <option value="none">بدون وسم</option>
                  <option value="new">جديد</option>
                  <option value="exclusive">حصري</option>
                  <option value="high_salary">راتب مرتفع</option>
                  <option value="urgent">عاجل</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">وصف مختصر</label>
              <input
                type="text"
                value={jobForm.short_description}
                onChange={(e) => setJobForm({ ...jobForm, short_description: e.target.value })}
                className="input-field"
                placeholder="وصف قصير للوظيفة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">الوصف الكامل *</label>
              <textarea
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                className="input-field min-h-[120px]"
                placeholder="وصف تفصيلي للوظيفة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">المتطلبات (سطر لكل متطلب)</label>
              <textarea
                value={jobForm.requirements}
                onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder="خبرة 3 سنوات&#10;إجادة اللغة الإنجليزية&#10;شهادة جامعية"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  الكلمات المفتاحية (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  value={jobForm.tags}
                  onChange={(e) => setJobForm({ ...jobForm, tags: e.target.value })}
                  className="input-field"
                  placeholder="برمجة, تطوير, React"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">رابط التقديم</label>
                <input
                  type="url"
                  value={jobForm.apply_link}
                  onChange={(e) => setJobForm({ ...jobForm, apply_link: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">رابط الصورة</label>
              <input
                type="url"
                value={jobForm.image_url}
                onChange={(e) => setJobForm({ ...jobForm, image_url: e.target.value })}
                className="input-field"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={jobForm.is_featured}
                onChange={(e) => setJobForm({ ...jobForm, is_featured: e.target.checked })}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-foreground">
                وظيفة مميزة
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsJobModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveJob}
              disabled={!jobForm.title || !jobForm.description}
              className="btn-primary disabled:opacity-50"
            >
              {editingJob ? "تحديث" : "إضافة"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blog Modal */}
      <Dialog open={isBlogModalOpen} onOpenChange={setIsBlogModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingBlog ? "تعديل المقال" : "إضافة مقال جديد"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">عنوان المقال *</label>
                <input
                  type="text"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className="input-field"
                  placeholder="عنوان المقال"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">الرابط المختصر (Slug)</label>
                <input
                  type="text"
                  value={blogForm.slug}
                  onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                  className="input-field"
                  placeholder="يُنشأ تلقائياً من العنوان"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">الكاتب</label>
                <input
                  type="text"
                  value={blogForm.author}
                  onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                  className="input-field"
                  placeholder="اسم الكاتب"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  الكلمات المفتاحية (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  value={blogForm.tags}
                  onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                  className="input-field"
                  placeholder="نصائح, سيرة ذاتية, مقابلات"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">المقتطف</label>
              <textarea
                value={blogForm.excerpt}
                onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                className="input-field min-h-[80px]"
                placeholder="ملخص قصير للمقال"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">المحتوى *</label>
              <RichTextEditor
                value={blogForm.content}
                onChange={(value) => setBlogForm({ ...blogForm, content: value })}
                placeholder="اكتب محتوى المقال هنا..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">رابط الصورة</label>
              <input
                type="url"
                value={blogForm.image_url}
                onChange={(e) => setBlogForm({ ...blogForm, image_url: e.target.value })}
                className="input-field"
                placeholder="https://..."
              />
            </div>

            {/* SEO Section */}
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">إعدادات SEO</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">عنوان الصفحة (Meta Title)</label>
                  <input
                    type="text"
                    value={blogForm.meta_title}
                    onChange={(e) => setBlogForm({ ...blogForm, meta_title: e.target.value })}
                    className="input-field"
                    placeholder="عنوان يظهر في نتائج البحث (60 حرف كحد أقصى)"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{blogForm.meta_title.length}/60 حرف</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">وصف الصفحة (Meta Description)</label>
                  <textarea
                    value={blogForm.meta_description}
                    onChange={(e) => setBlogForm({ ...blogForm, meta_description: e.target.value })}
                    className="input-field h-20"
                    placeholder="وصف يظهر في نتائج البحث (160 حرف كحد أقصى)"
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{blogForm.meta_description.length}/160 حرف</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published_emp"
                checked={blogForm.is_published}
                onChange={(e) => setBlogForm({ ...blogForm, is_published: e.target.checked })}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="is_published_emp" className="text-sm font-medium text-foreground">
                نشر المقال
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsBlogModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveBlog}
              disabled={!blogForm.title || !blogForm.content}
              className="btn-primary disabled:opacity-50"
            >
              {editingBlog ? "تحديث" : "إضافة"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDashboard;
