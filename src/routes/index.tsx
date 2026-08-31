import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "بوت الاستقالات لديسكورد | لوحة الإعداد" },
      {
        name: "description",
        content:
          "بوت ديسكورد لإدارة طلبات الاستقالة: أمر /استقالة، بطاقة بأزرار قبول ورفض، وإزالة الرتب الأعلى من رتبة الستاف تلقائيًا.",
      },
      { property: "og:title", content: "بوت الاستقالات لديسكورد | لوحة الإعداد" },
      {
        property: "og:description",
        content: "دليل تشغيل بوت الاستقالات: الأسرار، Interactions Endpoint، وتسجيل الأوامر.",
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
    body: "أضف مفاتيح البوت في إعدادات الأسرار حتى يعمل التحقق من التوقيع واستدعاء واجهة ديسكورد.",
  },
  {
    title: "٢. اضبط Interactions Endpoint",
    body: "في بوابة مطوري ديسكورد، ضع الرابط أدناه في خانة Interactions Endpoint URL واحفظ.",
  },
  {
    title: "٣. سجّل الأوامر",
    body: "أرسل طلب POST إلى مسار التسجيل مع Bot Token في ترويسة Authorization لتسجيل /استقالة و /اعداد-الاستقالة.",
  },
  {
    title: "٤. ادعُ البوت واضبط السيرفر",
    body: "امنح البوت صلاحية Manage Roles واجعل رتبته أعلى من الرتب التي سيزيلها، ثم شغّل /اعداد-الاستقالة لتحديد القناة ورتبة الستاف.",
  },
];

function Index() {
  return (
    <main dir="rtl" className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Lovable Cloud · Discord</p>
          <h1 className="text-4xl font-bold tracking-tight">بوت الاستقالات</h1>
          <p className="text-muted-foreground">
            أمر <code className="rounded bg-muted px-1">/استقالة</code> بحقول إلزامية، بطاقة في قناة
            محددة بزرّي <span className="font-semibold">قبول</span> (أخضر) و
            <span className="font-semibold"> رفض</span> (أحمر)، وإزالة كل الرتب الأعلى من رتبة
            الستاف عند القبول.
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

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">المسارات</h2>
          <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm break-all">
            <p>POST /api/public/discord/interactions</p>
            <p className="mt-2">POST /api/public/discord/register</p>
          </div>
          <p className="text-sm text-muted-foreground">
            استخدم رابط المشروع المنشور قبل المسار، مثال:
            <span className="font-mono"> https://your-app.lovable.app/api/public/discord/interactions</span>
          </p>
        </section>
      </div>
    </main>
  );
}
