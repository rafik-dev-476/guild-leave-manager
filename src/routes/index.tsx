import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "بوت الاستقالات لديسكورد | دليل الإعداد" },
      {
        name: "description",
        content:
          "بوت ديسكورد لإدارة الاستقالات: لوحة بزر «استقالة» ونموذج إلزامي، تخصيص كامل للوحة والرتب والرسائل، وقبول ورفض مع إزالة الرتب تلقائيًا.",
      },
      { property: "og:title", content: "بوت الاستقالات لديسكورد | دليل الإعداد" },
      {
        property: "og:description",
        content: "دليل عربي: الأسرار، Interactions Endpoint، أوامر التخصيص، والأمر النصي $استقاله.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const secrets = [
  { name: "DISCORD_BOT_TOKEN", hint: "من Bot → Reset Token" },
  { name: "DISCORD_PUBLIC_KEY", hint: "من General Information → Public Key" },
  { name: "DISCORD_APPLICATION_ID", hint: "من General Information → Application ID" },
];

const steps = [
  {
    title: "١. أضف الأسرار الثلاثة",
    body: "مفاتيح البوت لازمة للتحقق من التوقيع واستدعاء واجهة ديسكورد.",
  },
  {
    title: "٢. اضبط Interactions Endpoint",
    body: "ضع رابط مسار التفاعلات في Developer Portal → Interactions Endpoint URL بعد نشر التطبيق.",
  },
  {
    title: "٣. سجّل الأوامر",
    body: "أرسل POST إلى مسار التسجيل مع Bot Token في ترويسة Authorization لتسجيل كل الأوامر.",
  },
  {
    title: "٤. ادعُ البوت واضبط الصلاحيات",
    body: "امنحه Manage Roles واجعل رتبته أعلى من الرتب التي سيزيلها.",
  },
  {
    title: "٥. اضبط السيرفر ثم انشر اللوحة",
    body: "نفّذ /اعداد-الاستقالة، ثم /تخصيص-اللوحة، ثم /لوحة-الاستقالة لنشر الرسالة مع زر «استقالة».",
  },
];

const commands = [
  {
    name: "/اعداد-الاستقالة",
    body: "قناة استقبال الطلبات + رتبة الستاف المرجعية + قناة اللوحة + خيار إزالة الرتب تلقائيًا عند القبول.",
  },
  {
    name: "/لوحة-الاستقالة",
    body: "ينشر رسالة اللوحة بزر «استقالة» يفتح نموذجًا إلزاميًا (الاسم، رابط صورة الرتبة، السبب).",
  },
  {
    name: "/تخصيص-اللوحة",
    body: "العنوان، الوصف، اللون HEX، الصورة، الصورة المصغّرة، اسم الزر، وقناة اللوحة الافتراضية.",
  },
  { name: "/رتب-مستثناة", body: "حتى ٥ رتب لا تُزال عند القبول. بدون خيارات = مسح القائمة." },
  { name: "/مراجعو-الاستقالة", body: "حتى ٣ رتب يحق لها القبول/الرفض إضافة إلى الإدارة." },
  { name: "/رسائل-الاستقالة", body: "نص بطاقة القبول ونص بطاقة الرفض." },
  { name: "/استقالة", body: "تقديم مباشر بمرفق صورة بدل اللوحة." },
  { name: "$استقاله", body: "أمر نصي ينشر اللوحة — يتطلب تشغيل بوت Gateway من مجلد gateway-bot." },
];

function Index() {
  return (
    <main dir="rtl" className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Lovable Cloud · Discord</p>
          <h1 className="text-4xl font-bold tracking-tight">بوت الاستقالات</h1>
          <p className="text-muted-foreground">
            لوحة قابلة للنشر بزر <span className="font-semibold">«استقالة»</span> يفتح نموذجًا
            إلزاميًا، يصل الطلب لقناة الإدارة ببطاقة فيها{" "}
            <span className="font-semibold">قبول</span> (أخضر) و
            <span className="font-semibold"> رفض</span> (أحمر)، ومع القبول تُزال كل الرتب الأعلى من
            رتبة الستاف عدا الرتب المستثناة، ويمكن تعطيل الإزالة التلقائية من أمر الإعداد.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">الأسرار المطلوبة</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {secrets.map((secret) => (
              <li key={secret.name} className="rounded-lg border border-border bg-card p-4">
                <p className="font-mono text-sm">{secret.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{secret.hint}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">خطوات التشغيل</h2>
          <ol className="space-y-3">
            {steps.map((step) => (
              <li key={step.title} className="rounded-lg border border-border bg-card p-4">
                <p className="font-semibold">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">الأوامر والتخصيص</h2>
          <ul className="space-y-3">
            {commands.map((command) => (
              <li key={command.name} className="rounded-lg border border-border bg-card p-4">
                <p className="font-mono text-sm font-semibold">{command.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{command.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">الأمر النصي $استقاله</h2>
          <p className="text-sm text-muted-foreground">
            أوامر البادئة تحتاج اتصال Gateway دائمًا، لذا شغّل بوت Node.js الموجود في مجلد{" "}
            <span className="font-mono">gateway-bot</span> على استضافتك، مع تفعيل{" "}
            <span className="font-mono">MESSAGE CONTENT INTENT</span> وضبط متغيّري البيئة{" "}
            <span className="font-mono">DISCORD_BOT_TOKEN</span> (أما APP_URL فله قيمة افتراضية)، ثم{" "}
            <span className="font-mono">npm install &amp;&amp; npm start</span>. التفاصيل في ملف{" "}
            <span className="font-mono">gateway-bot/README.md</span>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">المسارات</h2>
          <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm break-all">
            <p>POST /api/public/discord/interactions</p>
            <p className="mt-2">POST /api/public/discord/register</p>
            <p className="mt-2">GET /api/public/discord/panel?guild_id=…</p>
          </div>
        </section>
      </div>
    </main>
  );
}
