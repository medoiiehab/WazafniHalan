import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { categories, countries } from '@/data/jobs';
import AdSense from './AdSense';

interface SidebarProps {
  showSearch?: boolean;
}

const Sidebar = ({ showSearch = true }: SidebarProps) => {
  return (
    <aside className="space-y-6">
      {/* Search Box */}
      {showSearch && (
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">البحث عن وظيفة</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن وظيفة..."
              className="input-field pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">التصنيفات</h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category}>
              <Link
                to={`/category/${encodeURIComponent(category)}`}
                className="block py-2 px-3 rounded-lg text-foreground hover:bg-accent hover:text-foreground transition-colors text-sm font-medium"
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* AdSense */}
      <AdSense size="rectangle" placement="sidebar" />

      {/* Countries */}
      <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">الدول</h3>
        <ul className="space-y-2">
          {countries.map((country) => (
            <li key={country.slug}>
              <Link
                to={`/jobs/${country.slug}`}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-foreground hover:bg-accent hover:text-foreground transition-colors text-sm font-medium"
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span className="mr-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                  {country.jobCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
