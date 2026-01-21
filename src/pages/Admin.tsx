import { useState, useEffect } from "react";
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
  Eye,
  MousePointer,
  TrendingUp,
  BarChart3,
  Users,
  UserPlus,
  UserMinus,
  Globe,
  Megaphone,
  Menu,
} from "lucide-react";
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from "@/hooks/useJobs";
import { useBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost } from "@/hooks/useBlogPosts";
import { useAnalyticsSummary, useJobsAnalytics, useDailyAnalytics, useCountryAnalytics } from "@/hooks/useJobAnalytics";
import { countries, exclusiveTagLabels, JobExclusiveTag, Job, BlogPost } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import RichTextEditor from "@/components/editor/RichTextEditor";
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

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
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
    editor: "",
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
    { id: "dashboard" as TabType, label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "jobs" as TabType, label: "الوظائف", icon: Briefcase },
    { id: "blog" as TabType, label: "المدونة", icon: FileText },
    { id: "users" as TabType, label: "المستخدمين", icon: Users },
    { id: "adsense" as TabType, label: "إعلانات جوجل", icon: Megaphone },
    { id: "settings" as TabType, label: "الإعدادات", icon: Settings },
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
        editor: job.editor || "",
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
        editor: user?.id || "",
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
        editor: jobForm.editor || user?.id || null,
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
      const errorMessage = error instanceof Error ? error.message : "فشل الاتصال بالخادم";
      toast({ 
        title: "حدث خطأ", 
        description: errorMessage || "يرجى التحقق من الاتصال والمحاولة مرة أخرى", 
        variant: "destructive" 
      });
      console.error("Error saving job:", error);
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
      const errorMessage = error instanceof Error ? error.message : "فشل الاتصال بالخادم";
      toast({ 
        title: "حدث خطأ", 
        description: errorMessage || "يرجى التحقق من الاتصال والمحاولة مرة أخرى", 
        variant: "destructive" 
      });
      console.error("Error saving blog:", error);
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
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-6">لوحة التحكم</h1>

              {/* Main Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <Briefcase className="w-8 h-8 text-primary" />
                    <span className="text-3xl font-bold text-foreground">{jobs.length}</span>
                  </div>
                  <p className="text-muted-foreground">إجمالي الوظائف</p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                    <span className="text-3xl font-bold text-foreground">{blogPosts.length}</span>
                  </div>
                  <p className="text-muted-foreground">مقالات المدونة</p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <Eye className="w-8 h-8 text-blue-500" />
                    <span className="text-3xl font-bold text-foreground">
                      {isLoadingAnalytics ? "-" : analyticsSummary?.total_views || 0}
                    </span>
                  </div>
                  <p className="text-muted-foreground">إجمالي المشاهدات</p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <MousePointer className="w-8 h-8 text-green-500" />
                    <span className="text-3xl font-bold text-foreground">
                      {isLoadingAnalytics ? "-" : analyticsSummary?.total_clicks || 0}
                    </span>
                  </div>
                  <p className="text-muted-foreground">نقرات التقديم</p>
                </div>
              </div>

              {/* Analytics Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">اليوم</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {isLoadingAnalytics ? "-" : analyticsSummary?.views_today || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">مشاهدة</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {isLoadingAnalytics ? "-" : analyticsSummary?.clicks_today || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">نقرة</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">هذا الأسبوع</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {isLoadingAnalytics ? "-" : analyticsSummary?.views_this_week || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">مشاهدة</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {isLoadingAnalytics ? "-" : analyticsSummary?.clicks_this_week || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">نقرة</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">هذا الشهر</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {isLoadingAnalytics ? "-" : analyticsSummary?.views_this_month || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">مشاهدة</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {isLoadingAnalytics ? "-" : analyticsSummary?.clicks_this_month || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">نقرة</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Chart */}
              <div className="bg-card rounded-xl p-6 border border-border mb-8">
                <h2 className="text-lg font-bold text-foreground mb-4">إحصائيات آخر 7 أيام</h2>
                <div className="space-y-3">
                  {dailyAnalytics.map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-24">
                        {new Date(day.date).toLocaleDateString("ar-SA", { weekday: "short", day: "numeric" })}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min((day.views / Math.max(...dailyAnalytics.map((d) => d.views), 1)) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-left">{day.views}</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-green-500 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min((day.clicks / Math.max(...dailyAnalytics.map((d) => d.clicks), 1)) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-left">{day.clicks}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-muted-foreground">المشاهدات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground">نقرات التقديم</span>
                  </div>
                </div>
              </div>

              {/* Country Analytics */}
              <div className="bg-card rounded-xl p-6 border border-border mb-8">
                <h2 className="text-lg font-bold text-foreground mb-4">إحصائيات حسب الدولة</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">الدولة</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">عدد الوظائف</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">المشاهدات</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">نقرات التقديم</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">معدل التحويل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {countryAnalytics.map((country) => (
                        <tr key={country.country_slug} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium text-foreground">{country.country}</td>
                          <td className="py-3 px-4 text-muted-foreground">{country.total_jobs}</td>
                          <td className="py-3 px-4">
                            <span className="text-blue-500 flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {country.views}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-green-500 flex items-center gap-1">
                              <MousePointer className="w-4 h-4" />
                              {country.clicks}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-primary font-medium">
                              {country.views > 0 ? ((country.clicks / country.views) * 100).toFixed(1) : 0}%
                            </span>
                          </td>
                        </tr>
                      ))}
                      {countryAnalytics.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-muted-foreground py-8">
                            لا توجد بيانات بعد
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Jobs by Views */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h2 className="text-lg font-bold text-foreground mb-4">أكثر الوظائف مشاهدة</h2>
                  <div className="space-y-3">
                    {jobsAnalytics.slice(0, 5).map((job, index) => (
                      <div
                        key={job.job_id}
                        className="flex items-center justify-between py-3 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <p className="font-medium text-foreground line-clamp-1">{job.job_title}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-500 flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {job.views}
                          </span>
                          <span className="text-green-500 flex items-center gap-1">
                            <MousePointer className="w-4 h-4" />
                            {job.clicks}
                          </span>
                        </div>
                      </div>
                    ))}
                    {jobsAnalytics.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">لا توجد بيانات بعد</p>
                    )}
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <h2 className="text-lg font-bold text-foreground mb-4">آخر الوظائف المضافة</h2>
                  {isLoadingJobs ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobs.slice(0, 5).map((job) => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between py-3 border-b border-border last:border-0"
                        >
                          <div>
                            <p className="font-medium text-foreground">{job.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {job.company} - {job.country}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground">{formatDate(job.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
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
      </div>        {/* Job Modal */}
      < Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen} >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "تعديل الوظيفة" : "إضافة وظيفة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">عنوان الوظيفة *</label>
              <input
                type="text"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                className="input-field"
                placeholder="مثال: مطور واجهات أمامية"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الدولة *</label>
                <select value={jobForm.country} onChange={handleCountryChange} className="input-field">
                  {countries.map((country) => (
                    <option key={country.slug} value={country.name}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الشركة</label>
                <input
                  type="text"
                  value={jobForm.company}
                  onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الراتب</label>
                <input
                  type="text"
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  className="input-field"
                  placeholder="مثال: 1500 - 2500 د.ك"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">نوع الوظيفة</label>
                <select
                  value={jobForm.job_type}
                  onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                  className="input-field"
                >
                  <option value="دوام كامل">دوام كامل</option>
                  <option value="دوام جزئي">دوام جزئي</option>
                  <option value="عن بعد">عن بعد</option>
                  <option value="عقد">عقد</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الوصف المختصر</label>
              <input
                type="text"
                value={jobForm.short_description}
                onChange={(e) => setJobForm({ ...jobForm, short_description: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الوصف الكامل *</label>
              <textarea
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                className="input-field h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">المتطلبات (سطر لكل متطلب)</label>
              <textarea
                value={jobForm.requirements}
                onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                className="input-field h-24"
                placeholder="خبرة 3 سنوات&#10;شهادة جامعية"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الوسوم (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={jobForm.tags}
                  onChange={(e) => setJobForm({ ...jobForm, tags: e.target.value })}
                  className="input-field"
                  placeholder="برمجة, تقنية, React"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">وسم مميز</label>
                <select
                  value={jobForm.exclusive_tag}
                  onChange={(e) => setJobForm({ ...jobForm, exclusive_tag: e.target.value as JobExclusiveTag })}
                  className="input-field"
                >
                  {Object.entries(exclusiveTagLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">رابط التقديم</label>
              <input
                type="url"
                dir="ltr"
                value={jobForm.apply_link}
                onChange={(e) => setJobForm({ ...jobForm, apply_link: e.target.value })}
                className="input-field text-left"
                placeholder="https://example.com/apply"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">صورة الوظيفة (رابط)</label>
              <input
                type="url"
                dir="ltr"
                value={jobForm.image_url}
                onChange={(e) => setJobForm({ ...jobForm, image_url: e.target.value })}
                className="input-field text-left"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">اترك فارغاً لاستخدام صورة افتراضية</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={jobForm.is_featured}
                onChange={(e) => setJobForm({ ...jobForm, is_featured: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_featured" className="text-sm font-medium">
                وظيفة مميزة
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveJob}
                disabled={createJob.isPending || updateJob.isPending}
                className="btn-primary flex-1"
              >
                {(createJob.isPending || updateJob.isPending) && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                {editingJob ? "تحديث" : "إضافة"}
              </button>
              <button onClick={() => setIsJobModalOpen(false)} className="btn-secondary">
                إلغاء
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog >

      {/* Blog Modal */}
      < Dialog open={isBlogModalOpen} onOpenChange={setIsBlogModalOpen} >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlog ? "تعديل المقال" : "إضافة مقال جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">عنوان المقال *</label>
                <input
                  type="text"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className="input-field"
                  dir={getTextDirection(blogForm.title)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الرابط (slug)</label>
                <input
                  type="text"
                  value={blogForm.slug}
                  onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                  className="input-field"
                  placeholder="يتم إنشاؤه تلقائياً"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الملخص</label>
              <textarea
                value={blogForm.excerpt}
                onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                className="input-field h-20"
                dir={getTextDirection(blogForm.excerpt)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">المحتوى *</label>
              <div className="h-[500px] border border-border rounded-lg overflow-hidden">
                <RichTextEditor
                  value={blogForm.content}
                  onChange={(value) => setBlogForm({ ...blogForm, content: value })}
                  placeholder="Type Your Content"
                  className="h-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الكاتب</label>
                <input
                  type="text"
                  value={blogForm.author}
                  onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الوسوم</label>
                <input
                  type="text"
                  value={blogForm.tags}
                  onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                  className="input-field"
                  placeholder="نصائح, مقابلات"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">رابط الصورة</label>
              <input
                type="url"
                value={blogForm.image_url}
                onChange={(e) => setBlogForm({ ...blogForm, image_url: e.target.value })}
                className="input-field text-left"
                dir="ltr"
              />
              {blogForm.image_url && (
                <div className="mt-3 relative w-full h-64 bg-muted rounded-lg border border-border overflow-hidden group">
                  <img
                    src={blogForm.image_url}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium">معاينة الصورة</p>
                  </div>
                </div>
              )}
            </div>

            {/* SEO Section */}
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">إعدادات SEO</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">عنوان الصفحة (Meta Title)</label>
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
                  <label className="block text-sm font-medium mb-2">وصف الصفحة (Meta Description)</label>
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
                id="is_published"
                checked={blogForm.is_published}
                onChange={(e) => setBlogForm({ ...blogForm, is_published: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_published" className="text-sm font-medium">
                نشر المقال
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveBlog}
                disabled={createBlogPost.isPending || updateBlogPost.isPending}
                className="btn-primary flex-1"
              >
                {(createBlogPost.isPending || updateBlogPost.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                )}
                {editingBlog ? "تحديث" : "إضافة"}
              </button>
              <button onClick={() => setIsBlogModalOpen(false)} className="btn-secondary">
                إلغاء
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog >
      {/* Ad Unit Modal */}
      < Dialog open={isAdUnitModalOpen} onOpenChange={setIsAdUnitModalOpen} >
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
                <optgroup label="الصفحة الرئيسية">
                  <option value="home_top">home_top - في الأعلى تحت الهيدر</option>
                  <option value="home_banner_1">home_banner_1 - بنر عريض في الجزء العلوي</option>
                  <option value="home_before_featured">home_before_featured - قبل قسم الوظائف المميزة</option>
                  <option value="home_after_featured">home_after_featured - بعد الوظائف المميزة</option>
                  <option value="home_mid_content_1">home_mid_content_1 - في وسط المحتوى</option>
                  <option value="home_after_latest">home_after_latest - بعد أحدث الوظائف</option>
                  <option value="home_large_rect">home_large_rect - مستطيل كبير في الأسفل</option>
                  <option value="home_bottom_inline">home_bottom_inline - قبل الفوتر مباشرة</option>
                </optgroup>
                <optgroup label="الشريط الجانبي">
                  <option value="sidebar_top">sidebar_top - أول عنصر في الشريط الجانبي</option>
                  <option value="sidebar_middle">sidebar_middle - في وسط الشريط الجانبي</option>
                  <option value="sidebar_bottom">sidebar_bottom - في آخر الشريط الجانبي</option>
                </optgroup>
                <optgroup label="تفاصيل الوظيفة">
                  <option value="job_details_top">job_details_top - أعلى صفحة الوظيفة</option>
                  <option value="job_details_banner_1">job_details_banner_1 - بنر داخل التفاصيل</option>
                  <option value="job_details_sidebar_top">job_details_sidebar_top - شريط جانبي الوظائف</option>
                </optgroup>
                <optgroup label="المدونة">
                  <option value="blog_top">blog_top - أعلى صفحة قائمة المقالات</option>
                  <option value="blog_banner_1">blog_banner_1 - بنر في صفحة المقالات</option>
                  <option value="blog_post_top">blog_post_top - أعلى صفحة المقال الفردي</option>
                  <option value="blog_post_in_article_1">blog_post_in_article_1 - داخل نص المقال</option>
                </optgroup>
                <optgroup label="التذييل">
                  <option value="footer_top">footer_top - شريط عريض فوق الفوتر</option>
                </optgroup>
              </select>
              <p className="text-xs text-muted-foreground mt-1">اختر المكان المناسب من القائمة</p>
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
