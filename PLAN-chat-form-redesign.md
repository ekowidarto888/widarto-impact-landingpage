# Plan: Redesign Form ke Chat-Style + New Page `/inquiryform`

## Context / Latar Belakang

Project sekarang berada di folder `widarto-impact` (bukan `widarto-impact-main` lagi). Struktur project:
- **`landing-page/`**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 (frontend)
- **`cms/`**: Strapi CMS (backend API)

### Form yang sudah ada saat ini:
- **`/form`**: Sudah ada halaman dengan chat-style form berdasarkan `InquiryPage.jsx`. Namun:
  - Belum terintegrasi dengan API submission (handleSubmit kosong)
  - Styling standalone (gradient beige), tidak match dengan dark theme website
  - Dibuka via `window.open("/form", "_blank")` dari tombol CTA
- **`sheet-form.tsx`**: Multi-step form dalam GlassSheet modal (6 step, React Hook Form + Zod). Submit ke `/api/send-inquiry`.
- **`/api/send-inquiry`**: API route yang kirim email via nodemailer.
- **CTA Button** (`cta-start-project.tsx`): Saat ini klik → buka `/form` di tab baru. Seharusnya buka **popup/modal chat**.

### Yang user inginkan:
1. **Tombol "Start a Project" di seluruh website** → buka **popup/modal chat** (tidak redirect ke halaman baru).
2. **Halaman baru `/inquiryform`** → layout khusus:
   - Navbar dark (logo + Work / Approach / Contact)
   - 2 kolom: **kiri = foto user** (placeholder, nanti diganti), **kanan = chat form inline**
   - Section About
   - Footer (social links + logo besar "WIDARTO IMPACT")
3. **Chat form** pakai konsep yang sama seperti `InquiryPage.jsx` (bubble chat, step-by-step), tapi:
   - Styling diubah jadi **dark theme** (match website)
   - Terintegrasi dengan **API submission** (`/api/send-inquiry`)
   - Field disesuaikan dengan schema yang sudah ada di `sheet-form-schema.ts`

---

## Goal

1. Buat **reusable chat form component** yang bisa dipakai di:
   - **Modal popup** (saat klik "Start a Project")
   - **Halaman `/inquiryform`** (inline, tanpa modal wrapper)
2. Integrasikan dengan API `/api/send-inquiry` yang sudah ada.
3. Styling dark theme, konsisten dengan website Widarto Impact.
4. Tombol CTA "Start a Project" diubah dari `window.open("/form")` jadi **buka modal**.

---

## Pendekatan

### 1. Refactor `/form/page.tsx` (existing InquiryPage.jsx)
- Extract logic chat dari `/form/page.tsx` jadi reusable component.
- Buat `components/inquiry-chat.tsx` sebagai reusable chat component.
- Hapus inline CSS (`dangerouslySetInnerHTML`), ganti dengan Tailwind classes.
- Integrasikan submit dengan fetch ke `/api/send-inquiry`.
- Tambahkan prop `mode: 'modal' | 'inline'` untuk kontrol styling.

### 2. Field Mapping: InquiryPage.jsx → Existing Schema

| InquiryPage Field | Existing Schema Field | Type | Step |
|-------------------|----------------------|------|------|
| `fullName` | `name` | Text | 1 |
| `role` | `role` | Select | 1 |
| `company` | `company` | Text | 1 |
| `website` | `website` | Text | 1 |
| `support` | `services` | Multi-select | 2 |
| `projectType` | `brandStage` | Single-select | 3 |
| `category` | `category` | Text | 4 |
| `wishTo` | `projectDescription` | Textarea | 4 |
| `challenge` | `mainChallenge` | Textarea | 4 |
| `kickOff` | `startDate` | Single-select | 5 |
| `completion` | `targetLaunchDate` | Date | 5 |
| `budget` | `investmentRange` | Single-select | 6 |
| `email` | `email` | Email | 7 |
| `source` | `howDidYouHear` | Text | 8 |

Catatan: field `businessLocation` dari existing schema tidak ada di InquiryPage.jsx, bisa ditambahkan di step 1.

