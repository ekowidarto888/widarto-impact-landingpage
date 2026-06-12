"use client";

import { useEffect, useRef, useState } from "react";
import type { InquiryChatProps, Mode } from "./types";

// ── Step Configurations ────────────────────────────────────────────────────────
interface ChatFormField {
  label: string;
  placeholder: string;
  key: string;
  textarea?: boolean;
  type?: string;
  optional?: boolean;
}

const ID_FIELDS: ChatFormField[] = [
  { label: "My name is", placeholder: "Your fullname", key: "fullName" },
  { label: "I'm a", placeholder: "Marketing Director", key: "role" },
  { label: "at", placeholder: "Your company", key: "company" },
  { label: "Our website or social media is", placeholder: "https://...", key: "website", optional: true }
];

const PD_FIELDS: ChatFormField[] = [
  { label: "My category / industry is", placeholder: "Beverage, skincare, snacks, wellness...", key: "category" },
  { label: "I wish to", placeholder: "Tell us what you want to build, change, or improve", key: "wishTo", textarea: true },
  { label: "Our main challenge right now is", placeholder: "Tell us what feels unclear, underperforming, or ready to evolve", key: "challenge", textarea: true }
];

const EM_FIELDS: ChatFormField[] = [
  { label: "You can reach me at", placeholder: "you@email.com", key: "email", type: "email" }
];

const OPT = {
  support: [
    { title: "Brand Audit" },
    { title: "Brand Creation" },
    { title: "Brand Refresh" },
    { title: "Repositioning" },
    { title: "Brand Identity" },
    { title: "Packaging Design System" },
    { title: "Product Range Extension" },
    { title: "Launch / Go-to-Market Assets" },
    { title: "Not sure yet" }
  ],
  project: [
    { title: "A new brand" },
    { title: "An existing brand preparing for launch" },
    { title: "A brand refresh" },
    { title: "A product line extension" },
    { title: "A repositioning project" },
    { title: "Something else" }
  ],
  kickoff: [
    { title: "ASAP, somewhere within the next 2 weeks" },
    { title: "Soon, next month would be fantastic" },
    { title: "Within the next 3 months, at the latest" },
    { title: "No rush, whatever works best for your team" }
  ],
  completion: [
    { title: "In 2-3 months" },
    { title: "Within the next 6 months" },
    { title: "In about a year" },
    { title: "Not sure yet" }
  ],
  budget: [
    { title: "USD 10,000 to 15,000", desc: "Focused single-scope engagement" },
    { title: "USD 15,000 to 30,000", desc: "Focused brand or packaging project, usually around 1 to 4 SKUs" },
    { title: "USD 30,000 to 50,000", desc: "Brand identity and packaging system, usually around 4 to 8 SKUs" },
    { title: "USD 50,000 to 100,000", desc: "Product range or portfolio transformation, usually around 8 to 15+ SKUs" },
    { title: "USD 100,000+", desc: "Multi-category brand system engagement" },
    { title: "Not sure yet, but we are ready to invest in the right scope" }
  ],
  source: [
    { title: "A client referral" },
    { title: "A friend or colleague" },
    { title: "Google" },
    { title: "Instagram" },
    { title: "LinkedIn" },
    { title: "Behance" },
    { title: "World Brand Design Society" },
    { title: "I've been following your work for some time" },
    { title: "Other" }
  ]
};

interface TextCardConfig {
  type: "textCard";
  fields: ChatFormField[];
}

interface OptionCardConfig {
  type: "optionCard";
  label: string;
  key: string;
  options: { title: string; desc?: string }[];
  multi: boolean;
}

type StepCardConfig = TextCardConfig | OptionCardConfig;

interface Step {
  p: string[] | (() => string[]);
  card: StepCardConfig;
}

type ChatItem =
  | { type: "bubble"; side: "wi" | "client"; html: string; emoji?: boolean; animate?: boolean }
  | { type: "textCard"; side: "client"; fields: ChatFormField[]; mode: "active" | "completed"; animate?: boolean }
  | { type: "optionCard"; side: "client"; label: string; dataKey: string; options: { title: string; desc?: string }[]; multi: boolean; mode: "active" | "completed"; animate?: boolean }
  | { type: "typing"; side: "wi" };

