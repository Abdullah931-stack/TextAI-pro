<p align="center">
  <img src="icon.png" alt="TextAIpro Logo" width="128" height="128">
</p>

<h1 align="center">TextAIpro</h1>

<p align="center">
  <strong>محرر نصوص احترافي مدعوم بالذكاء الاصطناعي</strong><br>
  <em>AI-Powered Text Editor with Gemini Integration</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Vercel-Serverless-000000?logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/PWA-Enabled-5A0FC8?logo=pwa&logoColor=white" alt="PWA">
</p>

---

## 📋 جدول المحتويات

- [نظرة عامة](#-نظرة-عامة)
- [الميزات الرئيسية](#-الميزات-الرئيسية)
- [المتطلبات التقنية](#-المتطلبات-التقنية)
- [دليل التثبيت](#-دليل-التثبيت)
- [إعداد البيئة](#-إعداد-البيئة)
- [دليل الاستخدام](#-دليل-الاستخدام)
- [خريطة النشر](#-خريطة-النشر)
- [هيكل المشروع](#-هيكل-المشروع)
- [واجهة برمجة التطبيقات](#-واجهة-برمجة-التطبيقات)

---

## 🎯 نظرة عامة

**TextAIpro** هو محرر نصوص احترافي مدعوم بالذكاء الاصطناعي، مصمم خصيصاً للكتّاب المحترفين والمستخدمين العرب. يدمج المشروع تقنيات Google Gemini AI لتوفير أدوات متقدمة لمعالجة النصوص، مع دعم كامل للغة العربية والاتجاه من اليمين لليسار (RTL).

### القيمة التقنية

- **معمارية Serverless**: نشر بدون خوادم عبر Vercel مع API functions
- **نظام دوران المفاتيح**: إدارة ذكية لمفاتيح API متعددة باستخدام Redis
- **تطبيق PWA**: قابل للتثبيت مع دعم كامل للعمل بدون اتصال
- **واجهة حديثة**: تصميم فاخر مع دعم Glassmorphism والرسوم المتحركة

---

## ✨ الميزات الرئيسية

### أدوات الذكاء الاصطناعي

| الأداة | الوصف | الاستخدام |
|--------|-------|----------|
| **تصحيح** | تصحيح الأخطاء النحوية والإملائية | معالجة النص تلقائياً |
| **تطوير** | تحسين أسلوب الكتابة والوضوح | ترقية المفردات والبنية |
| **تلخيص** | اختصار النصوص الطويلة | استخلاص النقاط الرئيسية |
| **موجه** | تحويل النص إلى prompt فعّال | تحسين للاستخدام مع AI |
| **ترجمة** | ترجمة عربي ↔ إنجليزي | ترجمة ذكية تحافظ على السياق |

### ميزات المحرر

- 📁 **نظام ملفات محلي**: إنشاء وتنظيم الملفات والمجلدات
- 📥 **استيراد متعدد**: دعم ملفات `.txt`, `.md`, `.pdf`
- 📤 **تصدير مرن**: حفظ بصيغة Text أو Markdown
- 🔍 **بحث واستبدال**: بحث متقدم في النص
- ↩️ **تراجع/تقدم**: سجل كامل للتعديلات
- 📱 **استجابة كاملة**: واجهة متكيفة للموبايل والديسكتوب

### ميزات PWA

- 📲 **قابل للتثبيت**: كتطبيق مستقل على الجهاز
- 🔄 **العمل بدون اتصال**: تخزين مؤقت ذكي للملفات
- ⚡ **أداء عالي**: تحميل سريع مع Service Worker

---

## 🔧 المتطلبات التقنية

### متطلبات التطوير المحلي

| المتطلب | الإصدار | الرابط |
|---------|---------|--------|
| Node.js | 18.0.0+ | [nodejs.org](https://nodejs.org) |
| npm | 9.0.0+ | يأتي مع Node.js |
| Git | أي إصدار | [git-scm.com](https://git-scm.com) |

### متطلبات بيئة الإنتاج

| الخدمة | الغرض | الرابط |
|--------|-------|--------|
| Vercel | استضافة Serverless | [vercel.com](https://vercel.com) |
| Upstash Redis | إدارة حالة المفاتيح | [upstash.com](https://upstash.com) |
| Google AI Studio | مفاتيح Gemini API | [aistudio.google.com](https://aistudio.google.com) |

---

## 📦 دليل التثبيت

### 1. استنساخ المشروع

```bash
git clone https://github.com/your-username/textaipro.git
cd textaipro
```

### 2. تثبيت الاعتماديات

```bash
npm install
```

### 3. إعداد ملف البيئة

```bash
# نسخ قالب الإعدادات
cp .env.example .env
```

### 4. تشغيل الخادم المحلي

```bash
# التشغيل باستخدام Node.js مباشرة
npm run local

# أو باستخدام Vercel CLI (موصى به)
npm run dev
```

### 5. فتح التطبيق

```
http://localhost:3000
```

---

## ⚙️ إعداد البيئة

### ملف `.env`

أنشئ ملف `.env` في المجلد الرئيسي بالمتغيرات التالية:

```env
# ============================================
# TextAIPRO Environment Configuration
# ============================================

# مجموعة مفاتيح Gemini API (مفصولة بفواصل)
# كل مفتاح يُستخدم لـ 20 طلب قبل الانتقال للتالي
API_KEYS_POOL="YOUR_API_KEY_1,YOUR_API_KEY_2,YOUR_API_KEY_3"

# إعدادات Upstash Redis
# احصل عليها من: https://console.upstash.com/redis
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token_here"

# إعدادات نموذج Gemini
GEMINI_MODEL="gemini-3-flash-preview"
GEMINI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/models"
```

### الحصول على المفاتيح

#### مفاتيح Gemini API

1. انتقل إلى [Google AI Studio](https://aistudio.google.com)
2. أنشئ مشروعاً جديداً أو استخدم مشروعاً موجوداً
3. اذهب إلى "Get API Key" → "Create API Key"
4. انسخ المفتاح وأضفه لـ `API_KEYS_POOL`

> **ملاحظة**: يُنصح بإنشاء 15 مفتاح على الأقل لتجنب تجاوز الحدود

#### إعداد Upstash Redis

1. أنشئ حساباً على [Upstash Console](https://console.upstash.com)
2. أنشئ قاعدة بيانات Redis جديدة
3. انسخ `UPSTASH_REDIS_REST_URL` و `UPSTASH_REDIS_REST_TOKEN`

---

## 🚀 دليل الاستخدام

### واجهة المستخدم

#### الشريط الجانبي (Sidebar)

- **إنشاء ملف جديد**: انقر زر "ملف جديد"
- **إنشاء مجلد**: انقر زر "مجلد جديد"
- **استيراد ملفات**: اسحب وأفلت الملفات في منطقة الإسقاط

#### شريط الأدوات (Toolbar)

| الزر | الاختصار | الوظيفة |
|------|----------|---------|
| تراجع | `Ctrl+Z` | التراجع عن آخر تعديل |
| تقدم | `Ctrl+Y` | إعادة التعديل الملغي |
| بحث | `Ctrl+F` | فتح نافذة البحث والاستبدال |
| نسخ | `Ctrl+C` | نسخ النص المحدد |
| تصدير | - | حفظ الملف بصيغة مختلفة |

#### أدوات AI

1. حدد النص المراد معالجته (أو اترك المحرر للنص الكامل)
2. انقر على الأداة المطلوبة (تصحيح، تطوير، تلخيص، إلخ)
3. انتظر ظهور النتيجة

### واجهة الموبايل

- **زر القائمة**: فتح الشريط الجانبي
- **شريط التنقل السفلي**: وصول سريع للأدوات
- **زر AI المركزي**: فتح قائمة أدوات الذكاء الاصطناعي

---

## 🌐 خريطة النشر

### النشر على Vercel

#### الخطوة 1: ربط المستودع

```bash
# تثبيت Vercel CLI
npm install -g vercel

# تسجيل الدخول
vercel login

# ربط المشروع
vercel link
```

#### الخطوة 2: إعداد المتغيرات البيئية

```bash
# إضافة المتغيرات السرية
vercel secrets add api_keys_pool "key1,key2,key3..."
vercel secrets add upstash_redis_rest_url "https://..."
vercel secrets add upstash_redis_rest_token "your_token"
```

أو عبر لوحة تحكم Vercel:
1. اذهب إلى إعدادات المشروع > Environment Variables
2. أضف المتغيرات التالية:

| الاسم | القيمة |
|-------|--------|
| `API_KEYS_POOL` | مفاتيح API مفصولة بفواصل |
| `UPSTASH_REDIS_REST_URL` | رابط Redis REST |
| `UPSTASH_REDIS_REST_TOKEN` | رمز المصادقة |
| `GEMINI_MODEL` | `gemini-3-flash-preview` |
| `GEMINI_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/models` |

#### الخطوة 3: النشر

```bash
# نشر للإنتاج
vercel --prod
```

### بنية vercel.json

```json
{
    "version": 2,
    "builds": [
        { "src": "api/**/*.js", "use": "@vercel/node" },
        { "src": "index.html", "use": "@vercel/static" },
        { "src": "src/**/*", "use": "@vercel/static" }
    ],
    "routes": [
        { "src": "/api/(.*)", "dest": "/api/$1" },
        { "src": "/(.*)", "dest": "/$1" }
    ]
}
```

---

## 📁 هيكل المشروع

```
textaipro/
├── 📄 index.html              # نقطة الدخول الرئيسية (HTML)
├── 📄 manifest.json           # إعدادات PWA
├── 📄 sw.js                   # Service Worker للتخزين المؤقت
├── 📄 server.js               # خادم التطوير المحلي
├── 📄 package.json            # اعتماديات المشروع
├── 📄 vercel.json             # إعدادات النشر على Vercel
├── 📄 .env.example            # قالب المتغيرات البيئية
├── 📄 .gitignore              # ملفات مستثناة من Git
├── 🖼️ icon.png                # أيقونة التطبيق الرئيسية
│
├── 📂 api/                    # واجهات API (Serverless Functions)
│   └── 📄 gemini.js           # Proxy لـ Gemini API مع دوران المفاتيح
│
├── 📂 icons/                  # أيقونات PWA بأحجام متعددة
│   ├── 📄 icon-192.png
│   ├── 📄 icon-512.png
│   ├── 📄 icon-maskable-192.png
│   └── 📄 icon-maskable-512.png
│
├── 📂 lib/                    # مكتبات خارجية
│   └── ...
│
└── 📂 src/                    # الكود المصدري للواجهة الأمامية
    ├── 📄 main.js             # نقطة الدخول الرئيسية للتطبيق
    │
    ├── 📂 app/                # وحدات التطبيق الأساسية
    │   ├── 📄 editor.js       # منطق المحرر النصي
    │   ├── 📄 fileSystem.js   # إدارة نظام الملفات الافتراضي
    │   ├── 📄 mobile.js       # معالجات واجهة الموبايل
    │   ├── 📄 modals.js       # النوافذ المنبثقة
    │   ├── 📄 sidebar.js      # الشريط الجانبي وشجرة الملفات
    │   ├── 📄 state.js        # إدارة حالة التطبيق المركزية
    │   ├── 📄 toast.js        # إشعارات Toast
    │   └── 📄 toolbar.js      # شريط الأدوات العلوي
    │
    ├── 📂 config/             # إعدادات العميل
    │   └── 📄 config.js       # ثوابت التكوين
    │
    ├── 📂 services/           # خدمات الاتصال
    │   ├── 📄 geminiService.js # عميل Gemini API
    │   ├── 📄 fileService.js   # معالجة الملفات
    │   └── 📄 pdfService.js    # استخراج نص PDF
    │
    ├── 📂 styles/             # ملفات التنسيق
    │   ├── 📄 index.css       # المتغيرات والأنماط الأساسية
    │   ├── 📄 layout.css      # تخطيط الصفحة
    │   ├── 📄 components.css  # مكونات UI
    │   ├── 📄 animations.css  # الرسوم المتحركة
    │   └── 📄 mobile.css      # أنماط الاستجابة للموبايل
    │
    └── 📂 utils/              # أدوات مساعدة
        ├── 📄 bidirectional.js # دعم RTL/LTR
        ├── 📄 sanitize.js      # تنظيف المدخلات
        └── 📄 storage.js       # التخزين المحلي
```

---

## 🔌 واجهة برمجة التطبيقات

### Endpoint الرئيسي

```
POST /api/gemini
```

### الطلب

```json
{
    "text": "النص المراد معالجته",
    "action": "correct|improve|summarize|toPrompt|translate"
}
```

### الاستجابة

```json
{
    "result": "النص المعالج",
    "keyIndex": 0,
    "requestCount": 15
}
```

### أكواد الخطأ

| الكود | الوصف |
|-------|-------|
| 200 | نجاح |
| 400 | طلب غير صالح |
| 429 | تجاوز حد الطلبات |
| 500 | خطأ في الخادم |

### آلية دوران المفاتيح

```
┌─────────────────────────────────────────────────────┐
│                  Key Rotation System                │
├─────────────────────────────────────────────────────┤
│  Key Pool: [key1, key2, key3, ... key15]           │
│                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │  Key 1   │───▶│  Key 2   │───▶│  Key 3   │──▶...│
│  │ (20 req) │    │ (20 req) │    │ (20 req) │     │
│  └──────────┘    └──────────┘    └──────────┘     │
│       ▲                                    │       │
│       └────────────────────────────────────┘       │
│                  (Circular Rotation)               │
├─────────────────────────────────────────────────────┤
│  Redis State:                                       │
│  - current_key_index: الفهرس الحالي               │
│  - usage_count_N: عداد الاستخدام لكل مفتاح         │
└─────────────────────────────────────────────────────┘
```

---

## 📝 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

---

## 🤝 المساهمة

نرحب بمساهماتكم!

---

<p align="center">
  <strong>صُنع بـ ❤️ للكتّاب العرب</strong>
</p>
