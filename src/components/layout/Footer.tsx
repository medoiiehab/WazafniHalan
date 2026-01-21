import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, Folder } from 'lucide-react';
import { countries } from '@/types/database';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">وظفني حالاً</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              منصة رائدة للبحث عن الوظائف في دول الخليج العربي ومصر. نوفر لك أحدث الفرص الوظيفية من أفضل الشركات.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-background/70 hover:text-primary transition-colors text-sm">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-background/70 hover:text-primary transition-colors text-sm">
                  المدونة
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-background/70 hover:text-primary transition-colors text-sm">
                  من نحن
                </Link>
              </li>
            </ul>
          </div>



          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-background/70 text-sm">
                <Mail className="w-4 h-4" />
                <span>Wazafnihalan@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-background/70 text-sm">
                <Folder className="w-4 h-4" />
                <span>Jobs For All</span>
              </li>
              <li className="flex items-center gap-2 text-background/70 text-sm">
                <MapPin className="w-4 h-4" />
                <span>الإمارات</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} وظفني حالاً. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-background/50 hover:text-primary transition-colors text-sm">
              سياسة الخصوصية
            </Link>
            <Link to="/terms" className="text-background/50 hover:text-primary transition-colors text-sm">
              الشروط والأحكام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