export default function InquiryChat({ mode = "inline", onClose }: InquiryChatProps) {
  // ── State ──────────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    company: "",
    website: "",
    support: [] as string[],
    projectType: "",
    category: "",
    wishTo: "",
    challenge: "",
    kickOff: "",
    completion: "",
    budget: "",
    email: "",
    source: ""
  });

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [visibleItems, setVisibleItems] = useState<ChatItem[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [activeSubFieldIndex, setActiveSubFieldIndex] = useState(0);
  const [animateNext, setAnimateNext] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; msg: string; err?: boolean }>({ show: false, msg: "" });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Helpers
  const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  };

  const fn = () => {
    return (formData.fullName || "there").split(" ")[0];
  };

  const initial = formData.fullName ? fn().charAt(0).toUpperCase() : "";

  const shouldShowAvatar = (item: ChatItem, index: number) => {
    const nextItem = visibleItems[index + 1];
    if (nextItem && nextItem.side === item.side) {
      return false;
    }
    return true;
  };

  const showToast = (msg: string, err = false) => {
    setToast({ show: true, msg, err });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const scrollToBottom = (behavior: "smooth" | "auto") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior
      });
    }
  };

  const clearTimeouts = () => {
    activeTimeoutsRef.current.forEach(clearTimeout);
    activeTimeoutsRef.current = [];
  };

  // Steps evaluation
  const getSteps = (fd: typeof formData): Step[] => {
    return [
      {
        p: [],
        card: { type: "textCard", fields: ID_FIELDS }
      },
      {
        p: [`The pleasure is mine, <span>${fn()}</span>.`, "<strong>What kind of support are you looking for?</strong>"],
        card: { type: "optionCard", label: "I am seeking a partner to help me with:", key: "support", options: OPT.support, multi: true }
      },
      {
        p: ["You came to the right place.", "<strong>Let's understand the ambition behind the project.</strong>"],
        card: { type: "optionCard", label: "My project is:", key: "projectType", options: OPT.project, multi: false }
      },
      {
        p: [],
        card: { type: "textCard", fields: PD_FIELDS }
      },
      {
        p: ["Understood. That gives us a clearer picture.", "<strong>When would you like to kick off the project?</strong>"],
        card: { type: "optionCard", label: "We can start:", key: "kickOff", options: OPT.kickoff, multi: false }
      },
      {
        p: ["<strong>And when would you like to see the project completed?</strong>"],
        card: { type: "optionCard", label: "I'm aiming for:", key: "completion", options: OPT.completion, multi: false }
      },
      {
        p: ["And to wrap up...", "<strong>What budget range did you have in mind for this whole mandate?</strong>"],
        card: { type: "optionCard", label: "I would say:", key: "budget", options: OPT.budget, multi: false }
      },
      {
        p: ["Great. We'll review the project with our team and get back to you shortly.", "<strong>Can I get your email address for follow-up?</strong>"],
        card: { type: "textCard", fields: EM_FIELDS }
      },
      {
        p: ["Thank you.", "One quick question before we wrap up.", "<strong>How did you hear about Widarto Impact?</strong>"],
        card: { type: "optionCard", label: "I found you through:", key: "source", options: OPT.source, multi: false }
      }
    ];
  };

  // ── Submission ─────────────────────────────────────────────────────────────────
  const submitForm = async (data: typeof formData) => {
    try {
      const payload = {
        name: data.fullName,
        role: data.role,
        company: data.company,
        website: data.website,
        services: data.support,
        brandStage: data.projectType,
        category: data.category,
        projectDescription: data.wishTo,
        mainChallenge: data.challenge,
        startDate: data.kickOff,
        targetLaunchDate: data.completion,
        investmentRange: data.budget,
        email: data.email,
        howDidYouHear: data.source,
        businessLocation: "",
        primaryMarket: "",
        revenueRange: "",
        otherServiceDetails: "",
        specificInvestmentDetails: "",
        additionalNotes: ""
      };

      const response = await fetch("/api/send-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showToast("Inquiry sent. We'll be in touch.");
      } else {
        showToast("Failed to send. Please try again.", true);
      }
    } catch {
      showToast("Network error.", true);
    }
  };

  // ── Render Items Hook ──────────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeouts();
    const steps = getSteps(formData);
    const BD = 1200;
    const CD = 450;

    if (!animateNext) {
      // Instant Render (no animations, no timeouts, no typing placeholders)
      const items: ChatItem[] = [];
      items.push({ type: "bubble", side: "wi", html: `${greet()}.` });
      items.push({ type: "bubble", side: "wi", html: "I'm Eko, Founder and Creative Director of Widarto Impact." });
      items.push({ type: "bubble", side: "client", html: "👋", emoji: true });
      items.push({ type: "bubble", side: "client", html: "Nice to meet you, Eko." });

      for (let i = 0; i < step; i++) {
        const prompts = steps[i].p;
        const promptList = typeof prompts === "function" ? prompts() : prompts;
        promptList.forEach(p => {
          items.push({ type: "bubble", side: "wi", html: p });
        });
        const card = steps[i].card;
        if (card.type === "textCard") {
          items.push({ type: "textCard", side: "client", fields: card.fields, mode: "completed" });
        } else {
          items.push({ type: "optionCard", side: "client", label: card.label, dataKey: card.key, options: card.options, multi: card.multi, mode: "completed" });
        }
      }

      if (!done) {
        const prompts = steps[step].p;
        const promptList = typeof prompts === "function" ? prompts() : prompts;
        promptList.forEach(p => {
          items.push({ type: "bubble", side: "wi", html: p });
        });
        const card = steps[step].card;
        if (card.type === "textCard") {
          items.push({ type: "textCard", side: "client", fields: card.fields, mode: "active" });
        } else {
          items.push({ type: "optionCard", side: "client", label: card.label, dataKey: card.key, options: card.options, multi: card.multi, mode: "active" });
        }
      } else {
        // Last step completed
        const prompts = steps[step].p;
        const promptList = typeof prompts === "function" ? prompts() : prompts;
        promptList.forEach(p => {
          items.push({ type: "bubble", side: "wi", html: p });
        });
        const card = steps[step].card;
        if (card.type === "textCard") {
          items.push({ type: "textCard", side: "client", fields: card.fields, mode: "completed" });
        } else {
          items.push({ type: "optionCard", side: "client", label: card.label, dataKey: card.key, options: card.options, multi: card.multi, mode: "completed" });
        }
        items.push({ type: "bubble", side: "wi", html: "Perfect. Thank you for sharing." });
        items.push({ type: "bubble", side: "wi", html: "We'll review your inquiry carefully and get back to you with the best next step if the project aligns." });
        items.push({ type: "bubble", side: "client", html: "Sounds good." });
        items.push({ type: "bubble", side: "wi", html: "Speak soon." });
      }

      setVisibleItems(items);
      if (done) {
        setShowSuccessScreen(true);
      } else {
        setShowSuccessScreen(false);
      }
      setTimeout(() => scrollToBottom("auto"), 50);
    } else {
      setShowSuccessScreen(false);
      // Staggered Animations
      if (step === 0 && !done) {
        setVisibleItems([]);

        // Stagger Intro with typing indicators
        let t1 = setTimeout(() => {
          setVisibleItems([{ type: "typing", side: "wi" }]);
          scrollToBottom("smooth");
        }, 50);
        activeTimeoutsRef.current.push(t1);

        let t2 = setTimeout(() => {
          setVisibleItems(prev => [
            ...prev.filter(x => x.type !== "typing"),
            { type: "bubble", side: "wi", html: `${greet()}.`, animate: true },
            { type: "typing", side: "wi" }
          ]);
          setTimeout(() => scrollToBottom("smooth"), 50);
        }, 50 + BD);
        activeTimeoutsRef.current.push(t2);

        let t3 = setTimeout(() => {
          setVisibleItems(prev => [
            ...prev.filter(x => x.type !== "typing"),
            { type: "bubble", side: "wi", html: "I'm Eko, Founder and Creative Director of Widarto Impact.", animate: true }
          ]);
          setTimeout(() => scrollToBottom("smooth"), 50);
        }, 50 + BD + BD);
        activeTimeoutsRef.current.push(t3);

        let t4 = setTimeout(() => {
          setVisibleItems(prev => [
            ...prev,
            { type: "bubble", side: "client", html: "👋", emoji: true, animate: true }
          ]);
          setTimeout(() => scrollToBottom("smooth"), 50);
        }, 50 + BD + BD + 200);
        activeTimeoutsRef.current.push(t4);

        let t5 = setTimeout(() => {
          setVisibleItems(prev => [
            ...prev,
            { type: "bubble", side: "client", html: "Nice to meet you, Eko.", animate: true }
          ]);
          setTimeout(() => scrollToBottom("smooth"), 50);
        }, 50 + BD + BD + 400);
        activeTimeoutsRef.current.push(t5);

        let t6 = setTimeout(() => {
          setVisibleItems(prev => [
            ...prev,
            { type: "textCard", side: "client", fields: ID_FIELDS, mode: "active", animate: true }
          ]);
          setTimeout(() => scrollToBottom("smooth"), 50);
        }, 50 + BD + BD + 400 + CD);
        activeTimeoutsRef.current.push(t6);
      } else {
        const items: ChatItem[] = [];
        items.push({ type: "bubble", side: "wi", html: `${greet()}.` });
        items.push({ type: "bubble", side: "wi", html: "I'm Eko, Founder and Creative Director of Widarto Impact." });
        items.push({ type: "bubble", side: "client", html: "👋", emoji: true });
        items.push({ type: "bubble", side: "client", html: "Nice to meet you, Eko." });

        const limit = done ? step + 1 : step;
        for (let i = 0; i < limit; i++) {
          const prompts = steps[i].p;
          const promptList = typeof prompts === "function" ? prompts() : prompts;
          promptList.forEach(p => {
            items.push({ type: "bubble", side: "wi", html: p });
          });
          const card = steps[i].card;
          if (card.type === "textCard") {
            items.push({ type: "textCard", side: "client", fields: card.fields, mode: "completed" });
          } else {
            items.push({ type: "optionCard", side: "client", label: card.label, dataKey: card.key, options: card.options, multi: card.multi, mode: "completed" });
          }
        }

        setVisibleItems(items);
        setTimeout(() => scrollToBottom("auto"), 50);

        let currentDelay = 0;
        const prompts = steps[step].p;
        const promptList = typeof prompts === "function" ? prompts() : prompts;

        if (!done) {
          promptList.forEach((p) => {
            const tTyping = setTimeout(() => {
              setVisibleItems(prev => [
                ...prev.filter(x => x.type !== "typing"),
                { type: "typing", side: "wi" }
              ]);
              setTimeout(() => scrollToBottom("smooth"), 50);
            }, currentDelay);
            activeTimeoutsRef.current.push(tTyping);

            currentDelay += BD;
            const tMsg = setTimeout(() => {
              setVisibleItems(prev => [
                ...prev.filter(x => x.type !== "typing"),
                { type: "bubble", side: "wi", html: p, animate: true }
              ]);
              setTimeout(() => scrollToBottom("smooth"), 50);
            }, currentDelay);
            activeTimeoutsRef.current.push(tMsg);
          });

          currentDelay += CD;
          const card = steps[step].card;
          const tCard = setTimeout(() => {
            setVisibleItems(prev => [
              ...prev,
              card.type === "textCard"
                ? { type: "textCard", side: "client", fields: card.fields, mode: "active", animate: true }
                : { type: "optionCard", side: "client", label: card.label, dataKey: card.key, options: card.options, multi: card.multi, mode: "active", animate: true }
            ]);
            setTimeout(() => scrollToBottom("smooth"), 50);
          }, currentDelay);
          activeTimeoutsRef.current.push(tCard);
        } else {
          // done transition
          // We only animate the closing bubbles since step 8 is already added to the base items instantly!


          const closing = [
            { html: "Perfect. Thank you for sharing." },
            { html: "We'll review your inquiry carefully and get back to you with the best next step if the project aligns." },
            { html: "Sounds good.", side: "client" as const },
            { html: "Speak soon." }
          ];

          closing.forEach(c => {
            const side = c.side || "wi";
            if (side === "wi") {
              const tTyping = setTimeout(() => {
                setVisibleItems(prev => [
                  ...prev.filter(x => x.type !== "typing"),
                  { type: "typing", side: "wi" }
                ]);
                setTimeout(() => scrollToBottom("smooth"), 50);
              }, currentDelay);
              activeTimeoutsRef.current.push(tTyping);
            }

            currentDelay += BD;
            const tMsg = setTimeout(() => {
              setVisibleItems(prev => [
                ...prev.filter(x => x.type !== "typing"),
                { type: "bubble", side, html: c.html, animate: true }
              ]);
              setTimeout(() => scrollToBottom("smooth"), 50);
            }, currentDelay);
            activeTimeoutsRef.current.push(tMsg);
          });

          currentDelay += 1500;
          const tSuccess = setTimeout(() => {
            setShowSuccessScreen(true);
          }, currentDelay);
          activeTimeoutsRef.current.push(tSuccess);
        }
      }
    }

    return () => clearTimeouts();
  }, [step, done, animateNext]);

  // ── Input & Validation Helpers ───────────────────────────────────────────────
  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (value.trim()) {
      setErrors(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleMiniOkClick = (key: string, idx: number) => {
    const steps = getSteps(formData);
    const activeCard = steps[step].card;
    let isOptional = false;
    if (activeCard && activeCard.type === "textCard") {
      isOptional = activeCard.fields[idx]?.optional || false;
    }

    const val = formData[key as keyof typeof formData];
    if (!isOptional && typeof val === "string" && !val.trim()) {
      setErrors(prev => ({ ...prev, [key]: true }));
      const inputEl = document.querySelector(`[name="${key}"]`) as HTMLInputElement | HTMLTextAreaElement;
      if (inputEl) inputEl.focus();
      return;
    }
    setErrors(prev => ({ ...prev, [key]: false }));
    setActiveSubFieldIndex(idx + 1);

    setTimeout(() => {
      if (activeCard && activeCard.type === "textCard") {
        const nextField = activeCard.fields[idx + 1];
        if (nextField) {
          const nextInput = document.querySelector(`[name="${nextField.key}"]`) as HTMLInputElement | HTMLTextAreaElement;
          if (nextInput) {
            nextInput.focus();
          }
        }
      }
      scrollToBottom("smooth");
    }, 50);
  };

  const validateCard = (card: TextCardConfig) => {
    const newErrors = { ...errors };
    let ok = true;
    let firstInvalidKey = "";
    card.fields.forEach(f => {
      const val = formData[f.key as keyof typeof formData];
      const isOptional = f.optional;
      if (!isOptional && (!val || (typeof val === "string" && !val.trim()))) {
        newErrors[f.key] = true;
        ok = false;
        if (!firstInvalidKey) firstInvalidKey = f.key;
      } else {
        newErrors[f.key] = false;
      }
    });
    setErrors(newErrors);
    if (!ok && firstInvalidKey) {
      const inputEl = document.querySelector(`[name="${firstInvalidKey}"]`) as HTMLInputElement | HTMLTextAreaElement;
      if (inputEl) {
        inputEl.focus();
        inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    return ok;
  };

  const handleNextClick = () => {
    const steps = getSteps(formData);
    const activeCard = steps[step].card;

    if (activeCard && activeCard.type === "textCard") {
      const ok = validateCard(activeCard);
      if (!ok) {
        alert("Please complete all required fields.");
        return;
      }
    }

    if (step < steps.length - 1) {
      setAnimateNext(true);
      setStep(prev => prev + 1);
      setActiveSubFieldIndex(0);
    } else {
      setAnimateNext(true);
      setDone(true);
      submitForm(formData);
    }
  };

  const handleBackClick = () => {
    if (step > 0) {
      setAnimateNext(false);
      setStep(prev => prev - 1);
      setActiveSubFieldIndex(0);
      setDone(false);
    }
  };

  const handleOptionClick = (key: string, optionTitle: string, multi: boolean) => {
    if (multi) {
      const currentVal = (formData[key as keyof typeof formData] as string[]) || [];
      let newVal: string[];
      if (currentVal.includes(optionTitle)) {
        newVal = currentVal.filter(v => v !== optionTitle);
      } else {
        newVal = [...currentVal, optionTitle];
      }
      setFormData(prev => ({ ...prev, [key]: newVal }));
    } else {
      setFormData(prev => ({ ...prev, [key]: optionTitle }));
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="inquiry-chat-scoped-container w-full h-full flex flex-col min-h-0 relative">
      <style dangerouslySetInnerHTML={{ __html: `
        .inquiry-chat-scoped-container {
          font-family: Inter, Arial, sans-serif;
          color: #111;
          display: flex;
          flex-direction: column;
        }
        .inquiry-chat-scoped-container .chat-window {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }
        .inquiry-chat-scoped-container .chat-row {
          display: flex;
          flex-direction: column;
        }
        .inquiry-chat-scoped-container .chat-row.wi {
          align-items: flex-start;
        }
        .inquiry-chat-scoped-container .chat-row.client {
          align-items: flex-end;
        }
        .inquiry-chat-scoped-container .chat-row.anim {
          animation: fadeIn .28s cubic-bezier(.22,.61,.36,1) both;
        }
        .inquiry-chat-scoped-container .chat-meta {
          font-size: 13px;
          color: rgba(17,17,17,.55);
          margin-bottom: 6px;
        }
        .inquiry-chat-scoped-container .chat-meta strong {
          color: #111;
          font-weight: 600;
        }
        .inquiry-chat-scoped-container .bubble {
          max-width: 720px;
          padding: 14px 18px;
          border-radius: 16px;
          background: rgba(226,220,214,.72);
          backdrop-filter: blur(10px);
          font-size: 16px;
          line-height: 1.45;
        }
        .inquiry-chat-scoped-container .client .bubble {
          background: rgba(226,220,214,.82);
        }
        .inquiry-chat-scoped-container .emoji-bubble {
          font-size: 28px;
          padding: 18px;
          line-height: 1;
        }
        .inquiry-chat-scoped-container .input-card {
          width: min(720px, 100%);
          padding: 0;
          overflow: hidden;
        }
        .inquiry-chat-scoped-container .field-block {
          padding: 22px 28px;
        }
        .inquiry-chat-scoped-container .field-block label {
          display: block;
          margin-bottom: 10px;
          font-size: 17px;
          font-weight: 500;
          line-height: 1.25;
        }
        .inquiry-chat-scoped-container .field-block input,
        .inquiry-chat-scoped-container .field-block textarea {
          width: 100%;
          border: 1.5px solid rgba(17,17,17,.22);
          background: rgba(255,255,255,.92);
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 16px;
          line-height: 1.35;
          font-family: inherit;
          color: #111;
          outline: none;
          transition: border-color .15s;
        }
        .inquiry-chat-scoped-container .field-block textarea {
          min-height: 112px;
          resize: vertical;
        }
        .inquiry-chat-scoped-container .field-block input::placeholder,
        .inquiry-chat-scoped-container .field-block textarea::placeholder {
          color: rgba(17,17,17,.28);
        }
        .inquiry-chat-scoped-container .field-block input:focus,
        .inquiry-chat-scoped-container .field-block textarea:focus {
          border-color: rgba(17,17,17,.5);
        }
        .inquiry-chat-scoped-container .input-completed {
          background: rgba(255,255,255,.82) !important;
          border-color: rgba(17,17,17,.12) !important;
        }
        .inquiry-chat-scoped-container .input-invalid {
          border-color: rgba(200,0,0,.55) !important;
          background: rgba(255,245,245,.95) !important;
        }
        .inquiry-chat-scoped-container .field-error {
          display: none;
          margin-top: 7px;
          font-size: 13px;
          color: rgba(160,0,0,.85);
        }
        .inquiry-chat-scoped-container .field-error.show {
          display: block;
        }
        .inquiry-chat-scoped-container .field-mini-action {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }
        .inquiry-chat-scoped-container .option-label {
          display: block;
          padding: 22px 28px 18px;
          font-size: 17px;
          font-weight: 500;
          line-height: 1.3;
        }
        .inquiry-chat-scoped-container .option-list {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .inquiry-chat-scoped-container .option-button {
          width: 100%;
          border: none;
          border-top: 1px solid rgba(17,17,17,.08);
          background: rgba(255,255,255,.16);
          padding: 16px 58px 16px 28px;
          text-align: left;
          font-size: 16px;
          font-family: inherit;
          cursor: pointer;
          color: rgba(17,17,17,.62);
          position: relative;
          line-height: 1.35;
          transition: background .12s, color .12s;
        }
        .inquiry-chat-scoped-container .option-button:hover {
          color: #111;
          background: rgba(255,255,255,.34);
        }
        .inquiry-chat-scoped-container .option-button.selected {
          color: #111;
          font-weight: 600;
          background: rgba(255,255,255,.28);
        }
        .inquiry-chat-scoped-container .option-button::after {
          content: '';
          width: 18px;
          height: 18px;
          border: 2px solid rgba(17,17,17,.25);
          border-radius: 4px;
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
        }
        .inquiry-chat-scoped-container .option-button.selected::after {
          content: '✓';
          border-color: #111;
          color: #111;
          font-size: 17px;
          line-height: 14px;
          text-align: center;
          font-weight: 700;
        }
        .inquiry-chat-scoped-container .option-desc {
          display: block;
          font-size: 13px;
          color: rgba(17,17,17,.55);
          margin-top: 4px;
          line-height: 1.35;
          font-weight: 400;
        }
        .inquiry-chat-scoped-container .action-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 16px 28px 20px;
          border-top: 1px solid rgba(17,17,17,.08);
        }
        .inquiry-chat-scoped-container .right-actions {
          margin-left: auto;
          display: flex;
          gap: 10px;
        }
        .inquiry-chat-scoped-container .ok-btn,
        .inquiry-chat-scoped-container .back-btn {
          border: none;
          border-radius: 8px;
          background: rgba(17,17,17,.08);
          color: rgba(17,17,17,.62);
          font-size: 13px;
          padding: 7px 11px;
          cursor: pointer;
          font-family: inherit;
          transition: background .12s, color .12s;
        }
        .inquiry-chat-scoped-container .ok-btn:hover,
        .inquiry-chat-scoped-container .back-btn:hover {
          background: rgba(17,17,17,.14);
          color: #111;
        }
        .inquiry-chat-scoped-container .hidden {
          display: none;
        }
        .inquiry-chat-scoped-container .toast {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%) translateY(80px);
          background: #111;
          color: #fff;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 15px;
          opacity: 0;
          transition: transform .35s cubic-bezier(.22,.61,.36,1), opacity .35s;
          pointer-events: none;
          z-index: 999;
        }
        .inquiry-chat-scoped-container .toast.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
        .inquiry-chat-scoped-container .toast.error {
          background: rgba(160,0,0,.9);
        }
        
        /* Success Screen CSS */
        .inquiry-chat-scoped-container .success-screen-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px 24px;
          flex: 1;
          width: 100%;
          animation: fadeIn .35s cubic-bezier(.22,.61,.36,1) both;
        }
        .inquiry-chat-scoped-container .success-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          background: rgba(17, 17, 17, 0.05);
          border: 1.5px solid rgba(17, 17, 17, 0.12);
          animation: fadeIn .35s cubic-bezier(.22,.61,.36,1) both;
          animation-delay: 0.1s;
        }
        .inquiry-chat-scoped-container .success-title {
          font-size: 24px;
          font-weight: 600;
          color: #111;
          margin: 0 0 16px;
          animation: fadeIn .35s cubic-bezier(.22,.61,.36,1) both;
          animation-delay: 0.2s;
        }
        .inquiry-chat-scoped-container .success-desc {
          font-size: 16px;
          color: rgba(17, 17, 17, 0.65);
          line-height: 1.6;
          max-width: 440px;
          margin: 0 0 40px;
          animation: fadeIn .35s cubic-bezier(.22,.61,.36,1) both;
          animation-delay: 0.3s;
        }
        .inquiry-chat-scoped-container .success-btn {
          border: none;
          border-radius: 10px;
          background: #111;
          color: #fff;
          font-size: 15px;
          font-weight: 500;
          padding: 12px 32px;
          cursor: pointer;
          font-family: inherit;
          transition: background .12s, transform .12s;
          animation: fadeIn .35s cubic-bezier(.22,.61,.36,1) both;
          animation-delay: 0.4s;
        }
        .inquiry-chat-scoped-container .success-btn:hover {
          background: rgba(17,17,17,0.85);
        }
        .inquiry-chat-scoped-container .success-btn:active {
          transform: scale(0.98);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media(max-width:768px){
          .inquiry-chat-scoped-container .bubble { max-width: 92%; font-size: 15px; }
          .inquiry-chat-scoped-container .input-card { width: 92%; }
          .inquiry-chat-scoped-container .field-block,
          .inquiry-chat-scoped-container .option-label,
          .inquiry-chat-scoped-container .action-row { padding-left: 20px; padding-right: 20px; }
          .inquiry-chat-scoped-container .field-block label,
          .inquiry-chat-scoped-container .option-label { font-size: 16px; }
          .inquiry-chat-scoped-container .field-block input,
          .inquiry-chat-scoped-container .field-block textarea,
          .inquiry-chat-scoped-container .option-button { font-size: 15px; }
          .inquiry-chat-scoped-container .option-button { padding-right: 54px; }
        }
      ` }} />

      {showSuccessScreen ? (
        <div className="success-screen-container">
          <div className="success-circle">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="success-title">Thank you.</h2>
          <p className="success-desc">
            Your inquiry has been received. We&apos;ll review it carefully and get back to you if it feels like a strong fit.
          </p>
          <div>
            <button
              onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  window.location.href = "/";
                }
              }}
              className="success-btn"
            >
              Okay
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto chat-scroll p-4 md:p-6"
        >
          <div className="chat-window">
            {visibleItems.map((item, idx) => {
              const showMeta = idx === 0 || visibleItems[idx - 1].side !== item.side;
              const showAvatar = shouldShowAvatar(item, idx);

              if (item.type === "typing") {
                return (
                  <div key={`item-${idx}`} className="chat-row wi anim">
                    {showMeta && (
                      <div className="chat-meta">
                        <strong>Widarto Impact</strong>
                      </div>
                    )}
                    <div
                      className="bubble"
                      style={{ background: "rgba(226, 220, 214, 0.72)", backdropFilter: "blur(10px)" }}
                    >
                      <div className="flex items-center gap-1" style={{ padding: "4px 0" }}>
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-typing-dot"
                          style={{ animationDelay: "0ms", background: "rgba(17,17,17,0.35)" }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-typing-dot"
                          style={{ animationDelay: "150ms", background: "rgba(17,17,17,0.35)" }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-typing-dot"
                          style={{ animationDelay: "300ms", background: "rgba(17,17,17,0.35)" }}
                        />
                      </div>
                    </div>
                    {showAvatar && (
                      <div className="mt-1.5 flex justify-start">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-[rgba(17,17,17,0.08)]">
                          <img
                            src="/images/eko-widarto.jpg"
                            alt="Eko"
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (item.type === "bubble") {
                let html = item.html;
                if (html.includes("The pleasure is mine,")) {
                  html = `The pleasure is mine, <span>${fn()}</span>.`;
                }

                return (
                  <div
                    key={`item-${idx}`}
                    className={`chat-row ${item.side} ${item.animate ? "anim" : ""}`}
                  >
                    {showMeta && (
                      <div className="chat-meta">
                        {item.side === "wi" ? (
                          <strong>Widarto Impact</strong>
                        ) : (
                          <strong>You</strong>
                        )}
                      </div>
                    )}
                    <div
                      className={item.emoji ? "bubble emoji-bubble" : "bubble"}
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                    {showAvatar && item.side === "wi" && (
                      <div className="mt-1.5 flex justify-start">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-[rgba(17,17,17,0.08)]">
                          <img
                            src="/images/eko-widarto.jpg"
                            alt="Eko"
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {showAvatar && item.side === "client" && initial && (
                      <div className="mt-1.5 flex justify-end">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                          style={{ background: "rgba(17, 17, 17, 0.75)" }}
                        >
                          {initial}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (item.type === "textCard") {
                const { fields, mode } = item;

                return (
                  <div
                    key={`item-${idx}`}
                    className={`chat-row client ${item.animate ? "anim" : ""}`}
                  >
                    {showMeta && (
                      <div className="chat-meta">
                        <strong>You</strong>
                      </div>
                    )}
                    <div className="bubble input-card">
                      {fields.map((field, fIdx) => {
                        const isBlockVisible = mode === "completed" || fIdx <= activeSubFieldIndex;
                        const isMiniOkVisible = mode === "active" && fIdx === activeSubFieldIndex && fIdx < fields.length - 1;
                        const value = formData[field.key as keyof typeof formData] || "";
                        const isCompleted = (mode === "completed" || (mode === "active" && fIdx < activeSubFieldIndex)) && typeof value === "string" && Boolean(value.trim());
                        const hasError = errors[field.key];

                        return (
                          <div
                            key={field.key}
                            className={`field-block ${isBlockVisible ? "" : "hidden"}`}
                            data-idx={fIdx}
                          >
                            <label>{field.label}</label>
                            {field.textarea ? (
                              <textarea
                                name={field.key}
                                placeholder={field.placeholder || ""}
                                value={value}
                                className={`${isCompleted ? "input-completed" : ""} ${hasError ? "input-invalid" : ""}`}
                                onChange={e => handleFieldChange(field.key, e.target.value)}
                              />
                            ) : (
                              <input
                                type={field.type || "text"}
                                name={field.key}
                                placeholder={field.placeholder || ""}
                                value={value}
                                className={`${isCompleted ? "input-completed" : ""} ${hasError ? "input-invalid" : ""}`}
                                onChange={e => handleFieldChange(field.key, e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (isMiniOkVisible) {
                                      handleMiniOkClick(field.key, fIdx);
                                    } else if (fields.length === 1) {
                                      handleNextClick();
                                    }
                                  }
                                }}
                              />
                            )}
                            <div className={`field-error ${hasError ? "show" : ""}`}>
                              This field is required.
                            </div>

                            {isMiniOkVisible && (
                              <div className="field-mini-action">
                                <button
                                  type="button"
                                  className="ok-btn"
                                  onClick={() => handleMiniOkClick(field.key, fIdx)}
                                >
                                  OK ↳
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {mode === "active" && (fields.length === 1 || activeSubFieldIndex === fields.length - 1) && (
                        <div className="action-row">
                          <button
                            type="button"
                            className="back-btn"
                            style={{ visibility: step === 0 ? "hidden" : "visible" }}
                            onClick={handleBackClick}
                          >
                            ← Back
                          </button>
                          <div className="right-actions">
                            <button
                              type="button"
                              className="ok-btn"
                              onClick={handleNextClick}
                            >
                              OK ↳
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {showAvatar && initial && (
                      <div className="mt-1.5 flex justify-end">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                          style={{ background: "rgba(17, 17, 17, 0.75)" }}
                        >
                          {initial}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (item.type === "optionCard") {
                const { label, dataKey, options, multi, mode } = item;

                return (
                  <div
                    key={`item-${idx}`}
                    className={`chat-row client ${item.animate ? "anim" : ""}`}
                  >
                    {showMeta && (
                      <div className="chat-meta">
                        <strong>You</strong>
                      </div>
                    )}
                    <div className="bubble input-card">
                      <div className="option-label">{label}</div>
                      <div className="option-list">
                        {options.map((opt) => {
                          const isSelected = multi
                            ? ((formData[dataKey as keyof typeof formData] as string[]) || []).includes(opt.title)
                            : formData[dataKey as keyof typeof formData] === opt.title;

                          return (
                            <button
                              key={opt.title}
                              type="button"
                              className={`option-button ${isSelected ? "selected" : ""}`}
                              onClick={() => handleOptionClick(dataKey, opt.title, multi)}
                            >
                              <span>{opt.title}</span>
                              {opt.desc && <span className="option-desc">{opt.desc}</span>}
                            </button>
                          );
                        })}
                      </div>

                      {mode === "active" && (
                        <div className="action-row">
                          <button
                            type="button"
                            className="back-btn"
                            style={{ visibility: step === 0 ? "hidden" : "visible" }}
                            onClick={handleBackClick}
                          >
                            ← Back
                          </button>
                          <div className="right-actions">
                            <button
                              type="button"
                              className="ok-btn"
                              onClick={handleNextClick}
                            >
                              OK ↳
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {showAvatar && initial && (
                      <div className="mt-1.5 flex justify-end">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                          style={{ background: "rgba(17, 17, 17, 0.75)" }}
                        >
                          {initial}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}

      <div className={`toast ${toast.show ? "show" : ""} ${toast.err ? "error" : ""}`}>
        {toast.msg}
      </div>
    </div>
  );
}
