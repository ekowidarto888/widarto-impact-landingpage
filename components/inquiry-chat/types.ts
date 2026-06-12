export type Mode = "modal" | "inline";

export type BubbleSide = "wi" | "client";

export interface TextField {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}

export interface Option {
  title: string;
  desc?: string;
}

export interface Prompt {
  side: BubbleSide;
  text: string;
  emoji?: boolean;
}

export type CardConfig =
  | { type: "text"; fields: TextField[]; showBack: boolean }
  | {
      type: "option";
      label: string;
      dataKey: string;
      options: Option[];
      multi: boolean;
      showBack: boolean;
    };

export interface StepConfig {
  id: number;
  prompts: Prompt[];
  card: CardConfig | null;
}

export interface InquiryChatProps {
  mode?: Mode;
  onClose?: () => void;
}

/* ─── Chat Message Types ─── */

export type ChatMessage =
  | { id: string; role: "wi"; text: string; emoji?: boolean }
  | { id: string; role: "user"; text: string; fieldKey?: string }
  | { id: string; role: "completed-text"; fields: { key: string; label: string; value: string }[]; stepIndex: number }
  | { id: string; role: "completed-option"; label: string; dataKey: string; options: Option[]; selected: string[]; multi: boolean; stepIndex: number };

/* ─── State Machine ─── */

export type ChatPhase =
  | { type: "intro" }
  | { type: "typing-intro"; promptIndex: number }
  | { type: "typing-prompts"; stepIndex: number; promptIndex: number }
  | { type: "waiting"; stepIndex: number }
  | { type: "submitting" }
  | { type: "typing-closing"; promptIndex: number }
  | { type: "success" }
  | { type: "error"; message: string };

export interface ChatState {
  messages: ChatMessage[];
  phase: ChatPhase;
  currentStep: number;
  currentFieldIndex: number; // For text cards: which field is currently visible/active
  formData: Record<string, unknown>;
  errors: Record<string, string | undefined>;
  isSubmitting: boolean;
}

export type ChatAction =
  | { type: "START" }
  | { type: "INTRO_MESSAGE_TYPED"; text: string; role: "wi" | "user"; emoji?: boolean }
  | { type: "WI_MESSAGE_TYPED"; text: string }
  | { type: "VALIDATE_AND_SEND"; value: string | string[]; fieldKey?: string }
  | { type: "MINI_OK"; fieldKey: string }
  | { type: "CONTINUE_STEP" }
  | { type: "GO_BACK" }
  | { type: "SUBMIT" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "CLOSING_MESSAGE_TYPED"; text: string; role: "wi" | "user"; emoji?: boolean }
  | { type: "SUBMIT_ERROR"; message: string }
  | { type: "RETRY" };
