import { useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    RadialBarChart,
    RadialBar,
    Legend,
    ComposedChart,
    Line,
} from "recharts";
import {
    Briefcase,
    FileText,
    Eye,
    MousePointer,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Globe,
    Loader2,
    Zap,
    Target,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Flame,
} from "lucide-react";
import { Job, BlogPost } from "@/types/database";

interface AnalyticsSummary {
    total_views: number;
    total_clicks: number;
    views_today: number;
    clicks_today: number;
    views_this_week: number;
    clicks_this_week: number;
    views_this_month: number;
    clicks_this_month: number;
}

interface DailyAnalytics {
    date: string;
    views: number;
    clicks: number;
}

interface CountryAnalytics {
    country: string;
    country_slug: string;
    total_jobs: number;
    views: number;
    clicks: number;
}

interface JobAnalytics {
    job_id: string;
    job_title: string;
    views: number;
    clicks: number;
}

interface AnalyticsDashboardProps {
    jobs: Job[];
    blogPosts: BlogPost[];
    analyticsSummary: AnalyticsSummary | undefined;
    isLoadingAnalytics: boolean;
    isLoadingJobs: boolean;
    dailyAnalytics: DailyAnalytics[];
    countryAnalytics: CountryAnalytics[];
    jobsAnalytics: JobAnalytics[];
    formatDate: (date: string) => string;
}

// Custom colors
const CHART_COLORS = {
    primary: "#3b82f6",
    primaryLight: "#93c5fd",
    secondary: "#10b981",
    secondaryLight: "#6ee7b7",
    accent: "#8b5cf6",
    accentLight: "#c4b5fd",
    warning: "#f59e0b",
    warningLight: "#fcd34d",
    danger: "#ef4444",
    dangerLight: "#fca5a5",
    info: "#06b6d4",
    infoLight: "#67e8f9",
};

