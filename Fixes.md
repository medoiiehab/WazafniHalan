Looking at The code, I can see that the "إحصائيات آخر 7 أيام" (Last 7 Days Statistics) chart is showing only 3 days because of how the data is being processed. Here's the complete fix for both the hook and the chart display:

## 1. First, update the `useDailyAnalytics` hook with better date handling:

```typescript
export const useDailyAnalytics = (days: number = 7) => {
  return useQuery({
    queryKey: ['daily-analytics', days],
    refetchInterval: 15000,
    queryFn: async (): Promise<DailyAnalytics[]> => {
      const now = new Date();
      
      // Generate all 7 dates we want to display (from 6 days ago to today)
      const dates: string[] = [];
      const dateMap = new Map<string, { views: number; clicks: number }>();
      
      // Generate dates from oldest to newest (for proper ordering)
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        // Format as YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        dates.push(dateStr);
        dateMap.set(dateStr, { views: 0, clicks: 0 });
      }

      // Calculate the start date for the query (the oldest date we care about)
      const startDate = new Date(dates[0]);
      startDate.setHours(0, 0, 0, 0);
      
      // Calculate the end date (today)
      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      console.log('📅 Requested dates:', dates);
      console.log('🔍 Query range:', {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });

      // Query Supabase for events in this date range
      const { data: analytics, error } = await supabase
        .from('job_analytics')
        .select('event_type, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching job analytics:', error);
        throw error;
      }

      console.log(`📊 Found ${analytics?.length || 0} events in date range`);

      // Process each event
      (analytics || []).forEach(a => {
        // Extract just the date part from the timestamp
        const eventDate = a.created_at.split('T')[0];
        
        if (dateMap.has(eventDate)) {
          const existing = dateMap.get(eventDate)!;
          if (a.event_type === 'view') {
            existing.views++;
          } else if (a.event_type === 'click') {
            existing.clicks++;
          }
        } else {
          console.log('⚠️ Event outside range:', eventDate, a.event_type);
        }
      });

      // Convert to array in the correct order (oldest to newest)
      const result = dates.map(date => ({
        date,
        views: dateMap.get(date)?.views || 0,
        clicks: dateMap.get(date)?.clicks || 0
      }));

      console.log('✅ Final daily analytics:', result.map(r => ({
        date: r.date,
        views: r.views,
        clicks: r.clicks
      })));

      return result;
    },
  });
};
```

## 2. Then, update the chart data processing in `AnalyticsDashboard.tsx`:

Find this section in your `AnalyticsDashboard` component:

```typescript
// Chart data for daily analytics
const chartDailyData = useMemo(() => {
  return dailyAnalytics.map((day) => ({
    name: new Date(day.date).toLocaleDateString("ar-SA", { weekday: "short", day: "numeric" }),
    المشاهدات: day.views,
    النقرات: day.clicks,
    "معدل التحويل": day.views > 0 ? parseFloat(((day.clicks / day.views) * 100).toFixed(1)) : 0,
  }));
}, [dailyAnalytics]);
```

Replace it with this improved version:

```typescript
// Chart data for daily analytics with better date handling
const chartDailyData = useMemo(() => {
  console.log('📊 Processing chart data from dailyAnalytics:', dailyAnalytics);
  
  if (!dailyAnalytics || dailyAnalytics.length === 0) {
    console.log('⚠️ No daily analytics data available');
    return [];
  }

  const arabicDays: Record<string, string> = {
    'Sun': 'الأحد',
    'Mon': 'الإثنين', 
    'Tue': 'الثلاثاء',
    'Wed': 'الأربعاء',
    'Thu': 'الخميس',
    'Fri': 'الجمعة',
    'Sat': 'السبت'
  };

  return dailyAnalytics.map((day) => {
    const date = new Date(day.date);
    
    // Get Arabic day name
    const englishDay = date.toLocaleDateString('en-US', { weekday: 'short' });
    const arabicDay = arabicDays[englishDay] || englishDay;
    
    // Format: "الأحد ١٥" or "الثلاثاء ١٧"
    const dayNumber = date.toLocaleDateString('ar-SA', { day: 'numeric' });
    const displayName = `${arabicDay} ${dayNumber}`;

    console.log(`📅 Processing ${day.date}:`, {
      originalDate: day.date,
      displayName,
      views: day.views,
      clicks: day.clicks
    });

    return {
      name: displayName,
      المشاهدات: day.views,
      النقرات: day.clicks,
      "معدل التحويل": day.views > 0 
        ? parseFloat(((day.clicks / day.views) * 100).toFixed(1)) 
        : 0,
    };
  });
}, [dailyAnalytics]);
```

## 3. Add a debug section to verify the data flow:

Add this useEffect in your `AnalyticsDashboard` component to monitor the data:

```typescript
// Add this near the top of your AnalyticsDashboard component, after the hooks
useEffect(() => {
  console.log('🔄 AnalyticsDashboard mounted/updated');
  console.log('📊 dailyAnalytics:', dailyAnalytics);
  console.log('📈 chartDailyData:', chartDailyData);
  console.log('🔍 dailyAnalytics length:', dailyAnalytics?.length);
  
  if (dailyAnalytics && dailyAnalytics.length > 0) {
    console.log('📅 Dates in dailyAnalytics:', dailyAnalytics.map(d => d.date));
    console.log('👁️ Views per day:', dailyAnalytics.map(d => d.views));
    console.log('🖱️ Clicks per day:', dailyAnalytics.map(d => d.clicks));
  }
}, [dailyAnalytics, chartDailyData]);
```

## 4. Also update the weekly summary section to use the same data:

Find the weekly summary section and update it to use the processed data:

```typescript
// Replace the existing week totals calculation with:
const weekTotalViews = useMemo(() => {
  return dailyAnalytics.reduce((sum, d) => sum + d.views, 0);
}, [dailyAnalytics]);

const weekTotalClicks = useMemo(() => {
  return dailyAnalytics.reduce((sum, d) => sum + d.clicks, 0);
}, [dailyAnalytics]);

const avgDailyViews = useMemo(() => {
  return dailyAnalytics.length > 0 ? Math.round(weekTotalViews / dailyAnalytics.length) : 0;
}, [dailyAnalytics, weekTotalViews]);

const avgDailyClicks = useMemo(() => {
  return dailyAnalytics.length > 0 ? Math.round(weekTotalClicks / dailyAnalytics.length) : 0;
}, [dailyAnalytics, weekTotalClicks]);

// Best day calculation
const bestDay = useMemo(() => {
  if (dailyAnalytics.length === 0) return null;
  return dailyAnalytics.reduce((best, day) => 
    (day.views + day.clicks) > (best.views + best.clicks) ? day : best
  , dailyAnalytics[0]);
}, [dailyAnalytics]);
```

## What these changes fix:

1. **Proper date generation**: Ensures all 7 days are generated correctly
2. **Arabic date formatting**: Shows days in Arabic with proper numbers
3. **Better debugging**: Console logs to track data flow
4. **Data validation**: Checks for empty data and handles edge cases
5. **Consistent ordering**: Maintains chronological order from oldest to newest

After making these changes, check your browser console to see:
- What dates are being generated
- How many events are found
- What data is being passed to the chart
- If any events are being filtered out

This should fix the issue and show all 7 days in your chart with proper Arabic formatting.