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

interface SEOScore {
  score: number;
  issues: string[];
  warnings: string[];
}

const SEOBar = ({ title, description, slug = "", focus_keyword = "", onChange }: SEOBarProps) => {
  const [focusKeyword, setFocusKeyword] = useState(focus_keyword);
  const [seoScore, setSeoScore] = useState<SEOScore>({ score: 0, issues: [], warnings: [] });

  // Calculate SEO score
  const calculateSEOScore = () => {
    const issues: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    // Title checks
    if (title.length === 0) {
      issues.push("Add a title");
    } else {
      score += 15;
      if (title.length < 30) {
        warnings.push("Title is too short (min 30 characters)");
      } else if (title.length > 60) {
        warnings.push("Title is too long (max 60 characters)");
      } else {
        score += 5;
      }

      // Keyword in title
      if (focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase())) {
        score += 10;
      }
    }

    // Meta description checks
    if (description.length === 0) {
      issues.push("Add a meta description");
    } else {
      score += 15;
      if (description.length < 120) {
        warnings.push("Meta description is too short (min 120 characters)");
      } else if (description.length > 160) {
        warnings.push("Meta description is too long (max 160 characters)");
      } else {
        score += 5;
      }

      // Keyword in description
      if (focusKeyword && description.toLowerCase().includes(focusKeyword.toLowerCase())) {
        score += 10;
      }
    }

    // Focus keyword checks
    if (focusKeyword.trim() === "") {
      warnings.push("Consider adding a focus keyword");
    } else {
      score += 10;
      if (focusKeyword.split(" ").length > 3) {
        warnings.push("Focus keyword is too long (max 3 words)");
      }
    }

    // Slug checks
    if (slug.trim() === "") {
      warnings.push("Add a URL slug for better SEO");
    } else {
      score += 10;
    }

    // Content length (rough check based on description)
    if (description.length > 300) {
      score += 10;
    }

    setSeoScore({ score: Math.min(score, 100), issues, warnings });
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

      {/* Issues */}
      {seoScore.issues.length > 0 && (
        <div className="mb-4 p-3 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
          <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">Issues:</h4>
          <ul className="text-xs text-red-600 dark:text-red-300 space-y-1">
            {seoScore.issues.map((issue, i) => (
              <li key={i} className="flex gap-2">
                <span>•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {seoScore.warnings.length > 0 && (
        <div className="mb-4 p-3 rounded bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800">
          <h4 className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Tips:</h4>
          <ul className="text-xs text-yellow-600 dark:text-yellow-300 space-y-1">
            {seoScore.warnings.map((warning, i) => (
              <li key={i} className="flex gap-2">
                <span>•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
