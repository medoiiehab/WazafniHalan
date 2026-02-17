import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, Mail, Lock, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import AdSense from '@/components/common/AdSense';

const emailSchema = z.string().trim().email('البريد الإلكتروني غير صالح').max(255, 'البريد الإلكتروني طويل جداً');
const passwordSchema = z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل').max(72, 'كلمة المرور طويلة جداً');

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const { user, isLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/admin');
    }
  }, [user, isLoading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (isSignUp && password !== confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'خطأ في التسجيل',
              description: 'هذا البريد الإلكتروني مسجل بالفعل',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'خطأ',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'تم التسجيل بنجاح',
            description: 'يمكنك الآن تسجيل الدخول',
          });
          setIsSignUp(false);
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'خطأ في تسجيل الدخول',
              description: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'خطأ',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'تم تسجيل الدخول بنجاح',
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-mesh relative overflow-hidden" dir="rtl">
      {/* Background Abstract Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Helmet>
        <title>{isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'} | وظفني حالاً</title>
        <link rel="canonical" href={`https://www.wazafnihalan.com${isSignUp ? '/auth?signup=true' : '/auth'}`} />
      </Helmet>

      {/* AdSense 1 - Top */}
      <div className="py-4 relative z-10">
        <AdSense size="leaderboard" />
      </div>

      {/* AdSense 2 - Banner */}
      <div className="py-4 relative z-10">
        <AdSense size="banner" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* AdSense 3 - Before Form */}
          <AdSense size="inline" className="mb-6" />

          <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
                {isSignUp ? (
                  <UserPlus className="w-8 h-8 text-primary" />
                ) : (
                  <LogIn className="w-8 h-8 text-primary" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
              </h1>
              <p className="text-foreground">
                {isSignUp ? 'أنشئ حسابك للوصول إلى الميزات الكاملة' : 'أدخل بياناتك للوصول إلى حسابك'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`input-field pr-10 ${errors.email ? 'border-destructive' : ''}`}
                    placeholder="example@email.com"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground" />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`input-field pr-10 pl-10 ${errors.password ? 'border-destructive' : ''}`}
                    placeholder="••••••••"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`input-field pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                      placeholder="••••••••"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground" />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-primary hover:underline text-sm"
              >
                {isSignUp ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
              </button>
            </div>
          </div>

          {/* AdSense 4 - After Form */}
          <AdSense size="rectangle" className="mt-6 mx-auto" />

          <p className="text-center text-foreground text-sm mt-4">
            <a href="/" className="hover:text-primary transition-colors">
              ← العودة للصفحة الرئيسية
            </a>
          </p>

          {/* AdSense 5 - Bottom */}
          <AdSense size="inline" className="mt-6" />
        </div>
      </div>

      {/* AdSense 6 - Side Left */}
      <div className="hidden xl:block fixed left-4 top-1/4">
        <AdSense size="rectangle" />
      </div>

      {/* AdSense 7 - Side Right */}
      <div className="hidden xl:block fixed right-4 top-1/4">
        <AdSense size="rectangle" />
      </div>

      {/* AdSense 8 - Before Footer */}
      <div className="py-4">
        <AdSense size="leaderboard" />
      </div>

      {/* AdSense 9 - Large Rectangle */}
      <div className="py-4">
        <AdSense size="large-rectangle" className="mx-auto" />
      </div>

      {/* AdSense 10 - Extra Banner */}
      <div className="py-4">
        <AdSense size="banner" />
      </div>
    </div>
  );
};

export default Auth;
