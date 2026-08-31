# Resignation Bot

ابنِ بوت ديسكورد (باستخدام Node.js/discord.js عبر Lovable Cloud edge functions كـ Interactions Endpoint) بالمواصفات التالية:

1. أمر Slash باسم /استقالة، بحقول إلزامية (Discord نفسه يمنع التنفيذ إن لم تُملأ):
   - الاسم (نص)
   - صورة الرتبة (مرفق/صورة)
   - السبب (نص)

2. عند تنفيذ الأمر، ينشر البوت بطاقة (embed) في قناة محددة مسبقًا من الإعدادات، تعرض: الاسم، صورة الرتبة، السبب، ومعها زرّان: "قبول" و"رفض".

3. أمر إعدادات للإدارة (مثل /اعداد-الاستقالة) يسمح بتحديد:
   - قناة نشر بطاقات الاستقالة (channel select)
   - رتبة "Staff" المرجعية (role select)

4. عند الضغط على زر "قبول": يشيل البوت من العضو صاحب الاستقالة كل رتبة تكون أعلى في ترتيب رتب السيرفر (hierarchy) من رتبة "Staff" المحددة في الإعدادات، ثم يحدّث البطاقة لتوضح أنها "مقبولة" (مع اسم من قبلها إن أمكن).

5. عند الضغط على زر "رفض": لا تُشال أي رتبة، وتُحدّث البطاقة لتوضح أنها "مرفوضة" (مع اسم من رفضها إن أمكن).

6. الأزرار يجب أن تكون محصورة لمن يملك صلاحية إدارية مناسبة (وليس أي عضو).

استخدم Lovable Cloud لتخزين الإعدادات (قناة النشر، رتبة Staff لكل سيرفر) ولاستقبال تفاعلات ديسكورد عبر Interactions Endpoint (تحقق توقيع Ed25519). لاحقًا سيُضاف Bot Token و Public Key و Application ID كمتغيرات سرية من طرف المستخدم — لا تطلبها الآن، فقط جهّز البنية والتعليمات لإضافتها.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://guild-leave-manager.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/98ba78ec-32a7-4eb8-82e3-984c21a1e67c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