### 3. Tombol CTA "Start a Project"
- Ubah `cta-start-project.tsx`:
  - Hapus `window.open("/form", "_blank")`
  - Set `setOpen(true)` untuk buka modal
  - `SheetForm` sudah di-import, tapi kita ganti pakai chat form modal

### 4. Halaman `/inquiryform`
- Buat `app/inquiryform/page.tsx`
- Layout: Navbar + 2-col (foto kiri, chat kanan) + About + Footer
- Foto user: `public/images/inquiry-user.jpg` (placeholder)

### 5. API Submission
- Gunakan API `/api/send-inquiry` yang sudah ada.
- Mapping data dari chat form ke format yang diharapkan API.

---

## File yang Akan Dibuat / Diubah

| File | Aksi | Tujuan |
|------|------|--------|
| `components/inquiry-chat.tsx` | **Create** | Reusable chat form component (bisa modal & inline). |
| `components/inquiry-chat-modal.tsx` | **Create** | Wrapper modal untuk chat form (pakai GlassSheet atau Dialog). |
| `components/inquiry-chat-schema.ts` | **Create** | Zod schema untuk chat form (mapping dari existing schema). |
| `app/inquiryform/page.tsx` | **Create** | Halaman baru dengan layout 2-col + foto user + chat inline. |
| `app/form/page.tsx` | **Modify** | Refactor jadi thin wrapper yang pakai `InquiryChat` component. |
| `components/pages/home/cta-start-project.tsx` | **Modify** | Ubah dari `window.open("/form")` jadi buka modal chat. |
| `app/api/send-inquiry/route.ts` | **Modify** | Pastikan menerima semua field dari chat form. |
| `components/sheet-form.tsx` | **No change** | Biarkan utuh sebagai alternatif form. |
| `public/images/inquiry-user.jpg` | **Create** | Placeholder foto user (nanti diganti client). |

---

## Struktur Halaman `/inquiryform`

```tsx
// app/inquiryform/page.tsx
export default function InquiryFormPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar - reuse existing Navbar */}
      <Navbar />

      {/* Main Chat Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center gap-8 px-6 py-12 min-h-[80vh]">
        {/* Kolom Kiri: Foto User */}
        <div className="w-full lg:w-2/5 flex justify-center items-center">
          <img
            src="/images/inquiry-user.jpg"
            alt="User"
            className="rounded-2xl max-h-[600px] w-full max-w-md object-cover"
          />
        </div>

        {/* Kolom Kanan: Chat Form Inline */}
        <div className="w-full lg:w-3/5 max-w-2xl">
          <InquiryChat mode="inline" onSubmit={handleSubmit} />
        </div>
      </section>

      {/* About Section */}
      <section className="border-t border-neutral-800 px-6 py-8 flex flex-col lg:flex-row justify-between items-start gap-4">
        <div className="text-sm text-neutral-400">About</div>
        <p className="max-w-md text-sm text-neutral-300">
          We are Widarto Impact. An independent, strategy-led brand design agency.
          We build FMCG brands and packaging systems that move people and markets.
          We help brands refresh and scale up to drive growth.
        </p>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
```

---

## Alur Step Chat (Dark Theme)

| Step | Tipe | Prompt | Field |
|------|------|--------|-------|
| 0 | Bubble | WI greeting + perkenalan; Client: 👋 | — |
| 1 | TextCard | "Let's start with your name and role." | `name`, `role` |
| 2 | TextCard | "What company are you with?" | `company`, `website` |
| 3 | TextCard | "Where is your business based?" | `businessLocation` |
| 4 | OptionCard (multi) | "Which services are you interested in?" | `services` |
| 5 | OptionCard (single) | "What stage is your brand at?" | `brandStage` |
| 6 | TextCard | "Tell us about your project" | `category`, `projectDescription`, `mainChallenge` |
| 7 | OptionCard (single) | "When would you like to start?" | `startDate` |
| 8 | TextCard | "Do you have a target launch date?" | `targetLaunchDate` |
| 9 | OptionCard (single) | "What budget range do you have in mind?" | `investmentRange` |
| 10 | TextCard | "What's your email?" | `email` |
| 11 | TextCard | "How did you hear about us?" | `howDidYouHear` |
| 12 | Summary + Submit | "Please review and submit." | Submit button |

