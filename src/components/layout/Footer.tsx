import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, Folder, Globe, Search, ShieldCheck } from 'lucide-react';
import { countries } from '@/types/database';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-16 border-t-4 border-primary">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Briefcase className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-black tracking-tight">وظفني حالاً</span>
            </div>
            <p className="text-background/70 text-base leading-relaxed">
              المنصة العربية الأولى المتخصصة في تجميع ونشر أفضل فرص الوظائف الشاغرة في دول الخليج ومصر. نسعى لتطوير سوق العمل العربي وتسهيل التواصل بين الشركات والباحثين عن عمل.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>منصة موثوقة</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>تغطية إقليمية</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              روابط سريعة
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-background/70 hover:text-primary hover:translate-x-[-4px] transition-all inline-block flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/all-jobs" className="text-background/70 hover:text-primary hover:translate-x-[-4px] transition-all inline-block flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  البحث عن وظيفة
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-background/70 hover:text-primary hover:translate-x-[-4px] transition-all inline-block flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  مدونة التوظيف
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-background/70 hover:text-primary hover:translate-x-[-4px] transition-all inline-block flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/70 hover:text-primary hover:translate-x-[-4px] transition-all inline-block flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Countries */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              وظائف حسب الدولة
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {countries.map((country) => (
                <Link
                  key={country.slug}
                  to={`/jobs/${country.slug}`}
                  className="text-background/70 hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="grayscale group-hover:grayscale-0 transition-all">{country.flag}</span>
                  <span>وظائف {country.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              تواصل معنا
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 text-background/70 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-white mb-1">البريد الإلكتروني</p>
                  <a href="mailto:Wazafnihalan@gmail.com" className="hover:text-primary">Wazafnihalan@gmail.com</a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-background/70 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-white mb-1">المقر الرئيسي</p>
                  <span>دولة الإمارات العربية المتحدة</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-background/40 text-sm font-medium">
            © {new Date().getFullYear()} وظفني حالاً. جميع الحقوق محفوظة. تم التطوير بكل ❤️ لخدمة الشباب العربي.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-background/50 hover:text-white transition-colors text-sm font-medium">
              سياسة الخصوصية
            </Link>
            <Link to="/terms" className="text-background/50 hover:text-white transition-colors text-sm font-medium">
              الشروط والأحكام
            </Link>
            <div className="flex items-center gap-4 border-r border-background/10 pr-6">
              <Globe className="w-4 h-4 text-background/30" />
              <span className="text-background/30 text-xs uppercase font-bold tracking-widest leading-none">AR / EN</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
