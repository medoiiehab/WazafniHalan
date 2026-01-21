import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Home, Briefcase, BookOpen, Settings, UserCog, Newspaper, MailQuestion, Factory } from 'lucide-react';
import { countries } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isEmployee, signOut } = useAuth();

  const navItems = [
    { name: 'الرئيسية', path: '/', icon: Home },
    { name: 'نصائح الوظيفة', path: '/blog', icon: BookOpen },
    { name: 'سياسات الخصوصية', path: '/privacy', icon: Factory },
    { name: 'جميع الوظائف', path: '/all-jobs', icon: Briefcase },
    { name: 'عنا', path: '/about', icon: MailQuestion },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <>
      <header className="bg-card sticky top-0 z-50 border-b border-border shadow-sm">
        <div className="container-custom">
          <div className="flex items-center justify-between h-[70px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img src={logo} alt="وظفني حالاً" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
              <span className="text-xl font-bold text-foreground">وظفني حالاً</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link px-3 py-2 rounded-lg hover:bg-accent ${isActive(item.path) ? 'active bg-accent' : ''
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="btn-primary text-sm">
                      لوحة التحكم
                    </Link>
                  )}
                  {isEmployee && !isAdmin && (
                    <Link to="/employee" className="btn-primary text-sm">
                      لوحة الموظف
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    خروج
                  </button>
                </>
              ) : null}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 rounded-xl hover:bg-accent active:scale-95 transition-all"
              aria-label="القائمة"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Full Screen Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[70px] bg-background/95 backdrop-blur-sm z-50 animate-fade-in">
            <nav className="container-custom py-6 flex flex-col gap-2 h-full overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg font-medium transition-all active:scale-[0.98] ${isActive(item.path)
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'hover:bg-accent'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}

              <div className="border-t border-border my-4" />

              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 px-5 py-4 rounded-xl text-lg font-medium bg-primary text-primary-foreground shadow-lg active:scale-[0.98] transition-all"
                    >
                      <Settings className="w-5 h-5" />
                      لوحة التحكم
                    </Link>
                  )}
                  {isEmployee && !isAdmin && (
                    <Link
                      to="/employee"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 px-5 py-4 rounded-xl text-lg font-medium bg-primary text-primary-foreground shadow-lg active:scale-[0.98] transition-all"
                    >
                      <UserCog className="w-5 h-5" />
                      لوحة الموظف
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-5 py-4 rounded-xl text-lg font-medium text-destructive hover:bg-destructive/10 active:scale-[0.98] transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    تسجيل الخروج
                  </button>
                </>
              ) : null}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
