
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Save, Globe, Eye, MoreVertical, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/editor/RichTextEditor";
import SEOBar from "@/components/editor/SEOBar";
import { useJob, useCreateJob, useUpdateJob } from "@/hooks/useJobs";
import { useBlogPostById, useCreateBlogPost, useUpdateBlogPost } from "@/hooks/useBlogPosts";
import { Job, BlogPost, countries, JobExclusiveTag } from "@/types/database";
import { useAuth } from "@/hooks/useAuth";
import { getDirection } from "@/lib/utils";

const ContentEditor = () => {
    const { type, id } = useParams<{ type: "job" | "blog"; id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, isAdmin } = useAuth();
    const queryClient = useQueryClient();

    const returnPath = isAdmin ? "/admin" : "/employee";

    const isJob = type === "job";
    const isEditMode = !!id;

    // Data Fetching
    const { data: jobData, isLoading: isLoadingJob } = useJob(id || "");
    const { data: blogData, isLoading: isLoadingBlog } = useBlogPostById(id || "");

    // Mutations
    const createJob = useCreateJob();
    const updateJob = useUpdateJob();
    const createBlogPost = useCreateBlogPost();
    const updateBlogPost = useUpdateBlogPost();

    const isSaving =
        createJob.isPending ||
        updateJob.isPending ||
        createBlogPost.isPending ||
        updateBlogPost.isPending;

    // Form State
    const [title, setTitle] = useState("");
    const [content, setContent] = useState(""); // Description for Job, Content for Blog
    const [slug, setSlug] = useState("");
    const [excerpt, setExcerpt] = useState(""); // Short Description for Job
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");

    const [status, setStatus] = useState<"draft" | "published">("draft");
    const [imageUrl, setImageUrl] = useState("");
    const [tags, setTags] = useState("");
    const [focusKeyword, setFocusKeyword] = useState("");
    const [hasLoadedData, setHasLoadedData] = useState(false);

    // Job specific state
    const [company, setCompany] = useState("");
    const [country, setCountry] = useState("الكويت");
    const [countrySlug, setCountrySlug] = useState("kuwait");
    const [salary, setSalary] = useState("");
    const [jobType, setJobType] = useState("دوام كامل");
    const [applyLink, setApplyLink] = useState("");
    const [exclusiveTag, setExclusiveTag] = useState<JobExclusiveTag>("none");
    const [requirements, setRequirements] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);

    // Blog specific state
    const [author, setAuthor] = useState("فريق وظفني حالاً");

    // Load Data
    useEffect(() => {
        if (hasLoadedData) return; // Prevent overwriting user edits on background refetches

        if (isJob && jobData) {
            setTitle(jobData.title);
            setContent(jobData.description);
            setSlug(jobData.slug || "");
            setExcerpt(jobData.short_description || "");
            setCompany(jobData.company || "");
            setCountry(jobData.country);
            setCountrySlug(jobData.country_slug);
            setSalary(jobData.salary || "");
            setJobType(jobData.job_type || "دوام كامل");
            setApplyLink(jobData.apply_link || "");
            setExclusiveTag(jobData.exclusive_tag || "none");
            setRequirements(jobData.requirements?.join("\n") || "");
            setTags(jobData.tags?.join(", ") || "");
            setFocusKeyword(jobData.focus_keyword || "");
            setImageUrl(jobData.image_url || "");
            setIsFeatured(jobData.is_featured || false);
            setStatus(jobData.is_published ? "published" : "draft");
            setHasLoadedData(true);
        } else if (!isJob && blogData) {
            setTitle(blogData.title);
            setContent(blogData.content);
            setSlug(blogData.slug);
            setExcerpt(blogData.excerpt || "");
            setMetaTitle(blogData.meta_title || "");
            setMetaDescription(blogData.meta_description || "");
            setStatus(blogData.is_published ? "published" : "draft");
            setAuthor(blogData.author || "فريق وظفني حالاً");
            setTags(blogData.tags?.join(", ") || "");
            setFocusKeyword(blogData.focus_keyword || "");
            setImageUrl(blogData.image_url || "");
            setHasLoadedData(true);
        }
    }, [jobData, blogData, isJob, hasLoadedData]);

    // Reset hasLoadedData when ID changes
    useEffect(() => {
        setHasLoadedData(false);
    }, [id]);

    // Auto-save logic
    useEffect(() => {
        const saveToLocal = () => {
            const draftKey = `draft_${type}_${id || 'new'}`;
            const draftData = {
                title, content, slug, excerpt, metaTitle, metaDescription,
                company, country, salary, tags, focusKeyword, requirements,
                timestamp: Date.now()
            };
            localStorage.setItem(draftKey, JSON.stringify(draftData));
        };

        const interval = setInterval(saveToLocal, 5000); // Auto-save every 5s
        return () => clearInterval(interval);
    }, [title, content, slug, type, id]);

    // Load from local storage on mount if new
    useEffect(() => {
        if (!isEditMode) {
            const draftKey = `draft_${type}_new`;
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                const parsed = JSON.parse(savedDraft);
                // Ask user if they want to restore? For now just restore if it's recent? 
                // Or simply restore fields if they are empty.
                if (!title && parsed.title) setTitle(parsed.title);
                if (!content && parsed.content) setContent(parsed.content);
                if (!focusKeyword && parsed.focusKeyword) setFocusKeyword(parsed.focusKeyword);
                if (!tags && parsed.tags) setTags(parsed.tags);
            }
        }
    }, [isEditMode, type]);

    const handleSave = async () => {
        try {
            if (isJob) {
                const jobPayload = {
                    title,
                    slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
                    description: content,
                    short_description: excerpt || null,
                    company: company || null,
                    country,
                    country_slug: countrySlug,
                    salary: salary || null,
                    job_type: jobType,
                    requirements: requirements ? requirements.split("\n").filter(r => r.trim()) : null,
                    tags: tags ? tags.split(",").map(t => t.trim()).filter(t => t) : null,
                    focus_keyword: focusKeyword || null,
                    exclusive_tag: exclusiveTag,
                    apply_link: applyLink || null,
                    image_url: imageUrl || null,
                    editor: user?.id || null,
                    is_featured: isFeatured,
                    is_published: status === "published",
                };

                if (isEditMode && id) {
                    await updateJob.mutateAsync({ id, ...jobPayload });
                    toast({ title: "تم تحديث الوظيفة بنجاح" });
                } else {
                    await createJob.mutateAsync(jobPayload);
                    toast({ title: "تم إضافة الوظيفة بنجاح" });
                    navigate(returnPath); // Return to the appropriate dashboard
                }
            } else {
                const blogPayload = {
                    title,
                    slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
                    content,
                    excerpt: excerpt || null,
                    image_url: imageUrl || null,
                    author: author || null,
                    tags: tags ? tags.split(",").map(t => t.trim()).filter(t => t) : null,
                    focus_keyword: focusKeyword || null,
                    is_published: status === "published",
                    meta_title: metaTitle || null,
                    meta_description: metaDescription || null,
                };

                if (isEditMode && id) {
                    await updateBlogPost.mutateAsync({ id, ...blogPayload });
                    toast({ title: "تم تحديث المقال بنجاح" });
                } else {
                    await createBlogPost.mutateAsync(blogPayload);
                    toast({ title: "تم نشر المقال بنجاح" });
                    navigate(returnPath);
                }
            }

            // Clear draft
            localStorage.removeItem(`draft_${type}_${id || 'new'}`);

        } catch (error) {
            console.error(error);
            toast({ title: "حدث خطأ أثناء الحفظ", variant: "destructive" });
        }
    };

    const handleCountryChange = (val: string) => {
        const selected = countries.find(c => c.name === val);
        if (selected) {
            setCountry(selected.name);
            setCountrySlug(selected.slug);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col dir-rtl">
            {/* Header */}
            <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(returnPath)}>
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg">
                            {isEditMode ? "تعديل" : "إضافة"} {isJob ? "وظيفة" : "مقال"}
                        </span>
                        <span className="text-xs text-foreground flex items-center gap-1">
                            {isSaving ? "جاري الحفظ..." : "تم الحفظ تلقائياً"}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleSave()}>
                        <Save className="w-4 h-4 ml-2" />
                        حفظ
                    </Button>
                    <Button
                        variant={status === "published" ? "default" : "secondary"}
                        onClick={() => {
                            setStatus(prev => prev === "published" ? "draft" : "published");
                            // Optionally save immediately
                        }}
                    >
                        {status === "published" ? "منشور" : "مسودة"}
                    </Button>
                </div>
            </div>

            {/* Sticky Editor Toolbar — sits right below the nav */}
            <div
                id="editor-toolbar"
                className="sticky top-16 z-40 bg-card border-b border-border px-4 py-1"
                style={{ direction: 'ltr', textAlign: 'left' }}
            >
                <span className="ql-formats">
                    <select className="ql-header" defaultValue="">
                        <option value="1"></option>
                        <option value="2"></option>
                        <option value="3"></option>
                        <option value=""></option>
                    </select>
                </span>
                <span className="ql-formats">
                    <button className="ql-bold"></button>
                    <button className="ql-italic"></button>
                    <button className="ql-underline"></button>
                    <button className="ql-strike"></button>
                </span>
                <span className="ql-formats">
                    <button className="ql-blockquote"></button>
                    <button className="ql-code-block"></button>
                </span>
                <span className="ql-formats">
                    <button className="ql-list" value="ordered"></button>
                    <button className="ql-list" value="bullet"></button>
                </span>
                <span className="ql-formats">
                    <button className="ql-indent" value="-1"></button>
                    <button className="ql-indent" value="+1"></button>
                </span>
                <span className="ql-formats">
                    <select className="ql-align"></select>
                </span>
                <span className="ql-formats">
                    <button className="ql-link"></button>
                </span>
                <span className="ql-formats">
                    <select className="ql-color"></select>
                    <select className="ql-background"></select>
                </span>
                <span className="ql-formats">
                    <button className="ql-clean"></button>
                </span>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-6 p-8">
                        <Input
                            placeholder="عنـــوان الموضــوع..."
                            className="text-3xl font-bold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-foreground/50 h-auto py-4"
                            value={title}
                            dir={getDirection(title)}
                            onChange={e => setTitle(e.target.value)}
                        />

                        <div className="min-h-[500px] overflow-visible">
                            <RichTextEditor
                                value={content}
                                onChange={setContent}
                                className="min-h-[500px] border-none"
                                placeholder="اكتب المحتوى هنا..."
                                toolbarContainerId="editor-toolbar"
                            />
                        </div>

                        {isJob && (
                            <div className="space-y-4">
                                <Label>متطلبات الوظيفة (كل سطر متطلب)</Label>
                                <Textarea
                                    value={requirements}
                                    dir={getDirection(requirements)}
                                    onChange={e => setRequirements(e.target.value)}
                                    rows={6}
                                    placeholder="أدخل متطلبات الوظيفة..."
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-[350px] border-r border-border bg-card overflow-y-auto p-6 space-y-8">

                    {/* SEO Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            SEO & Metadata
                        </h3>

                        <div className="space-y-2">
                            <Label>الرابط (Slug)</Label>
                            <Input
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                placeholder="url-friendly-slug"
                                className="font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>وصف الميتا (Meta Description)</Label>
                            <Textarea
                                value={excerpt}
                                onChange={e => setExcerpt(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <SEOBar
                            title={metaTitle || title}
                            description={metaDescription || excerpt || (content ? content.substring(0, 160) : "")}
                            slug={slug}
                            focus_keyword={focusKeyword}
                            onChange={(seo) => {
                                setFocusKeyword(seo.focus_keyword);
                            }}
                        />
                    </div>

                    <div className="h-px bg-border" />

                    {/* Settings Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <LayoutTemplate className="w-4 h-4" />
                            إعدادات {isJob ? "الوظيفة" : "المقال"}
                        </h3>

                        <div className="space-y-2">
                            <Label>رابط الصورة (Image URL)</Label>
                            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} dir="ltr" placeholder="https://..." />
                            {imageUrl && (
                                <div className="mt-2 rounded-lg border border-border overflow-hidden bg-muted">
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        className="w-full h-32 object-contain"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                </div>
                            )}
                        </div>

                        {isJob ? (
                            <>
                                <div className="space-y-2">
                                    <Label>اسم الشركة</Label>
                                    <Input value={company} onChange={e => setCompany(e.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <Label>الدولة</Label>
                                    <Select value={country} onValueChange={handleCountryChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.map(c => (
                                                <SelectItem key={c.slug} value={c.name}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>الراتب</Label>
                                    <Input value={salary} onChange={e => setSalary(e.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <Label>نوع الوظيفة</Label>
                                    <Select value={jobType} onValueChange={setJobType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="دوام كامل">دوام كامل</SelectItem>
                                            <SelectItem value="دوام جزئي">دوام جزئي</SelectItem>
                                            <SelectItem value="عقد">عقد</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>رابط التقديم</Label>
                                    <Input value={applyLink} onChange={e => setApplyLink(e.target.value)} dir="ltr" />
                                </div>

                                <div className="space-y-2">
                                    <Label>مميز؟</Label>
                                    <Select value={exclusiveTag} onValueChange={(val: JobExclusiveTag) => setExclusiveTag(val)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">لا يوجد</SelectItem>
                                            <SelectItem value="best">الأفضل</SelectItem>
                                            <SelectItem value="urgent">عاجل</SelectItem>
                                            <SelectItem value="featured">مميز</SelectItem>
                                            <SelectItem value="high_pay">راتب مرتفع</SelectItem>
                                            <SelectItem value="new">جديد</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2 space-x-reverse pt-4">
                                    <Switch
                                        id="is-featured"
                                        checked={isFeatured}
                                        onCheckedChange={setIsFeatured}
                                    />
                                    <Label htmlFor="is-featured">تمييز الوظيفة (Featured)</Label>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>الكاتب</Label>
                                    <Input value={author} onChange={e => setAuthor(e.target.value)} />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label>الوسوم (Tags)</Label>
                            <Input
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                                placeholder="tag1, tag2, tag3"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentEditor;