---

## Styling Dark Theme (Chat)

```css
/* Background chat container */
.inquiry-chat {
  background: linear-gradient(135deg, #1a1a1a 0%, #252525 100%);
  border-radius: 24px;
  padding: 32px;
}

/* Bubble WI (Widarto Impact) */
.bubble-wi {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  color: #fff;
  border-radius: 16px;
  padding: 14px 18px;
}

/* Bubble Client (User) */
.bubble-client {
  background: rgba(236, 253, 1, 0.15); /* ECFD01 accent */
  color: #fff;
  border-radius: 16px;
  padding: 14px 18px;
}

/* Input card */
.input-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

/* Option button */
.option-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}
.option-button:hover {
  background: rgba(255, 255, 255, 0.1);
}
.option-button.selected {
  background: rgba(236, 253, 1, 0.2);
  border-color: #ECFD01;
  color: #fff;
}

/* OK / Back buttons */
.ok-button, .back-button {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.ok-button:hover, .back-button:hover {
  background: rgba(236, 253, 1, 0.3);
  color: #ECFD01;
}
```

---

## Arsitektur `components/inquiry-chat.tsx`

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "modal" | "inline";

type BubbleSide = "wi" | "client";

interface BubbleItem {
  type: "bubble";
  side: BubbleSide;
  html: string;
  emoji?: boolean;
}

interface TextCardField {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}

interface TextCardItem {
  type: "text";
  fields: TextCardField[];
  showBack: boolean;
}

interface OptionCardItem {
  type: "option";
  label: string;
  dataKey: string;
  options: { title: string; desc?: string }[];
  multi: boolean;
  showBack: boolean;
}

type ChatItem = BubbleItem | TextCardItem | OptionCardItem;

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  { title: "Brand Strategy", desc: "Positioning, architecture, naming" },
  { title: "Brand Identity", desc: "Visual system, guidelines, assets" },
  { title: "Packaging Design", desc: "Structural & graphic design" },
  { title: "Launch Assets", desc: "Go-to-market creative materials" },
  { title: "Web & eCommerce", desc: "Website design & development" },
  { title: "Content Production", desc: "Photography, video, copywriting" },
  { title: "Ongoing Support", desc: "Retainer-based creative partnership" },
];

const BRAND_STAGE_OPTIONS = [
  "A new brand",
  "An existing brand preparing for launch",
  "A brand refresh",
  "A product line extension",
  "A repositioning project",
];

const START_DATE_OPTIONS = [
  "Immediately",
  "In a month",
  "In 2-3 months",
  "In 3-6 months",
  "6 months or later",
];

const INVESTMENT_OPTIONS = [
  "From USD 10,000 — Focused scope",
  "USD 15,000 — USD 25,000",
  "USD 25,000 — USD 50,000",
  "USD 50,000 — USD 75,000",
  "USD 75,000 — USD 100,000",
  "USD 100,000+",
];

