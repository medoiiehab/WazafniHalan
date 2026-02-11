import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

interface SEOBarProps {
  title: string;
  description: string;
  slug?: string;
  focus_keyword?: string;
  onChange?: (seoData: SEOData) => void;
}

export interface SEOData {
  focus_keyword: string;
  meta_description: string;
  slug: string;
}

interface SEOIssue {
  type: 'critical' | 'warning' | 'good';
  message: string;
}

interface SEOScore {
  score: number;
  details: SEOIssue[];
}

const SEOBar = ({ title, description, slug = "", focus_keyword = "", onChange }: SEOBarProps) => {
  const [focusKeyword, setFocusKeyword] = useState(focus_keyword);
  const [seoScore, setSeoScore] = useState<SEOScore>({ score: 0, details: [] });

  // Calculate SEO score
  const calculateSEOScore = () => {
    let score = 0;
    const details: SEOIssue[] = [];

    // 1. Title Analysis (Max 20 points)
    if (!title) {
      details.push({ type: 'critical', message: 'Add a title to content' });
    } else {
      if (title.length >= 30 && title.length <= 60) {
        score += 20;
        details.push({ type: 'good', message: 'Title length is optimal (30-60 chars)' });
      } else if (title.length < 30) {
        score += 10;
        details.push({ type: 'warning', message: 'Title is too short (min 30 chars)' });
      } else {
        score += 10;
        details.push({ type: 'warning', message: 'Title is too long (max 60 chars)' });
      }

      if (focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase())) {
        score += 10; // Extra points for keyword in title
        details.push({ type: 'good', message: 'Focus keyword appears in title' });
      } else if (focusKeyword) {
        details.push({ type: 'warning', message: 'Focus keyword should appear in title' });
      }
    }

    // 2. Meta Description Analysis (Max 20 points)
    if (!description) {
      details.push({ type: 'critical', message: 'Add a meta description' });
    } else {
      if (description.length >= 120 && description.length <= 160) {
        score += 20;
        details.push({ type: 'good', message: 'Meta description length is optimal (120-160 chars)' });
      } else if (description.length < 120) {
        score += 10;
        details.push({ type: 'warning', message: 'Meta description is too short (min 120 chars)' });
      } else {
        score += 10;
        details.push({ type: 'warning', message: 'Meta description is too long (max 160 chars)' });
      }

      if (focusKeyword && description.toLowerCase().includes(focusKeyword.toLowerCase())) {
        score += 10; // Extra points for keyword
        details.push({ type: 'good', message: 'Focus keyword appears in meta description' });
      } else if (focusKeyword) {
        details.push({ type: 'warning', message: 'Focus keyword should appear in meta description' });
      }
    }

    // 3. Slug Analysis (Max 10 points)
    if (!slug) {
      details.push({ type: 'critical', message: 'Add a URL slug' });
    } else {
      if (/^[a-z0-9-]+$/.test(slug)) {
        score += 10;
        details.push({ type: 'good', message: 'URL slug format is correct' });
      } else {
        details.push({ type: 'warning', message: 'Slug should only contain lowercase letters, numbers, and hyphens' });
      }
    }

    // 4. Focus Keyword Analysis (Max 10 points)
    if (!focusKeyword) {
      details.push({ type: 'warning', message: 'Set a focus keyword to improve ranking analysis' });
    } else {
      score += 10;
      details.push({ type: 'good', message: 'Focus keyword is set' });
    }

    // Cap score at 100
    setSeoScore({ score: Math.min(score, 100), details });
  };

  useEffect(() => {
    calculateSEOScore();
  }, [title, description, focusKeyword, slug]);

  useEffect(() => {
    if (onChange) {
      onChange({
        focus_keyword: focusKeyword,
        meta_description: description,
        slug: slug,
      });
    }
  }, [focusKeyword, description, slug, onChange]);

  const getScoreColor = () => {
    if (seoScore.score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (seoScore.score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  const getScoreBorderColor = () => {
    if (seoScore.score >= 80) return "border-green-300 dark:border-green-700";
    if (seoScore.score >= 60) return "border-yellow-300 dark:border-yellow-700";
    return "border-red-300 dark:border-red-700";
  };

  const getScoreIcon = () => {
    if (seoScore.score >= 80) {
      return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
    if (seoScore.score >= 60) {
      return <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    }
    return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
  };

  return (
    <div className={`border-l-4 p-4 rounded ${getScoreColor()} ${getScoreBorderColor()}`}>
      {/* Header with score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getScoreIcon()}
          <div>
            <h3 className="font-semibold text-foreground">SEO Preview</h3>
            <p className="text-xs text-muted-foreground">
              SEO Score: <span className="font-bold">{seoScore.score}/100</span>
            </p>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-sm"
          style={{
            borderColor: seoScore.score >= 80 ? '#16a34a' : seoScore.score >= 60 ? '#eab308' : '#dc2626',
            color: seoScore.score >= 80 ? '#16a34a' : seoScore.score >= 60 ? '#ca8a04' : '#b91c1c'
          }}>
          {seoScore.score}
        </div>
      </div>

      {/* Focus Keyword Input */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-foreground mb-2">Focus Keyword</label>
        <input
          type="text"
          value={focusKeyword}
          onChange={(e) => setFocusKeyword(e.target.value)}
          placeholder="Enter your focus keyword (e.g., 'remote job')"
          className="w-full px-3 py-2 text-sm rounded border border-border bg-background text-foreground"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Used in title and description for better SEO
        </p>
      </div>

      {/* Analysis Details */}
      <div className="space-y-3">
        {['critical', 'warning', 'good'].map((type) => {
          const items = seoScore.details.filter(d => d.type === type);
          if (items.length === 0) return null;

          let colorClass = '';
          let bgClass = '';
          let title = '';

          switch (type) {
            case 'critical':
              colorClass = 'text-red-600 dark:text-red-400';
              bgClass = 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900';
              title = 'Critical Issues';
              break;
            case 'warning':
              colorClass = 'text-yellow-600 dark:text-yellow-400';
              bgClass = 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-100 dark:border-yellow-900';
              title = 'Improvements';
              break;
            case 'good':
              colorClass = 'text-green-600 dark:text-green-400';
              bgClass = 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900';
              title = 'Good Results';
              break;
          }

          return (
            <div key={type} className={`p-3 rounded border ${bgClass}`}>
              <h4 className={`text-xs font-bold mb-2 ${colorClass}`}>{title}</h4>
              <ul className="space-y-1">
                {items.map((item, i) => (
                  <li key={i} className={`text-xs flex gap-2 ${colorClass}`}>
                    <span>•</span>
                    <span>{item.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Preview Section */}
      <div className="mt-4 p-3 rounded bg-background border border-border">
        <h4 className="text-xs font-semibold text-foreground mb-2">Search Preview:</h4>
        <div className="text-sm">
          <p className="text-blue-600 dark:text-blue-400 text-xs mb-1">
            {slug || "example"}.com › {title.substring(0, 40)}
          </p>
          <h2 className="text-foreground font-medium text-sm mb-1 line-clamp-2">
            {title || "Your page title"}
          </h2>
          <p className="text-muted-foreground text-xs line-clamp-2">
            {description || "Your meta description will appear here"}
          </p>
        </div>
      </div>

      {/* Character Count */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div className="p-2 rounded bg-background border border-border">
          <p className="text-muted-foreground mb-1">Title Length</p>
          <p className="font-bold text-foreground">{title.length}/60</p>
        </div>
        <div className="p-2 rounded bg-background border border-border">
          <p className="text-muted-foreground mb-1">Meta Length</p>
          <p className="font-bold text-foreground">{description.length}/160</p>
        </div>
        <div className="p-2 rounded bg-background border border-border">
          <p className="text-muted-foreground mb-1">Score</p>
          <p className="font-bold text-foreground">{seoScore.score}%</p>
        </div>
      </div>
    </div>
  );
};

export default SEOBar;
