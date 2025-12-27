import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import AdSense from '@/components/common/AdSense';

const StaticPages = () => {
  const location = useLocation();
  const path = location.pathname;

  const pages: Record<string, { title: string; content: React.ReactNode }> = {
    '/about': {
      title: 'من نحن',
      content: (
        <div className="prose max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            وظفني حالاً هي منصة رائدة للبحث عن الوظائف في دول الخليج العربي ومصر. نهدف إلى ربط
            الباحثين عن عمل بأفضل الفرص الوظيفية في المنطقة.
          </p>
          <h2 className="text-xl font-bold text-foreground mb-4">رؤيتنا</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            أن نكون المنصة الأولى والأكثر موثوقية للبحث عن الوظائف في منطقة الخليج العربي.
          </p>
          <h2 className="text-xl font-bold text-foreground mb-4">رسالتنا</h2>
          <p className="text-muted-foreground leading-relaxed">
            تسهيل عملية البحث عن الوظائف وتوفير فرص عمل متميزة للباحثين عن عمل في مختلف
            المجالات والتخصصات.
          </p>
        </div>
      ),
    },
    '/privacy': {
      title: 'سياسة الخصوصية',
      content: (
        <div className="prose max-w-none text-muted-foreground">
          <p className="mb-4">
            نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع
            واستخدام وحماية معلوماتك.
          </p>
          <h2 className="text-xl font-bold text-foreground mb-4 mt-8">جمع المعلومات</h2>
          <p className="mb-4">
            نجمع المعلومات التي تقدمها لنا طوعاً عند التسجيل أو التقديم على الوظائف.
          </p>
          <h2 className="text-xl font-bold text-foreground mb-4 mt-8">استخدام المعلومات</h2>
          <p className="mb-4">
            نستخدم معلوماتك لتحسين خدماتنا وتوفير تجربة أفضل للبحث عن الوظائف.
          </p>
          <h2 className="text-xl font-bold text-foreground mb-4 mt-8">حماية البيانات</h2>
          <p>
            نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به.
          </p>
        </div>
      ),
    },
    '/terms': {
      title: 'الشروط والأحكام',
      content: (
        <div className="prose max-w-none text-muted-foreground">
          <h2 className="text-xl font-bold text-foreground mb-4">الشروط والأحكام – موقع وظفني حالاً</h2>
          <p className="mb-4 leading-relaxed">
            إن استخدامكم لموقع وظفني حالاً يعني موافقتكم الكاملة على جميع الشروط والأحكام والسياسات الموضحة أدناه، والتي تُعتبر سارية ابتداءً من لحظة دخولكم أو استخدامكم للموقع. ويحتفظ موقع وظفني حالاً بالحق في تعديل أو تحديث الشروط والأحكام في أي وقت يراه مناسباً.
          </p>
          <p className="mb-4 leading-relaxed">
            ويقع على عاتقكم متابعة الصفحة المخصصة للشروط بشكل دوري للاطلاع على أي تحديثات أو تغييرات. ويُعد استمراركم في استخدام الموقع قبولاً صريحاً بالصيغة المحدثة من الاتفاقية. وفي حال عدم موافقتكم على أي من الشروط، يجب الامتناع فوراً عن استخدام الموقع أو تطبيقاته أو أي من خدماته.
          </p>

          <h2 className="text-xl font-bold text-foreground mb-4 mt-8">الشعارات (Logos)</h2>
          <p className="mb-4 leading-relaxed">
            جميع الشعارات والصور الخاصة بالجهات والشركات هي ملكية حصرية لأصحابها فقط، ولا يتحمل موقع وظفني حالاً أي مسؤولية قانونية تجاه استخدامها، حيث تُعرض فقط لتسهيل وصول المعلومة للقارئ.
          </p>
          <p className="mb-4 leading-relaxed">
            وفي حال اعتراض أي جهة على استخدام شعارها أو صورتها، يمكنها مراسلتنا عبر بريدها الإلكتروني الرسمي إلى: <a href="mailto:info@wazfni-now.com" className="text-primary hover:underline" dir="ltr">info@wazfni-now.com</a>
          </p>
          <p className="mb-4 leading-relaxed">
            وسيتم إزالة الشعار أو الصورة عند الحاجة، مع توضيح سبب الاعتراض إن أمكن.
          </p>

          <h2 className="text-xl font-bold text-foreground mb-4 mt-8">الروابط الخارجية</h2>
          <p className="mb-4 leading-relaxed">
            قد يحتوي موقع وظفني حالاً على روابط تؤدي إلى مواقع خارجية. هذه الروابط لا تقع تحت مسؤوليتنا ولا نتحكم بمحتواها ولا نضمن صحة ما تقدمه تلك المواقع. وجود أي رابط خارجي لا يعني اعتماد موقع وظفني حالاً لمحتوى الموقع الآخر، ويُدرج الرابط فقط بهدف تسهيل الوصول.
          </p>

          <h2 className="text-xl font-bold text-foreground mb-4 mt-8">الحقوق الفكرية</h2>
          <p className="mb-4 leading-relaxed">
            محتوى موقع وظفني حالاً محمي بموجب حقوق الملكية الفكرية. لا يُسمح بنسخ أو إعادة نشر أو تحميل أو توزيع أو نقل أي من المعلومات الواردة في الموقع إلا للاستخدام الشخصي غير التجاري. أي استخدام آخر يستوجب الحصول على موافقة خطية مسبقة من إدارة الموقع. كما يُطلب منكم الامتناع عن إجراء أي تعديل أو اقتباس للمحتوى إلا في نطاق الاستخدام الشخصي.
          </p>

          <h2 className="text-xl font-bold text-foreground mb-4 mt-8">شروط الاستخدام</h2>
          <p className="mb-4 leading-relaxed">
            باستمراركم في تصفح موقع وظفني حالاً، فإنكم توافقون على البنود التالية:
          </p>
          <ul className="list-disc pr-6 mb-4 space-y-2">
            <li>لا يضمن الموقع دقة المعلومات الواردة في إعلانات الوظائف أو النتائج.</li>
            <li>كل جهة وظيفية تتحمل مسؤولية الإعلانات التي تنشرها، ولا يتحمل موقع وظفني حالاً أي مسؤولية عنها.</li>
            <li>قد لا يتم إدراج جميع الوظائف، وقد يتم حذف أو إيقاف بعض المحتويات دون إشعار مسبق.</li>
            <li>المستخدم مسؤول عن إرسال وثائقه وسيرته الذاتية للجهات المعلنة، ولا يتحمل الموقع أي مسؤولية عن ذلك.</li>
            <li>الموقع يعمل كدليل وظيفي فقط ولا يمتلك أي سلطة على الوظائف أو القرارات المتعلقة بها.</li>
            <li>يحق للموقع استخدام بيانات المستخدمين في أي وقت، كما يحق له إيقاف أي خدمة أو ميزة دون سابق إنذار.</li>
            <li>يحق للموقع حذف أي إعلان وظيفي بعد مرور أسبوعين أو حسب ما تقتضيه الحاجة.</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mb-4 mt-8">التعليقات</h2>
          <p className="mb-4 leading-relaxed">
            المستخدم مسؤول بالكامل عن تعليقه، ويخضع كل تعليق للمراجعة والموافقة أو الرفض من إدارة الموقع دون إلزام بذكر الأسباب. ويُمنع تماماً تضمين التعليق أي من النقاط التالية:
          </p>
          <ul className="list-disc pr-6 mb-4 space-y-2">
            <li>محتوى ترويجي</li>
            <li>إساءات أو شتائم</li>
            <li>تهديدات أو هجمات شخصية</li>
            <li>تعصب أو تمييز أو كراهية</li>
            <li>أي محتوى يحض على الكراهية</li>
            <li>ألفاظ بذيئة أو مبتذلة</li>
            <li>مواد إباحية</li>
            <li>إرسال بريد مؤذٍ</li>
            <li>مواد محمية بحقوق نشر</li>
            <li>انتحال شخصية أي فرد أو جهة</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mb-4 mt-8">الإشعارات (Push Notifications)</h2>
          <p className="mb-4 leading-relaxed">
            لا يحدد موقع وظفني حالاً عدد أو نوعية أو توقيت الإشعارات المرسلة للمستخدمين، وقد يتم إيقاف الخدمة أو تقليلها أو تغيير محتواها في أي وقت دون تنبيه. كما قد تتضمن الإشعارات محتوىً إعلانياً أو ترويجياً.
          </p>
          <p className="leading-relaxed">
            ولا يضمن الموقع وصول الإشعارات لجميع المستخدمين، ولا يُعتمد عليها كوسيلة رئيسية لمتابعة الأخبار. المستخدم هو المسؤول عن تفعيل أو إيقاف الإشعارات من خلال إعدادات جهازه أو المنصة التي يستخدمها.
          </p>
        </div>
      ),
    },
  };

  const page = pages[path];

  if (!page) {
    return null;
  }

  return (
    <Layout>
      <Helmet>
        <title>{page.title} | وظفني حالاً</title>
        <meta name="description" content={`${page.title} - موقع وظفني حالاً للبحث عن الوظائف في الخليج العربي ومصر`} />
        <link rel="canonical" href={`https://wazfni-now.com${path}`} />
      </Helmet>

      {/* AdSense 1 - Top Leaderboard */}
      <div className="py-4 bg-muted">
        <AdSense size="leaderboard" placement="home_top" />
      </div>

      {/* AdSense 2 - Banner */}
      <div className="py-4">
        <AdSense size="banner" placement="home_banner_1" />
      </div>

      <div className="container-custom py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 max-w-3xl">
            {/* AdSense 3 - Before Title */}
            <AdSense size="inline" className="mb-6" placement="home_mid_content_1" />

            <h1 className="text-3xl font-bold text-foreground mb-8">{page.title}</h1>

            {/* AdSense 4 - After Title */}
            <AdSense size="rectangle" className="mb-6 mx-auto" placement="home_after_featured" />

            <div className="bg-card rounded-xl p-6 md:p-8 border border-border">
              {page.content}
            </div>

            {/* AdSense 5 - After Content */}
            <AdSense size="leaderboard" className="mt-8" placement="home_after_latest" />

            {/* AdSense 6 - Large Rectangle */}
            <AdSense size="large-rectangle" className="mt-8 mx-auto" placement="home_large_rect" />

            {/* AdSense 7 - Inline */}
            <AdSense size="inline" className="mt-8" placement="home_bottom_inline" />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:w-[320px] space-y-6">
            {/* AdSense 8 - Sidebar Top */}
            <AdSense size="rectangle" placement="sidebar_top" />
            {/* AdSense 9 - Sidebar Middle */}
            <AdSense size="rectangle" placement="sidebar_middle" />
            {/* AdSense 10 - Sidebar Bottom */}
            <AdSense size="large-rectangle" placement="sidebar_bottom" />
          </div>
        </div>
      </div>

      {/* AdSense 11 - Before Footer */}
      <div className="py-4">
        <AdSense size="leaderboard" placement="footer_top" />
      </div>

      {/* AdSense 12 - Extra Banner */}
      <div className="py-4">
        <AdSense size="banner" placement="footer_top" />
      </div>
    </Layout>
  );
};

export default StaticPages;
