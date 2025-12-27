import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireEmployee?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false, requireEmployee = false }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin, isEmployee } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted" dir="rtl">
        <div className="text-center p-8 bg-card rounded-xl border border-border max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">غير مصرح</h1>
          <p className="text-muted-foreground mb-6">
            ليس لديك صلاحية الوصول إلى هذه الصفحة. يجب أن تكون مديراً.
          </p>
          <a href="/" className="btn-primary inline-block">
            العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    );
  }

  if (requireEmployee && !isEmployee && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted" dir="rtl">
        <div className="text-center p-8 bg-card rounded-xl border border-border max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">غير مصرح</h1>
          <p className="text-muted-foreground mb-6">
            ليس لديك صلاحية الوصول إلى هذه الصفحة. يجب أن تكون موظفاً.
          </p>
          <a href="/" className="btn-primary inline-block">
            العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