const PIE_COLORS = [
    "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899",
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-xl p-4 shadow-2xl backdrop-blur-sm">
                <p className="text-sm font-bold text-foreground mb-2">{label}</p>
                {payload.map((pld: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: pld.color }}
                        />
                        <span className="text-muted-foreground">{pld.name}:</span>
                        <span className="font-bold text-foreground">
                            {pld.value?.toLocaleString("ar-SA")}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
    return (
        <span className="tabular-nums">
            {value.toLocaleString("ar-SA")}{suffix}
        </span>
    );
};

const AnalyticsDashboard = ({
    jobs,
    blogPosts,
    analyticsSummary,
    isLoadingAnalytics,
    isLoadingJobs,
    dailyAnalytics,
    countryAnalytics,
    jobsAnalytics,
    formatDate,
}: AnalyticsDashboardProps) => {
    // Computed data
    const totalConversionRate = useMemo(() => {
        if (!analyticsSummary || analyticsSummary.total_views === 0) return 0;
        return ((analyticsSummary.total_clicks / analyticsSummary.total_views) * 100);
    }, [analyticsSummary]);

    const weeklyConversionRate = useMemo(() => {
        if (!analyticsSummary || analyticsSummary.views_this_week === 0) return 0;
        return ((analyticsSummary.clicks_this_week / analyticsSummary.views_this_week) * 100);
    }, [analyticsSummary]);

    const todayConversionRate = useMemo(() => {
        if (!analyticsSummary || analyticsSummary.views_today === 0) return 0;
        return ((analyticsSummary.clicks_today / analyticsSummary.views_today) * 100);
    }, [analyticsSummary]);

    // Chart data for daily analytics
    const chartDailyData = useMemo(() => {
        return dailyAnalytics.map((day) => ({
            name: new Date(day.date).toLocaleDateString("ar-SA", { weekday: "short", day: "numeric" }),
            المشاهدات: day.views,
            النقرات: day.clicks,
            "معدل التحويل": day.views > 0 ? parseFloat(((day.clicks / day.views) * 100).toFixed(1)) : 0,
        }));
    }, [dailyAnalytics]);

    // Country pie data for views
    const countryViewsPieData = useMemo(() => {
        return countryAnalytics.map((c) => ({
            name: c.country,
            value: c.views,
        }));
    }, [countryAnalytics]);

    // Country pie data for clicks
    const countryClicksPieData = useMemo(() => {
        return countryAnalytics.map((c) => ({
            name: c.country,
            value: c.clicks,
        }));
    }, [countryAnalytics]);

    // Country pie data for jobs
    const countryJobsPieData = useMemo(() => {
        return countryAnalytics.map((c) => ({
            name: c.country,
            value: c.total_jobs,
        }));
    }, [countryAnalytics]);

    // Performance radial data
    const performanceData = useMemo(() => {
        if (!analyticsSummary) return [];
        const maxViews = Math.max(analyticsSummary.views_this_month, 1);
        return [
            {
                name: "اليوم",
                value: analyticsSummary.views_today,
                fill: CHART_COLORS.primary,
                percentage: Math.round((analyticsSummary.views_today / maxViews) * 100),
            },
            {
                name: "الأسبوع",
                value: analyticsSummary.views_this_week,
                fill: CHART_COLORS.secondary,
                percentage: Math.round((analyticsSummary.views_this_week / maxViews) * 100),
            },
            {
                name: "الشهر",
                value: analyticsSummary.views_this_month,
                fill: CHART_COLORS.accent,
                percentage: 100,
            },
        ];
    }, [analyticsSummary]);

    // Published vs draft stats
    const publishedJobs = jobs.filter(j => j.is_published !== false).length;
    const draftJobs = jobs.filter(j => j.is_published === false).length;
    const publishedBlogs = blogPosts.filter(b => b.is_published !== false).length;
    const draftBlogs = blogPosts.filter(b => b.is_published === false).length;

    const contentStatusData = [
        { name: "وظائف منشورة", value: publishedJobs, fill: CHART_COLORS.primary },
        { name: "وظائف مسودة", value: draftJobs, fill: CHART_COLORS.primaryLight },
        { name: "مقالات منشورة", value: publishedBlogs, fill: CHART_COLORS.secondary },
        { name: "مقالات مسودة", value: draftBlogs, fill: CHART_COLORS.secondaryLight },
    ];

    // Week totals
    const weekTotalViews = dailyAnalytics.reduce((sum, d) => sum + d.views, 0);
    const weekTotalClicks = dailyAnalytics.reduce((sum, d) => sum + d.clicks, 0);
    const avgDailyViews = dailyAnalytics.length > 0 ? Math.round(weekTotalViews / dailyAnalytics.length) : 0;
    const avgDailyClicks = dailyAnalytics.length > 0 ? Math.round(weekTotalClicks / dailyAnalytics.length) : 0;

    // Best day
    const bestDay = useMemo(() => {
        if (dailyAnalytics.length === 0) return null;
        return dailyAnalytics.reduce((best, day) =>
            (day.views + day.clicks) > (best.views + best.clicks) ? day : best
            , dailyAnalytics[0]);
    }, [dailyAnalytics]);

    if (isLoadingAnalytics) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">جارٍ تحميل الإحصائيات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Hero Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">لوحة التحكم</h1>
                    <p className="text-muted-foreground mt-1">نظرة شاملة على أداء الموقع والإحصائيات</p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    <Activity className="w-4 h-4" />
                    <span>مباشر</span>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                </div>
            </div>

            {/* ─── Primary KPI Cards ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* Total Jobs */}
                <div className="relative overflow-hidden bg-gradient-to-bl from-blue-500/10 via-card to-card rounded-2xl p-5 lg:p-6 border border-blue-500/20 group hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                    <div className="absolute top-0 left-0 w-20 h-20 bg-blue-500/5 rounded-full -translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
                                {publishedJobs} منشور
                            </span>
                        </div>
                        <p className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                            <AnimatedNumber value={jobs.length} />
                        </p>
                        <p className="text-sm text-muted-foreground">إجمالي الوظائف</p>
                    </div>
                </div>

                {/* Blog Posts */}
                <div className="relative overflow-hidden bg-gradient-to-bl from-purple-500/10 via-card to-card rounded-2xl p-5 lg:p-6 border border-purple-500/20 group hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
                    <div className="absolute top-0 left-0 w-20 h-20 bg-purple-500/5 rounded-full -translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-purple-500" />
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/10 text-purple-500">
                                {publishedBlogs} منشور
                            </span>
                        </div>
                        <p className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                            <AnimatedNumber value={blogPosts.length} />
                        </p>
                        <p className="text-sm text-muted-foreground">مقالات المدونة</p>
                    </div>
                </div>

                {/* Total Views */}
                <div className="relative overflow-hidden bg-gradient-to-bl from-cyan-500/10 via-card to-card rounded-2xl p-5 lg:p-6 border border-cyan-500/20 group hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5">
                    <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-500/5 rounded-full -translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-cyan-500" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-cyan-500">
                                <TrendingUp className="w-3 h-3" />
                                <span>+{analyticsSummary?.views_today || 0} اليوم</span>
                            </div>
                        </div>
                        <p className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                            <AnimatedNumber value={analyticsSummary?.total_views || 0} />
                        </p>
                        <p className="text-sm text-muted-foreground">إجمالي المشاهدات</p>
                    </div>
                </div>

                {/* Apply Clicks */}
                <div className="relative overflow-hidden bg-gradient-to-bl from-emerald-500/10 via-card to-card rounded-2xl p-5 lg:p-6 border border-emerald-500/20 group hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
                    <div className="absolute top-0 left-0 w-20 h-20 bg-emerald-500/5 rounded-full -translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <MousePointer className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-500" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                                <Target className="w-3 h-3" />
                                <span>{totalConversionRate.toFixed(1)}% تحويل</span>
                            </div>
                        </div>
                        <p className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                            <AnimatedNumber value={analyticsSummary?.total_clicks || 0} />
                        </p>
                        <p className="text-sm text-muted-foreground">نقرات التقديم</p>
                    </div>
                </div>
            </div>

            {/* ─── Time Period Breakdown ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {/* Today */}
                <div className="bg-card rounded-2xl p-5 lg:p-6 border border-border hover:border-primary/30 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground">إحصائيات اليوم</h3>
                            <p className="text-xs text-muted-foreground">أداء اليوم الحالي</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-xl bg-muted/50">
                            <p className="text-xl lg:text-2xl font-bold text-foreground">
                                {analyticsSummary?.views_today || 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">مشاهدة</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/50">
                            <p className="text-xl lg:text-2xl font-bold text-foreground">
                                {analyticsSummary?.clicks_today || 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">نقرة</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/50">
                            <p className="text-xl lg:text-2xl font-bold text-primary">
                                {todayConversionRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">تحويل</p>
                        </div>
                    </div>
                </div>

                {/* This Week */}
                <div className="bg-card rounded-2xl p-5 lg:p-6 border border-border hover:border-primary/30 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground">هذا الأسبوع</h3>
                            <p className="text-xs text-muted-foreground">ملخص أسبوعي</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-xl bg-muted/50">
                            <p className="text-xl lg:text-2xl font-bold text-foreground">
                                {analyticsSummary?.views_this_week || 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">مشاهدة</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/50">
                            <p className="text-xl lg:text-2xl font-bold text-foreground">
                                {analyticsSummary?.clicks_this_week || 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">نقرة</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/50">
                            <p className="text-xl lg:text-2xl font-bold text-primary">
                                {weeklyConversionRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">تحويل</p>
                        </div>
                    </div>
                </div>

                {/* This Month */}
                <div className="bg-card rounded-2xl p-5 lg:p-6 border border-border hover:border-primary/30 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground">هذا الشهر</h3>
                            <p className="text-xs text-muted-foreground">ملخص شهري</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-xl bg-muted/50">
                            <p className="text-xl lg:text-2xl font-bold text-foreground">
                                {analyticsSummary?.views_this_month || 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">مشاهدة</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/50">
                            <p className="text-xl lg:text-2xl font-bold text-foreground">
                                {analyticsSummary?.clicks_this_month || 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">نقرة</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/50">
                            <p className="text-xl lg:text-2xl font-bold text-primary">
                                {analyticsSummary?.views_this_month
                                    ? ((analyticsSummary.clicks_this_month / analyticsSummary.views_this_month) * 100).toFixed(1)
                                    : 0}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">تحويل</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── 7-Day Area Chart + Weekly Summary ─── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                {/* Main Area Chart – 7 Days */}
                <div className="xl:col-span-2 bg-card rounded-2xl p-5 lg:p-6 border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">إحصائيات آخر 7 أيام</h2>
                                <p className="text-xs text-muted-foreground">المشاهدات والنقرات اليومية</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-muted-foreground">المشاهدات</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-muted-foreground">النقرات</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] lg:h-[340px]" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartDailyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                    axisLine={{ stroke: "hsl(var(--border))" }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="المشاهدات"
                                    stroke={CHART_COLORS.primary}
                                    strokeWidth={2.5}
                                    fill="url(#viewsGradient)"
                                    name="المشاهدات"
                                    dot={{ r: 4, fill: CHART_COLORS.primary, strokeWidth: 2, stroke: "#fff" }}
                                    activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="النقرات"
                                    stroke={CHART_COLORS.secondary}
                                    strokeWidth={2.5}
                                    fill="url(#clicksGradient)"
                                    name="النقرات"
                                    dot={{ r: 4, fill: CHART_COLORS.secondary, strokeWidth: 2, stroke: "#fff" }}
                                    activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="معدل التحويل"
                                    stroke={CHART_COLORS.accent}
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    name="معدل التحويل (%)"
                                    yAxisId={0}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Summary Sidebar */}
                <div className="bg-card rounded-2xl p-5 lg:p-6 border border-border flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">ملخص الأسبوع</h3>
                                <p className="text-xs text-muted-foreground">تفاصيل الأداء</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Total views this week */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                <div className="flex items-center gap-3">
                                    <Eye className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm text-foreground">إجمالي المشاهدات</span>
                                </div>
                                <span className="text-lg font-bold text-blue-500">{weekTotalViews.toLocaleString("ar-SA")}</span>
                            </div>

                            {/* Total clicks this week */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                <div className="flex items-center gap-3">
                                    <MousePointer className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm text-foreground">إجمالي النقرات</span>
                                </div>
                                <span className="text-lg font-bold text-emerald-500">{weekTotalClicks.toLocaleString("ar-SA")}</span>
                            </div>

                            {/* Average daily views */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="w-5 h-5 text-violet-500" />
                                    <span className="text-sm text-foreground">متوسط يومي</span>
                                </div>
                                <span className="text-lg font-bold text-violet-500">{avgDailyViews.toLocaleString("ar-SA")}</span>
                            </div>

                            {/* Conversion rate */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                <div className="flex items-center gap-3">
                                    <Target className="w-5 h-5 text-amber-500" />
                                    <span className="text-sm text-foreground">معدل التحويل</span>
                                </div>
                                <span className="text-lg font-bold text-amber-500">
                                    {weekTotalViews > 0 ? ((weekTotalClicks / weekTotalViews) * 100).toFixed(1) : 0}%
                                </span>
                            </div>

                            {/* Best day */}
                            {bestDay && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                                    <div className="flex items-center gap-3">
                                        <Flame className="w-5 h-5 text-rose-500" />
                                        <span className="text-sm text-foreground">أفضل يوم</span>
                                    </div>
                                    <span className="text-sm font-bold text-rose-500">
                                        {new Date(bestDay.date).toLocaleDateString("ar-SA", { weekday: "short", day: "numeric" })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Country Analytics: Pie Charts + Table ─── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                {/* Country Pie Charts */}
                <div className="bg-card rounded-2xl p-5 lg:p-6 border border-border">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">توزيع حسب الدولة</h2>
                            <p className="text-xs text-muted-foreground">المشاهدات والنقرات لكل دولة</p>
                        </div>
                    </div>

                    {countryAnalytics.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-muted-foreground">
                            لا توجد بيانات بعد
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {/* Views Pie */}
                            <div>
                                <p className="text-sm font-medium text-center text-muted-foreground mb-2">المشاهدات</p>
                                <div className="h-[200px]" dir="ltr">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={countryViewsPieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {countryViewsPieData.map((_, index) => (
                                                    <Cell key={`cell-v-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                content={({ active, payload }) =>
                                                    active && payload?.[0] ? (
                                                        <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
                                                            <p className="font-bold text-foreground">{payload[0].name}</p>
                                                            <p className="text-muted-foreground">{payload[0].value?.toLocaleString("ar-SA")} مشاهدة</p>
                                                        </div>
                                                    ) : null
                                                }
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Clicks Pie */}
                            <div>
                                <p className="text-sm font-medium text-center text-muted-foreground mb-2">النقرات</p>
                                <div className="h-[200px]" dir="ltr">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={countryClicksPieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {countryClicksPieData.map((_, index) => (
                                                    <Cell key={`cell-c-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                content={({ active, payload }) =>
                                                    active && payload?.[0] ? (
                                                        <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
                                                            <p className="font-bold text-foreground">{payload[0].name}</p>
                                                            <p className="text-muted-foreground">{payload[0].value?.toLocaleString("ar-SA")} نقرة</p>
                                                        </div>
                                                    ) : null
                                                }
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="col-span-2 flex flex-wrap items-center justify-center gap-3 mt-2">
                                {countryViewsPieData.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                        />
                                        <span className="text-muted-foreground">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Country Table */}
                <div className="bg-card rounded-2xl p-5 lg:p-6 border border-border">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">إحصائيات حسب الدولة</h2>
                            <p className="text-xs text-muted-foreground">تفاصيل الأداء لكل دولة</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-right py-3 px-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">الدولة</th>
                                    <th className="text-right py-3 px-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">الوظائف</th>
                                    <th className="text-right py-3 px-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">المشاهدات</th>
                                    <th className="text-right py-3 px-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">النقرات</th>
                                    <th className="text-right py-3 px-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">التحويل</th>
                                </tr>
                            </thead>
                            <tbody>
                                {countryAnalytics.map((country, i) => {
                                    const convRate = country.views > 0 ? ((country.clicks / country.views) * 100) : 0;
                                    return (
                                        <tr
                                            key={country.country_slug}
                                            className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                                        >
                                            <td className="py-3 px-3">
                                                <span className="font-medium text-foreground">{country.country}</span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="inline-flex items-center gap-1 text-sm">
                                                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                                                    {country.total_jobs}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="text-blue-500 font-medium flex items-center gap-1 text-sm">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {country.views.toLocaleString("ar-SA")}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="text-emerald-500 font-medium flex items-center gap-1 text-sm">
                                                    <MousePointer className="w-3.5 h-3.5" />
                                                    {country.clicks.toLocaleString("ar-SA")}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden max-w-[60px]">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-l from-primary to-blue-400 transition-all duration-500"
                                                            style={{ width: `${Math.min(convRate, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-primary font-bold text-sm min-w-[40px]">
                                                        {convRate.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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
            </div>

            {/* ─── Content Status Donut + Performance Radial ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {/* Content Status Donut */}
                <div className="bg-card rounded-2xl p-5 lg:p-6 border border-border">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">حالة المحتوى</h2>
                            <p className="text-xs text-muted-foreground">الوظائف والمقالات: منشور و مسودة</p>
                        </div>
                    </div>
                    <div className="h-[250px]" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={contentStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={95}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {contentStatusData.map((entry, index) => (
                                        <Cell key={`cell-status-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) =>
                                        active && payload?.[0] ? (
                                            <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
                                                <p className="font-bold text-foreground">{payload[0].name}</p>
                                                <p className="text-muted-foreground">{payload[0].value}</p>
                                            </div>
                                        ) : null
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {contentStatusData.map((item) => (
                            <div key={item.name} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                <span className="text-muted-foreground">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Jobs Distribution Bar Chart */}
                <div className="bg-card rounded-2xl p-5 lg:p-6 border border-border">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">توزيع الوظائف حسب الدولة</h2>
                            <p className="text-xs text-muted-foreground">عدد الوظائف في كل دولة</p>
                        </div>
                    </div>
                    {countryAnalytics.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                            لا توجد بيانات بعد
                        </div>
                    ) : (
                        <div className="h-[280px]" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={countryAnalytics.map(c => ({ name: c.country, الوظائف: c.total_jobs, المشاهدات: c.views, النقرات: c.clicks }))}
                                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                                        axisLine={{ stroke: "hsl(var(--border))" }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="الوظائف" fill={CHART_COLORS.warning} radius={[6, 6, 0, 0]} barSize={28} />
                                    <Bar dataKey="المشاهدات" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} barSize={28} />
                                    <Bar dataKey="النقرات" fill={CHART_COLORS.secondary} radius={[6, 6, 0, 0]} barSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Top Jobs + Latest Jobs ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Top Jobs by Views */}
                <div className="bg-card rounded-2xl p-5 lg:p-6 border border-border">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Flame className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">أكثر الوظائف مشاهدة</h2>
                            <p className="text-xs text-muted-foreground">الوظائف الأعلى أداءً</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {jobsAnalytics.slice(0, 5).map((job, index) => {
                            const maxViews = Math.max(...jobsAnalytics.slice(0, 5).map(j => j.views), 1);
                            const percentage = (job.views / maxViews) * 100;
                            const rankColors = ["from-amber-400 to-amber-600", "from-slate-300 to-slate-500", "from-orange-300 to-orange-500", "from-blue-300 to-blue-500", "from-gray-300 to-gray-500"];
                            return (
                                <div
                                    key={job.job_id}
                                    className="relative rounded-xl p-4 bg-muted/30 hover:bg-muted/50 transition-all duration-200 group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-7 h-7 rounded-lg bg-gradient-to-br ${rankColors[index]} text-white text-xs flex items-center justify-center font-bold shadow-sm`}>
                                                {index + 1}
                                            </span>
                                            <p className="font-medium text-foreground line-clamp-1 text-sm">{job.job_title}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-l from-blue-500 to-blue-400 h-full rounded-full transition-all duration-700"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 text-sm whitespace-nowrap">
                                            <span className="text-blue-500 flex items-center gap-1 font-medium">
                                                <Eye className="w-3.5 h-3.5" />
                                                {job.views.toLocaleString("ar-SA")}
                                            </span>
                                            <span className="text-emerald-500 flex items-center gap-1 font-medium">
                                                <MousePointer className="w-3.5 h-3.5" />
                                                {job.clicks.toLocaleString("ar-SA")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {jobsAnalytics.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">لا توجد بيانات بعد</p>
                        )}
                    </div>
                </div>

                {/* Latest Jobs */}
                <div className="bg-card rounded-2xl p-5 lg:p-6 border border-border">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">آخر الوظائف المضافة</h2>
                            <p className="text-xs text-muted-foreground">أحدث الوظائف على المنصة</p>
                        </div>
                    </div>
                    {isLoadingJobs ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {jobs.slice(0, 5).map((job, index) => (
                                <div
                                    key={job.id}
                                    className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`w-2 h-2 rounded-full ${job.is_published !== false ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        <div className="min-w-0">
                                            <p className="font-medium text-foreground text-sm truncate">{job.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {job.company} - {job.country}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.is_published !== false
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {job.is_published !== false ? 'منشور' : 'مسودة'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{formatDate(job.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                            {jobs.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">لا توجد وظائف بعد</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Quick Stats Footer ─── */}
            <div className="bg-gradient-to-l from-primary/5 via-card to-primary/5 rounded-2xl p-5 lg:p-6 border border-primary/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">نظرة سريعة</h2>
                        <p className="text-xs text-muted-foreground">ملخص عام للمنصة</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="text-center p-3 rounded-xl bg-card border border-border">
                        <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">وظيفة</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-card border border-border">
                        <p className="text-2xl font-bold text-foreground">{blogPosts.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">مقال</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-card border border-border">
                        <p className="text-2xl font-bold text-foreground">{countryAnalytics.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">دولة</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-card border border-border">
                        <p className="text-2xl font-bold text-blue-500">{(analyticsSummary?.total_views || 0).toLocaleString("ar-SA")}</p>
                        <p className="text-xs text-muted-foreground mt-1">مشاهدة كلية</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-card border border-border">
                        <p className="text-2xl font-bold text-emerald-500">{(analyticsSummary?.total_clicks || 0).toLocaleString("ar-SA")}</p>
                        <p className="text-xs text-muted-foreground mt-1">نقرة كلية</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-card border border-border">
                        <p className="text-2xl font-bold text-primary">{totalConversionRate.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground mt-1">تحويل عام</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
