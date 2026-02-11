import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Briefcase,
  FileText,
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  LayoutDashboard,
  Image,
  X,
  Loader2,
  User,
  LogOut,
  Users,
  UserPlus,
  UserMinus,
  Megaphone,
  Menu,
} from "lucide-react";
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from "@/hooks/useJobs";
import { useBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost } from "@/hooks/useBlogPosts";
import { useAnalyticsSummary, useJobsAnalytics, useDailyAnalytics, useCountryAnalytics } from "@/hooks/useJobAnalytics";
import { countries, exclusiveTagLabels, JobExclusiveTag, Job, BlogPost } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  useAdSenseSettings,
  useUpdateAdSenseSettings,
  useAdUnits,
  useCreateAdUnit,
  useUpdateAdUnit,
  useDeleteAdUnit,
  AdUnit
} from "@/hooks/useAdSenseSettings";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

type TabType = "dashboard" | "jobs" | "blog" | "users" | "adsense" | "settings";

interface SearchedUser {
  user_id: string;
  email: string;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}


const Admin = () => {
  const getTextDirection = (text: string) => {
    if (!text) return "rtl";
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text) ? "rtl" : "ltr";
  };

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [blogStatusFilter, setBlogStatusFilter] = useState<"all" | "published" | "draft">("all");
  // Modals state removed as we use navigation now
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  // User management state
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isAssigningRole, setIsAssigningRole] = useState<string | null>(null);

  // Editor info state
  const [editorInfo, setEditorInfo] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { data: jobs = [], isLoading: isLoadingJobs } = useJobs();
  const { data: blogPosts = [], isLoading: isLoadingBlogs } = useBlogPosts();
  const { data: analyticsSummary, isLoading: isLoadingAnalytics } = useAnalyticsSummary();
  const { data: jobsAnalytics = [] } = useJobsAnalytics();
  const { data: dailyAnalytics = [] } = useDailyAnalytics(7);
  const { data: countryAnalytics = [] } = useCountryAnalytics();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  const createBlogPost = useCreateBlogPost();
  const updateBlogPost = useUpdateBlogPost();
  const deleteBlogPost = useDeleteBlogPost();

  // Account settings state
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // AdSense state
  const { data: adSenseSettings, isLoading: isLoadingSettings } = useAdSenseSettings();
  const updateAdSenseSettings = useUpdateAdSenseSettings();
  const { data: adUnits = [], isLoading: isLoadingAdUnits } = useAdUnits();
  const createAdUnit = useCreateAdUnit();
  const updateAdUnit = useUpdateAdUnit();
  const deleteAdUnit = useDeleteAdUnit();

  const [isAdUnitModalOpen, setIsAdUnitModalOpen] = useState(false);
  const [editingAdUnit, setEditingAdUnit] = useState<AdUnit | null>(null);
  const [adUnitForm, setAdUnitForm] = useState({
    name: "",
    slot_id: "",
    placement: "home_top",
    ad_format: "auto",
    is_enabled: true,
  });

  const [settingsForm, setSettingsForm] = useState({
    publisher_id: "",
    is_enabled: false,
    verification_script: "",
    hide_placeholders: false,
  });

  useEffect(() => {
    if (adSenseSettings) {
      setSettingsForm({
        publisher_id: adSenseSettings.publisher_id || "",
        is_enabled: adSenseSettings.is_enabled || false,
        verification_script: adSenseSettings.verification_script || "",
        hide_placeholders: adSenseSettings.hide_placeholders || false,
      });
    }
  }, [adSenseSettings]);

  // Fetch editor information for jobs
  useEffect(() => {
    const fetchEditorInfo = async () => {
      const editorIds = jobs
        .map(job => job.editor)
        .filter((id): id is string => id !== null && id !== undefined && id !== '');

      if (editorIds.length === 0) return;

      const newEditorInfo: Record<string, string> = { ...editorInfo };
      const missingIds = editorIds.filter(id => !newEditorInfo[id]);

      if (missingIds.length === 0) return;

      for (const editorId of missingIds) {
        try {
          const { data, error } = await supabase.rpc('get_user_email', { user_uuid: editorId });
          if (!error && data) {
            newEditorInfo[editorId] = data;
          }
        } catch (error) {
          console.error(`Failed to fetch editor info for ${editorId}:`, error);
        }
      }

      setEditorInfo(newEditorInfo);
    };

    fetchEditorInfo();
  }, [jobs]);


  const tabs = [
    { id: "dashboard" as TabType, label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "jobs" as TabType, label: "الوظائف", icon: Briefcase },
    { id: "blog" as TabType, label: "المدونة", icon: FileText },
    { id: "users" as TabType, label: "المستخدمين", icon: Users },
    { id: "adsense" as TabType, label: "إعلانات جوجل", icon: Megaphone },
    { id: "settings" as TabType, label: "الإعدادات", icon: Settings },
  ];

  const filteredBlogPosts = blogPosts.filter(
    (post) => {
      const matchesSearch = post.title.includes(searchTerm) || post.slug.includes(searchTerm);

      if (blogStatusFilter === "all") return matchesSearch;
      if (blogStatusFilter === "published") return matchesSearch && post.is_published !== false;
      if (blogStatusFilter === "draft") return matchesSearch && post.is_published === false;
      return matchesSearch;
    }
  );
  const filteredJobs = jobs.filter(
    (job) => {
      const matchesSearch = job.title.includes(searchTerm) ||
        (job.company && job.company.includes(searchTerm)) ||
        job.country.includes(searchTerm);

      if (statusFilter === "all") return matchesSearch;
      if (statusFilter === "published") return matchesSearch && job.is_published !== false; // Default to true if undefined
      if (statusFilter === "draft") return matchesSearch && job.is_published === false;
      return matchesSearch;
    }
  );

  const openJobModal = (job?: Job) => {
    if (job) {
      navigate(`/admin/editor/job/${job.id}`);
    } else {
      navigate("/admin/editor/job");
    }
  };

  const openBlogModal = (blog?: BlogPost) => {
    if (blog) {
      navigate(`/admin/editor/blog/${blog.id}`);
    } else {
      navigate("/admin/editor/blog");
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الوظيفة؟")) {
      try {
        await deleteJob.mutateAsync(id);
        toast({ title: "تم حذف الوظيفة بنجاح" });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "فشل الاتصال بالخادم";
        toast({
          title: "فشل الحذف",
          description: errorMessage || "يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
        console.error("Error deleting job:", error);
      }
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المقال؟")) {
      try {
        await deleteBlogPost.mutateAsync(id);
        toast({ title: "تم حذف المقال بنجاح" });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "فشل الاتصال بالخادم";
        toast({
          title: "فشل الحذف",
          description: errorMessage || "يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
        console.error("Error deleting blog:", error);
      }
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  const handleSaveSettings = async () => {
    try {
      await updateAdSenseSettings.mutateAsync(settingsForm);
      toast({ title: "تم تحديث إعدادات AdSense بنجاح" });
    } catch (error) {
      toast({ title: "حدث خطأ", description: "يرجى المحاولة مرة أخرى", variant: "destructive" });
    }
  };

  const openAdUnitModal = (adUnit?: AdUnit) => {
    if (adUnit) {
      setEditingAdUnit(adUnit);
      setAdUnitForm({
        name: adUnit.name,
        slot_id: adUnit.slot_id,
        placement: adUnit.placement,
        ad_format: adUnit.ad_format || "auto",
        is_enabled: adUnit.is_enabled ?? true,
      });
    } else {
      setEditingAdUnit(null);
      setAdUnitForm({
        name: "",
        slot_id: "",
        placement: "home_top",
        ad_format: "auto",
        is_enabled: true,
      });
    }
    setIsAdUnitModalOpen(true);
  };

  const handleSaveAdUnit = async () => {
    try {
      if (editingAdUnit) {
        await updateAdUnit.mutateAsync({ id: editingAdUnit.id, ...adUnitForm });
        toast({ title: "تم تحديث الوحدة الإعلانية بنجاح" });
      } else {
        await createAdUnit.mutateAsync(adUnitForm);
        toast({ title: "تم إضافة الوحدة الإعلانية بنجاح" });
      }
      setIsAdUnitModalOpen(false);
    } catch (error) {
      toast({ title: "حدث خطأ", description: "يرجى المحاولة مرة أخرى", variant: "destructive" });
    }
  };

  const handleDeleteAdUnit = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الوحدة الإعلانية؟")) {
      try {
        await deleteAdUnit.mutateAsync(id);
        toast({ title: "تم حذف الوحدة الإعلانية بنجاح" });
      } catch (error) {
        toast({ title: "حدث خطأ", variant: "destructive" });
      }
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      toast({ title: "يرجى إدخال البريد الإلكتروني الجديد", variant: "destructive" });
      return;
    }
    setIsUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast({ title: "تم إرسال رابط التأكيد", description: "يرجى التحقق من بريدك الإلكتروني الجديد" });
      setNewEmail("");
    } catch (error: any) {
      toast({ title: "حدث خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "كلمات المرور غير متطابقة", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "تم تحديث كلمة المرور بنجاح" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "حدث خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // User management functions
  // Custom effect to load users when tab changes
  useEffect(() => {
    if (activeTab === "users") {
      handleSearchUsers("");
    }
  }, [activeTab]);

  const handleSearchUsers = async (term?: string) => {
    const searchString = term !== undefined ? term : userSearchTerm;
    setIsSearchingUsers(true);
    try {
      const { data, error } = await supabase.rpc('search_users_by_email', { search_term: searchString });
      if (error) throw error;
      setSearchedUsers(data || []);

      // Fetch roles for found users
      if (data && data.length > 0) {
        const userIds = data.map((u: SearchedUser) => u.user_id);
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        const rolesMap: Record<string, string[]> = {};
        rolesData?.forEach((r: UserRole) => {
          if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
          rolesMap[r.user_id].push(r.role);
        });
        setUserRoles(rolesMap);
      }
    } catch (error: any) {
      toast({ title: "خطأ في البحث", description: error.message, variant: "destructive" });
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const handleAssignRole = async (userId: string, role: 'employee' | 'admin') => {
    setIsAssigningRole(userId);
    try {
      const { error } = await supabase.rpc('assign_role_to_user', { target_user_id: userId, target_role: role });
      if (error) throw error;
      toast({ title: `تم إضافة صلاحية ${role === 'employee' ? 'موظف' : 'مدير'} بنجاح` });
      setUserRoles(prev => ({ ...prev, [userId]: [...(prev[userId] || []), role] }));
    } catch (error: any) {
      toast({ title: "حدث خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsAssigningRole(null);
    }
  };

  const handleRemoveRole = async (userId: string, role: 'employee' | 'admin') => {
    setIsAssigningRole(userId);
    try {
      const { error } = await supabase.rpc('remove_role_from_user', { target_user_id: userId, target_role: role });
      if (error) throw error;
      toast({ title: `تم إزالة صلاحية ${role === 'employee' ? 'موظف' : 'مدير'} بنجاح` });
      setUserRoles(prev => ({ ...prev, [userId]: (prev[userId] || []).filter(r => r !== role) }));
    } catch (error: any) {
      toast({ title: "حدث خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsAssigningRole(null);
    }
  };
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className={mobile ? "py-4" : "p-6"}>
        {!mobile && (
          <div className="flex items-center gap-2 mb-8">
            <span className="text-lg font-bold text-foreground">
              <a href="/">رجوع للصفحة الرئيسية</a>
            </span>
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
        <a
          href="/"
          className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          العودة للموقع
        </a>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background dir-rtl">
      <Helmet>
        <title>لوحة التحكم | وظفني حالاً</title>
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
                  <span className="text-lg font-bold">لوحة التحكم</span>
                </div>
                <SidebarContent mobile={true} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-bold text-lg">لوحة التحكم</span>
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
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <AnalyticsDashboard
              jobs={jobs}
              blogPosts={blogPosts}
              analyticsSummary={analyticsSummary}
              isLoadingAnalytics={isLoadingAnalytics}
              isLoadingJobs={isLoadingJobs}
              dailyAnalytics={dailyAnalytics}
              countryAnalytics={countryAnalytics}
              jobsAnalytics={jobsAnalytics}
              formatDate={formatDate}
            />
          )}

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
                <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      placeholder="البحث في الوظائف..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">العنوان</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">الشركة</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">الدولة</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">الوسم</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">المحرر</th>
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
                              {!job.is_published && (
                                <span className="mr-2 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                                  مسودة
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
                            <td className="py-3 px-4 text-muted-foreground text-sm">
                              {job.editor ? (
                                <div className="flex flex-col gap-1">
                                  <span className="font-medium text-foreground">{editorInfo[job.editor] || "جاري التحميل..."}</span>
                                  <span className="text-xs opacity-75">{job.editor.slice(0, 8)}...</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">غير محدد</span>
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

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-6">إدارة المستخدمين</h1>

              <div className="bg-card rounded-xl border border-border p-6 mb-6">
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      placeholder="البحث بالبريد الإلكتروني..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                      className="input-field pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                  <button onClick={() => handleSearchUsers()} disabled={isSearchingUsers} className="btn-primary">
                    {isSearchingUsers ? <Loader2 className="w-4 h-4 animate-spin" /> : "بحث"}
                  </button>
                </div>

                {/* Show list even if searchedUsers is defined but empty only if we searched */}
                {(searchedUsers.length > 0 || isSearchingUsers) && (
                  <div className="space-y-3">
                    {searchedUsers.map((u) => (
                      <div key={u.user_id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{u.email}</p>
                          <p className="text-sm text-muted-foreground">
                            انضم: {new Date(u.created_at).toLocaleDateString("ar-SA")}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {userRoles[u.user_id]?.includes('admin') && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">مدير</span>
                            )}
                            {userRoles[u.user_id]?.includes('employee') && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground">موظف</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!userRoles[u.user_id]?.includes('employee') ? (
                            <button
                              onClick={() => handleAssignRole(u.user_id, 'employee')}
                              disabled={isAssigningRole === u.user_id}
                              className="btn-secondary text-sm flex items-center gap-1"
                            >
                              <UserPlus className="w-4 h-4" />
                              موظف
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRemoveRole(u.user_id, 'employee')}
                              disabled={isAssigningRole === u.user_id}
                              className="btn-secondary text-sm text-destructive flex items-center gap-1"
                            >
                              <UserMinus className="w-4 h-4" />
                              إزالة موظف
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}



                {searchedUsers.length === 0 && !isSearchingUsers && (
                  <p className="text-center text-muted-foreground py-4">
                    {userSearchTerm ? "لم يتم العثور على مستخدمين" : "لا يوجد مستخدمين لعرضهم"}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* AdSense Tab */}
          {activeTab === "adsense" && (
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-6">إدارة إعلانات جوجل (AdSense)</h1>

              {/* General Settings */}
              <div className="bg-card rounded-xl p-6 border border-border mb-8">
                <h2 className="text-lg font-bold text-foreground mb-4">الإعدادات العامة</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">معرف الناشر (Publisher ID)</label>
                    <input
                      type="text"
                      value={settingsForm.publisher_id}
                      onChange={(e) => setSettingsForm({ ...settingsForm, publisher_id: e.target.value })}
                      className="input-field"
                      placeholder="pub-xxxxxxxxxxxxxxxx"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      يمكنك العثور عليه في حساب AdSense الخاص بك
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="adsense_enabled"
                      checked={settingsForm.is_enabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, is_enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="adsense_enabled" className="text-sm font-medium">
                      تفعيل الإعلانات على الموقع
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hide_placeholders"
                      checked={settingsForm.hide_placeholders}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hide_placeholders: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="hide_placeholders" className="text-sm font-medium">
                      إخفاء الأماكن الفارغة (لإعلانات Auto Ads)
                    </label>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={updateAdSenseSettings.isPending}
                    className="btn-primary"
                  >
                    {updateAdSenseSettings.isPending && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                    حفظ الإعدادات
                  </button>
                </div>
              </div>

              {/* Ad Units */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">الوحداث الإعلانية</h2>
                <button onClick={() => openAdUnitModal()} className="btn-primary inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  وحدة جديدة
                </button>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">الاسم</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">معرف الوحدة (Slot ID)</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">المكان</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adUnits.map((unit) => (
                        <tr key={unit.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium text-foreground">{unit.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{unit.slot_id}</td>
                          <td className="py-3 px-4 text-muted-foreground">{unit.placement}</td>
                          <td className="py-3 px-4">
                            {unit.is_enabled ? (
                              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs">
                                مفعل
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs">
                                معطل
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openAdUnitModal(unit)}
                                className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAdUnit(unit.id)}
                                className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {adUnits.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-muted-foreground py-8">
                            لا توجد وحدات إعلانية
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-6">الإعدادات العامة</h1>

              <div className="space-y-6">
                {/* Account Settings */}
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">إعدادات الحساب</h2>
                  </div>

                  <div className="mb-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">البريد الإلكتروني الحالي:</p>
                    <p className="font-medium text-foreground">{user?.email}</p>
                  </div>

                  {/* Change Email */}
                  <div className="space-y-4 mb-6">
                    <h3 className="font-medium text-foreground">تغيير البريد الإلكتروني</h3>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">البريد الإلكتروني الجديد</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="input-field"
                        placeholder="example@email.com"
                      />
                    </div>
                    <button
                      onClick={handleUpdateEmail}
                      disabled={isUpdatingEmail}
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      {isUpdatingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                      تحديث البريد الإلكتروني
                    </button>
                  </div>

                  {/* Change Password */}
                  <div className="space-y-4 border-t border-border pt-6">
                    <h3 className="font-medium text-foreground">تغيير كلمة المرور</h3>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-field"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword}
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      {isUpdatingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                      تحديث كلمة المرور
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-border pt-6 mt-6">
                    <button
                      onClick={handleSignOut}
                      className="btn-secondary text-destructive hover:bg-destructive hover:text-destructive-foreground inline-flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <h2 className="text-lg font-bold text-foreground mb-4">معلومات الموقع</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">اسم الموقع</label>
                      <input type="text" defaultValue="وظفني حالاً" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">وصف الموقع</label>
                      <textarea
                        defaultValue="منصة رائدة للبحث عن الوظائف في دول الخليج العربي ومصر"
                        className="input-field h-24"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <h2 className="text-lg font-bold text-foreground mb-4">رفع الصور</h2>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">اسحب الصور هنا أو انقر للرفع</p>
                    <button className="btn-secondary">اختر ملفات</button>
                  </div>
                </div>

                <button className="btn-primary">حفظ الإعدادات</button>
              </div>
            </div>
          )}
        </main>
      </div>



      {/* Ad Unit Modal */}
      <Dialog open={isAdUnitModalOpen} onOpenChange={setIsAdUnitModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAdUnit ? "تعديل الوحدة الإعلانية" : "إضافة وحدة إعلانية جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم الوحدة</label>
              <input
                type="text"
                value={adUnitForm.name}
                onChange={(e) => setAdUnitForm({ ...adUnitForm, name: e.target.value })}
                className="input-field"
                placeholder="مثال: إعلان الشريط الجانبي"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">معرف الوحدة (Slot ID)</label>
              <input
                type="text"
                value={adUnitForm.slot_id}
                onChange={(e) => setAdUnitForm({ ...adUnitForm, slot_id: e.target.value })}
                className="input-field"
                placeholder="xxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">المكان (Placement)</label>
              <select
                value={adUnitForm.placement}
                onChange={(e) => setAdUnitForm({ ...adUnitForm, placement: e.target.value })}
                className="input-field"
              >
                <optgroup label="الصفحة الرئيسية (Home)">
                  <option value="home_top">home_top - لوحة إعلانية بعد الهيرو</option>
                  <option value="home_middle">home_middle - مستطيل في وسط المحتوى</option>
                  <option value="footer_top">footer_top - لوحة إعلانية قبل الفوتر</option>
                </optgroup>
                <optgroup label="جميع الوظائف (All Jobs)">
                  <option value="all_jobs_top">all_jobs_top - لوحة إعلانية بعد الهيرو</option>
                  <option value="all_jobs_middle">all_jobs_middle - مستطيل في وسط المحتوى</option>
                  <option value="all_jobs_bottom">all_jobs_bottom - لوحة إعلانية قبل الفوتر</option>
                </optgroup>
                <optgroup label="تفاصيل الوظيفة (Job Details)">
                  <option value="job_details_top">job_details_top - لوحة إعلانية في الأعلى</option>
                  <option value="job_details_middle">job_details_middle - مستطيل في وسط المحتوى</option>
                  <option value="job_details_bottom">job_details_bottom - لوحة إعلانية قبل الفوتر</option>
                </optgroup>
                <optgroup label="المدونة (Blog)">
                  <option value="blog_top">blog_top - لوحة إعلانية بعد الهيرو</option>
                  <option value="blog_middle">blog_middle - مستطيل في وسط المحتوى</option>
                  <option value="blog_bottom">blog_bottom - لوحة إعلانية قبل الفوتر</option>
                </optgroup>
                <optgroup label="صفحة المقال (Blog Post)">
                  <option value="blog_post_top">blog_post_top - لوحة إعلانية في الأعلى</option>
                  <option value="blog_post_middle">blog_post_middle - مستطيل في وسط المحتوى</option>
                  <option value="blog_post_bottom">blog_post_bottom - لوحة إعلانية قبل الفوتر</option>
                </optgroup>
              </select>
              <p className="text-xs text-muted-foreground mt-1">اختر المكان المناسب من القائمة (3 إعلانات فقط لكل صفحة وفقاً لسياسة Google AdSense)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">تنسيق الإعلان</label>
                <select
                  value={adUnitForm.ad_format}
                  onChange={(e) => setAdUnitForm({ ...adUnitForm, ad_format: e.target.value })}
                  className="input-field"
                >
                  <option value="auto">Auto</option>
                  <option value="rectangle">Rectangle</option>
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>
              <div className="flex items-center mt-8">
                <input
                  type="checkbox"
                  id="unit_enabled"
                  checked={adUnitForm.is_enabled}
                  onChange={(e) => setAdUnitForm({ ...adUnitForm, is_enabled: e.target.checked })}
                  className="w-4 h-4 mr-2"
                />
                <label htmlFor="unit_enabled" className="text-sm font-medium">
                  تفعيل الوحدة
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveAdUnit}
                disabled={createAdUnit.isPending || updateAdUnit.isPending}
                className="btn-primary flex-1"
              >
                {(createAdUnit.isPending || updateAdUnit.isPending) && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                {editingAdUnit ? "تحديث" : "إضافة"}
              </button>
              <button onClick={() => setIsAdUnitModalOpen(false)} className="btn-secondary">
                إلغاء
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog >
    </div >
  );
};

export default Admin;