const STEP_CONFIG = [
  // Step 0: Intro
  {
    prompts: [
      { side: "wi" as const, html: "Good morning." },
      { side: "wi" as const, html: "I'm Eko, Founder and Creative Director of Widarto Impact." },
      { side: "client" as const, html: "👋", emoji: true },
      { side: "client" as const, html: "Nice to meet you, Eko." },
    ],
    card: null,
  },
  // Step 1: Name & Role
  {
    prompts: [{ side: "wi" as const, html: "<strong>Let's start with your name and role.</strong>" }],
    card: { type: "text" as const, fields: [
      { key: "name", label: "My name is", placeholder: "John Doe" },
      { key: "role", label: "I'm a", placeholder: "Marketing Director" },
    ], showBack: false },
  },
  // Step 2: Company & Website
  {
    prompts: [{ side: "wi" as const, html: "<strong>What company are you with?</strong>" }],
    card: { type: "text" as const, fields: [
      { key: "company", label: "at", placeholder: "ACME Corp" },
      { key: "website", label: "Our website", placeholder: "https://..." },
    ], showBack: true },
  },
  // Step 3: Location
  {
    prompts: [{ side: "wi" as const, html: "<strong>Where is your business based?</strong>" }],
    card: { type: "text" as const, fields: [
      { key: "businessLocation", label: "City / Country", placeholder: "Jakarta, Indonesia" },
    ], showBack: true },
  },
  // Step 4: Services
  {
    prompts: [{ side: "wi" as const, html: "<strong>Which services are you interested in?</strong>" }],
    card: { type: "option" as const, label: "I need help with:", dataKey: "services", options: SERVICE_OPTIONS, multi: true, showBack: true },
  },
  // Step 5: Brand Stage
  {
    prompts: [{ side: "wi" as const, html: "<strong>What stage is your brand at?</strong>" }],
    card: { type: "option" as const, label: "My project is:", dataKey: "brandStage", options: BRAND_STAGE_OPTIONS.map(t => ({ title: t })), multi: false, showBack: true },
  },
  // Step 6: Project Details
  {
    prompts: [{ side: "wi" as const, html: "<strong>Tell us about your project.</strong>" }],
    card: { type: "text" as const, fields: [
      { key: "category", label: "Category / Industry", placeholder: "Beverage, skincare, snacks..." },
      { key: "projectDescription", label: "I wish to", placeholder: "What do you want to build or improve?", textarea: true },
      { key: "mainChallenge", label: "Our main challenge", placeholder: "What's unclear or underperforming?", textarea: true },
    ], showBack: true },
  },
  // Step 7: Start Date
  {
    prompts: [{ side: "wi" as const, html: "<strong>When would you like to start?</strong>" }],
    card: { type: "option" as const, label: "We can start:", dataKey: "startDate", options: START_DATE_OPTIONS.map(t => ({ title: t })), multi: false, showBack: true },
  },
  // Step 8: Target Launch
  {
    prompts: [{ side: "wi" as const, html: "<strong>Do you have a target launch date?</strong>" }],
    card: { type: "text" as const, fields: [
      { key: "targetLaunchDate", label: "Target launch date", placeholder: "YYYY-MM-DD", type: "date" },
    ], showBack: true },
  },
  // Step 9: Budget
  {
    prompts: [{ side: "wi" as const, html: "<strong>What budget range do you have in mind?</strong>" }],
    card: { type: "option" as const, label: "Investment range:", dataKey: "investmentRange", options: INVESTMENT_OPTIONS.map(t => ({ title: t })), multi: false, showBack: true },
  },
  // Step 10: Email
  {
    prompts: [{ side: "wi" as const, html: "<strong>What's your email?</strong>" }],
    card: { type: "text" as const, fields: [
      { key: "email", label: "You can reach me at", placeholder: "you@email.com", type: "email" },
    ], showBack: true },
  },
  // Step 11: How did you hear
  {
    prompts: [{ side: "wi" as const, html: "<strong>How did you hear about us?</strong>" }],
    card: { type: "text" as const, fields: [
      { key: "howDidYouHear", label: "I found you through", placeholder: "Google, Instagram, referral..." },
    ], showBack: true },
  },
  // Step 12: Summary & Submit
  {
    prompts: [
      { side: "wi" as const, html: "<strong>Please review your answers and submit.</strong>" },
    ],
    card: { type: "summary" as const, showBack: true },
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

interface InquiryChatProps {
  mode?: Mode;
  onClose?: () => void;
}

export default function InquiryChat({ mode = "inline", onClose }: InquiryChatProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const update = (key: string, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: false }));
  };

  const validateStep = (stepIndex: number): boolean => {
    const step = STEP_CONFIG[stepIndex];
    if (!step.card || step.card.type === "summary") return true;
    if (step.card.type === "text") {
      return step.card.fields.every(f => {
        const val = formData[f.key];
        return val && String(val).trim().length > 0;
      });
    }
    if (step.card.type === "option") {
      const val = formData[step.card.dataKey];
      return step.card.multi ? Array.isArray(val) && val.length > 0 : !!val;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) {
      // Show errors
      const step = STEP_CONFIG[currentStep];
      if (step.card?.type === "text") {
        const newErrors: Record<string, boolean> = {};
        step.card.fields.forEach(f => {
          const val = formData[f.key];
          if (!val || !String(val).trim()) newErrors[f.key] = true;
        });
        setErrors(newErrors);
      }
      return;
    }
    if (currentStep < STEP_CONFIG.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/send-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert("Failed to submit. Please try again.");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [currentStep, formData]);

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-20 h-20 rounded-full bg-[#ECFD01]/20 flex items-center justify-center mb-8">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ECFD01" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-white">Thank you.</h2>
        <p className="text-white/70 leading-relaxed max-w-md">
          Your inquiry has been received. We'll review it carefully and get back to you if it feels like a strong fit.
        </p>
        {mode === "modal" && onClose && (
          <button
            onClick={onClose}
            className="mt-10 px-6 py-3 rounded-full bg-[#ECFD01] text-[#121212] font-semibold"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  // Render logic... (same pattern as InquiryPage.jsx)
  // ...

  return (
    <div
      ref={chatRef}
      className={cn(
        "overflow-y-auto scrollbar-hide",
        mode === "modal" ? "max-h-[70vh]" : "h-full"
      )}
    >
      {/* Render bubbles and cards */}
    </div>
  );
}
```

---

## Urutan Pengerjaan

1. **Analyze existing code**
   - Pelajari `sheet-form.tsx` dan `sheet-form-schema.ts` untuk paham field lengkap.
   - Pelajari `app/form/page.tsx` (InquiryPage.jsx reference) untuk paham chat flow.
   - Pelajari `app/api/send-inquiry/route.ts` untuk paham API payload.

2. **Buat schema mapping**
   - Buat `components/inquiry-chat-schema.ts` — mapping field InquiryPage → existing schema.

3. **Buat reusable chat component**
   - `components/inquiry-chat.tsx` — ekstrak logic dari `/form/page.tsx`, refactor jadi reusable.
   - Support mode `modal` dan `inline`.
   - Styling dark theme (Tailwind).
   - Integrasikan submit ke `/api/send-inquiry`.

4. **Buat modal wrapper**
   - `components/inquiry-chat-modal.tsx` — wrap chat component dalam Dialog/Sheet.
   - Dipakai oleh tombol CTA "Start a Project".

5. **Update CTA button**
   - `components/pages/home/cta-start-project.tsx` — ubah dari `window.open("/form")` jadi buka modal.
   - Import `InquiryChatModal` dan manage `open` state.

6. **Buat halaman `/inquiryform`**
   - `app/inquiryform/page.tsx` — layout 2-col (foto kiri, chat kanan) + about + footer.
   - Tambahkan route di `config/navigation.ts` (opsional, untuk link).

7. **Update `/form` page**
   - `app/form/page.tsx` — refactor jadi thin wrapper yang pakai `InquiryChat` component.
   - Atau hapus kalau tidak diperlukan lagi (user bisa pakai `/inquiryform`).

8. **Update API route**
   - `app/api/send-inquiry/route.ts` — pastikan menerima semua field dari chat form.

9. **Tambahkan foto placeholder**
   - `public/images/inquiry-user.jpg` — placeholder untuk foto user.

10. **Build & Verifikasi**
    - `npm run build` → cek error.
    - Uji klik "Start a Project" → modal chat muncul.
    - Uji halaman `/inquiryform` → chat inline tampil dengan foto.
    - Uji submit → email terkirim.

---

## Verification Checklist

- [ ] `npm run build` sukses tanpa error.
- [ ] Klik "Start a Project" di navbar/homepage → **modal chat** muncul (popup, bukan redirect).
- [ ] Halaman `/inquiryform` bisa diakses dan menampilkan layout: navbar + foto user (kiri) + chat inline (kanan) + about + footer.
- [ ] Chat form berjalan step-by-step dengan bubble animation.
- [ ] Validasi per-step berfungsi (kosong = error, terisi = bisa lanjut).
- [ ] Tombol Back berfungsi di setiap step.
- [ ] Pilih "Other" service → input teks muncul.
- [ ] Submit sukses → response JSON sukses dan muncul "Thank you" screen.
- [ ] Email diterima dengan field lengkap.
- [ ] Tampilan mobile tetap scrollable dan touch-friendly.
- [ ] Foto user bisa diganti tanpa ubah code (tinggal replace file di `public/images/inquiry-user.jpg`).
