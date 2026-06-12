import type { Option, StepConfig, Prompt } from "./types";

export const SUPPORT_OPTIONS: Option[] = [
  { title: "Brand Audit" },
  { title: "Brand Creation" },
  { title: "Brand Refresh" },
  { title: "Repositioning" },
  { title: "Brand Identity" },
  { title: "Packaging Design System" },
  { title: "Product Range Extension" },
  { title: "Launch / Go-to-Market Assets" },
  { title: "Not sure yet" },
];

export const PROJECT_OPTIONS: Option[] = [
  { title: "A new brand" },
  { title: "An existing brand preparing for launch" },
  { title: "A brand refresh" },
  { title: "A product line extension" },
  { title: "A repositioning project" },
  { title: "Something else" },
];

export const KICKOFF_OPTIONS: Option[] = [
  { title: "ASAP, somewhere within the next 2 weeks" },
  { title: "Soon, next month would be fantastic" },
  { title: "Within the next 3 months, at the latest" },
  { title: "No rush, whatever works best for your team" },
];

export const COMPLETION_OPTIONS: Option[] = [
  { title: "In 3 months" },
  { title: "Within the next 6 months" },
  { title: "In about a year" },
  { title: "Not sure yet" },
];

export const BUDGET_OPTIONS: Option[] = [
  { title: "USD 10,000 to 15,000", desc: "Focused single-scope engagement" },
  { title: "USD 15,000 to 30,000", desc: "Focused brand or packaging project, usually around 1 to 4 SKUs" },
  { title: "USD 30,000 to 50,000", desc: "Brand identity and packaging system, usually around 4 to 8 SKUs" },
  { title: "USD 50,000 to 100,000", desc: "Product range or portfolio transformation, usually around 8 to 15+ SKUs" },
  { title: "USD 100,000+", desc: "Multi-category brand system engagement" },
  { title: "Not sure yet, but we are ready to invest in the right scope" },
];

export const SOURCE_OPTIONS: Option[] = [
  { title: "A client referral" },
  { title: "A friend or colleague" },
  { title: "Google" },
  { title: "Instagram" },
  { title: "LinkedIn" },
  { title: "Behance" },
  { title: "World Brand Design Society" },
  { title: "I've been following your work for some time" },
  { title: "Other" },
];

function getGreeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function getIntroMessages(): Prompt[] {
  const greeting = getGreeting();
  return [
    { side: "wi", text: `${greeting}.` },
    { side: "wi", text: "I'm Eko, Founder and Creative Director of Widarto Impact." },
    { side: "client", text: "👋", emoji: true },
    { side: "client", text: "Nice to meet you, Eko." },
  ];
}

export function getClosingMessages(): Prompt[] {
  return [
    { side: "wi", text: "Perfect. Thank you for sharing." },
    { side: "wi", text: "We'll review your inquiry carefully and get back to you with the best next step if the project aligns." },
    { side: "client", text: "Sounds good." },
    { side: "wi", text: "Speak soon." },
  ];
}

function firstName(formData: Record<string, unknown>): string {
  return String(formData.fullName || "there").split(" ")[0];
}

export function getSteps(formData: Record<string, unknown>): StepConfig[] {
  const fn = firstName(formData);
  return [
    {
      id: 0,
      prompts: [],
      card: {
        type: "text",
        fields: [
          { key: "fullName", label: "My name is", placeholder: "Joko" },
          { key: "role", label: "I'm a", placeholder: "Marketing Director" },
          { key: "company", label: "at", placeholder: "ACME Corp" },
          { key: "website", label: "Our website or social media is", placeholder: "https://..." },
        ],
        showBack: false,
      },
    },
    {
      id: 1,
      prompts: [
        { side: "wi", text: "The pleasure is mine, {{firstName}}." },
        { side: "wi", text: "<strong>What kind of support are you looking for?</strong>" },
      ],
      card: {
        type: "option",
        label: "I am seeking a partner to help me with:",
        dataKey: "support",
        options: SUPPORT_OPTIONS,
        multi: true,
        showBack: true,
      },
    },
    {
      id: 2,
      prompts: [
        { side: "wi", text: "You came to the right place." },
        { side: "wi", text: "<strong>Let's understand the ambition behind the project.</strong>" },
      ],
      card: {
        type: "option",
        label: "My project is:",
        dataKey: "projectType",
        options: PROJECT_OPTIONS,
        multi: false,
        showBack: true,
      },
    },
    {
      id: 3,
      prompts: [],
      card: {
        type: "text",
        fields: [
          { key: "category", label: "My category / industry is", placeholder: "Beverage, skincare, snacks, wellness..." },
          { key: "wishTo", label: "I wish to", placeholder: "Tell us what you want to build, change, or improve", textarea: true },
          { key: "challenge", label: "Our main challenge right now is", placeholder: "Tell us what feels unclear, underperforming, or ready to evolve", textarea: true },
        ],
        showBack: true,
      },
    },
    {
      id: 4,
      prompts: [
        { side: "wi", text: "Understood. That gives us a clearer picture." },
        { side: "wi", text: "<strong>When would you like to kick off the project?</strong>" },
      ],
      card: {
        type: "option",
        label: "We can start:",
        dataKey: "kickOff",
        options: KICKOFF_OPTIONS,
        multi: false,
        showBack: true,
      },
    },
    {
      id: 5,
      prompts: [
        { side: "wi", text: "<strong>And when would you like to see the project completed?</strong>" },
      ],
      card: {
        type: "option",
        label: "I'm aiming for:",
        dataKey: "completion",
        options: COMPLETION_OPTIONS,
        multi: false,
        showBack: true,
      },
    },
    {
      id: 6,
      prompts: [
        { side: "wi", text: "And to wrap up..." },
        { side: "wi", text: "<strong>What budget range did you have in mind for this whole mandate?</strong>" },
      ],
      card: {
        type: "option",
        label: "I would say:",
        dataKey: "budget",
        options: BUDGET_OPTIONS,
        multi: false,
        showBack: true,
      },
    },
    {
      id: 7,
      prompts: [
        { side: "wi", text: "Great. We'll review the project with our team and get back to you shortly." },
        { side: "wi", text: "<strong>Can I get your email address for follow-up?</strong>" },
      ],
      card: {
        type: "text",
        fields: [
          { key: "email", label: "You can reach me at", placeholder: "you@email.com", type: "email" },
        ],
        showBack: true,
      },
    },
    {
      id: 8,
      prompts: [
        { side: "wi", text: "Thank you." },
        { side: "wi", text: "One quick question before we wrap up." },
        { side: "wi", text: "<strong>How did you hear about Widarto Impact?</strong>" },
      ],
      card: {
        type: "option",
        label: "I found you through:",
        dataKey: "source",
        options: SOURCE_OPTIONS,
        multi: false,
        showBack: true,
      },
    },
  ];
}

export const TOTAL_STEPS = 9;
