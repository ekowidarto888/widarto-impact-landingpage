"use client";

import { useReducer, useRef, useCallback, useEffect } from "react";
import { getIntroMessages, getClosingMessages, getSteps, TOTAL_STEPS } from "../config";
import { validateStep } from "../schema";
import type { ChatState, ChatAction, Mode, ChatMessage, StepConfig } from "../types";

const TYPING_SPEED_MS = 25;
const TYPING_BASE_DELAY = 400;
const PROMPT_GAP_MS = 700;

const initialState: ChatState = {
  messages: [],
  phase: { type: "intro" },
  currentStep: 0,
  currentFieldIndex: 0,
  formData: {},
  errors: {},
  isSubmitting: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "START": {
      const intro = getIntroMessages();
      const steps = getSteps({});
      const firstStep = steps[0];
      const hasPrompts = firstStep.prompts.length > 0;

      // Start with typing-intro phase; intro messages will appear one by one
      return {
        ...state,
        messages: [],
        currentStep: 0,
        currentFieldIndex: 0,
        phase: intro.length > 0
          ? { type: "typing-intro", promptIndex: 0 }
          : hasPrompts
            ? { type: "typing-prompts", stepIndex: 0, promptIndex: 0 }
            : { type: "waiting", stepIndex: 0 },
      };
    }

    case "INTRO_MESSAGE_TYPED": {
      const { promptIndex } = state.phase as { type: "typing-intro"; promptIndex: number };
      const intro = getIntroMessages();

      const newMessages: ChatMessage[] = [
        ...state.messages,
        {
          id: `intro-${Date.now()}-${promptIndex}`,
          role: action.role,
          text: action.text,
          emoji: action.emoji,
        },
      ];

      const nextPromptIndex = promptIndex + 1;
      if (intro[nextPromptIndex]) {
        return {
          ...state,
          messages: newMessages,
          phase: { type: "typing-intro", promptIndex: nextPromptIndex },
        };
      }

      // All intro messages typed, move to first step prompts or waiting
      const steps = getSteps({});
      const firstStep = steps[0];
      const hasPrompts = firstStep.prompts.length > 0;

      return {
        ...state,
        messages: newMessages,
        phase: hasPrompts
          ? { type: "typing-prompts", stepIndex: 0, promptIndex: 0 }
          : { type: "waiting", stepIndex: 0 },
      };
    }

    case "WI_MESSAGE_TYPED": {
      const { stepIndex, promptIndex } = state.phase as { type: "typing-prompts"; stepIndex: number; promptIndex: number };
      const steps = getSteps(state.formData);
      const step = steps[stepIndex];

      // Add the typed prompt to messages
      const newMessages: ChatMessage[] = [
        ...state.messages,
        {
          id: `wi-${Date.now()}-${stepIndex}-${promptIndex}`,
          role: "wi",
          text: action.text,
        },
      ];

      // Check if there are more prompts in this step
      const nextPromptIndex = promptIndex + 1;
      if (step.prompts[nextPromptIndex]) {
        return {
          ...state,
          messages: newMessages,
          phase: { type: "typing-prompts", stepIndex, promptIndex: nextPromptIndex },
        };
      }

      // All prompts typed, move to waiting
      return {
        ...state,
        messages: newMessages,
        phase: { type: "waiting", stepIndex },
      };
    }

    case "VALIDATE_AND_SEND": {
      const stepIndex = state.currentStep;
      const steps = getSteps(state.formData);
      const step = steps[stepIndex];
      if (!step || !step.card) return state;

      // Update formData FIRST, then validate the new state
      const newFormData = action.fieldKey
        ? { ...state.formData, [action.fieldKey]: action.value }
        : state.formData;

      const errors = validateStep(stepIndex, newFormData, action.fieldKey);
      if (Object.keys(errors).length > 0) {
        return { ...state, formData: newFormData, errors };
      }

      return {
        ...state,
        formData: newFormData,
        errors: {},
      };
    }

    case "MINI_OK": {
      const stepIndex = state.currentStep;
      const steps = getSteps(state.formData);
      const step = steps[stepIndex];
      if (!step || step.card?.type !== "text") return state;

      const errors = validateStep(stepIndex, state.formData, action.fieldKey);
      if (Object.keys(errors).length > 0) {
        return { ...state, errors };
      }

      const nextFieldIndex = state.currentFieldIndex + 1;
      const totalFields = step.card.fields.length;

      // If there are more fields, advance field index
      if (nextFieldIndex < totalFields) {
        return {
          ...state,
          currentFieldIndex: nextFieldIndex,
          errors: {},
        };
      }

      // All fields filled, this should have been handled by CONTINUE_STEP
      return { ...state, errors: {} };
    }

    case "CONTINUE_STEP": {
      const stepIndex = state.currentStep;
      const steps = getSteps(state.formData);
      const step = steps[stepIndex];
      if (!step || !step.card) return state;

      // Validate all fields in this step
      const errors = validateStep(stepIndex, state.formData);
      if (Object.keys(errors).length > 0) {
        return { ...state, errors };
      }

      // Add completed form to chat history
      let newMessages = state.messages;
      if (step.card.type === "text") {
        const filledFields = step.card.fields
          .map((f) => ({ key: f.key, label: f.label, value: String(state.formData[f.key] || "").trim() }))
          .filter((f) => f.value);
        if (filledFields.length > 0) {
          const completedForm: ChatMessage = {
            id: `completed-text-${Date.now()}-${stepIndex}`,
            role: "completed-text",
            fields: filledFields,
            stepIndex,
          };
          newMessages = [...state.messages, completedForm];
        }
      } else if (step.card.type === "option") {
        const val = state.formData[step.card.dataKey];
        const selected = Array.isArray(val) ? val : val ? [String(val)] : [];
        if (selected.length > 0) {
          const completedForm: ChatMessage = {
            id: `completed-option-${Date.now()}-${stepIndex}`,
            role: "completed-option",
            label: step.card.label,
            dataKey: step.card.dataKey,
            options: step.card.options,
            selected,
            multi: step.card.multi,
            stepIndex,
          };
          newMessages = [...state.messages, completedForm];
        }
      }

      const nextStep = stepIndex + 1;
      if (nextStep >= TOTAL_STEPS) {
        // Last step completed — submit directly (no review)
        return {
          ...state,
          messages: newMessages,
          phase: { type: "submitting" },
          isSubmitting: true,
          errors: {},
        };
      }

      const nextStepConfig = steps[nextStep];
      const hasPrompts = nextStepConfig.prompts.length > 0;

      return {
        ...state,
        messages: newMessages,
        currentStep: nextStep,
        currentFieldIndex: 0,
        phase: hasPrompts
          ? { type: "typing-prompts", stepIndex: nextStep, promptIndex: 0 }
          : { type: "waiting", stepIndex: nextStep },
        errors: {},
      };
    }

    case "GO_BACK": {
      const stepIndex = state.currentStep;
      const prevStep = Math.max(0, stepIndex - 1);

      // Remove messages from current step (WI messages and completed forms)
      let newMessages = [...state.messages];
      const stepMessagesStart = newMessages.findLastIndex(
        (m) => m.id.startsWith(`wi-`) && m.id.includes(`-${stepIndex}-`)
      );
      if (stepMessagesStart >= 0) {
        newMessages = newMessages.slice(0, stepMessagesStart);
      }
      // Also remove completed forms for current and previous steps
      newMessages = newMessages.filter(
        (m) =>
          !(
            (m.role === "completed-text" || m.role === "completed-option") &&
            (m.stepIndex === stepIndex || m.stepIndex === prevStep)
          )
      );

      // Remove formData for current and previous step
      const steps = getSteps(state.formData);
      const newFormData = { ...state.formData };
      const currentStepConfig = steps[stepIndex];
      const prevStepConfig = steps[prevStep];

      if (currentStepConfig?.card?.type === "text") {
        currentStepConfig.card.fields.forEach((f) => delete newFormData[f.key]);
      } else if (currentStepConfig?.card?.type === "option") {
        delete newFormData[currentStepConfig.card.dataKey];
      }

      if (prevStepConfig?.card?.type === "text") {
        prevStepConfig.card.fields.forEach((f) => delete newFormData[f.key]);
      } else if (prevStepConfig?.card?.type === "option") {
        delete newFormData[prevStepConfig.card.dataKey];
      }

      const hasPrompts = prevStepConfig.prompts.length > 0;

      return {
        ...state,
        messages: newMessages,
        formData: newFormData,
        currentStep: prevStep,
        currentFieldIndex: 0,
        phase: hasPrompts
          ? { type: "typing-prompts", stepIndex: prevStep, promptIndex: 0 }
          : { type: "waiting", stepIndex: prevStep },
        errors: {},
      };
    }

    case "SUBMIT": {
      return { ...state, phase: { type: "submitting" }, isSubmitting: true };
    }

    case "SUBMIT_SUCCESS": {
      const closing = getClosingMessages();
      const first = closing[0];
      // Push first closing message, then type the rest one by one
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: `close-${Date.now()}-0`,
            role: first.side === "wi" ? "wi" : "user",
            text: first.text,
          },
        ],
        phase: closing.length > 1
          ? { type: "typing-closing", promptIndex: 1 }
          : { type: "success" },
        isSubmitting: false,
      };
    }

    case "CLOSING_MESSAGE_TYPED": {
      const { promptIndex } = state.phase as { type: "typing-closing"; promptIndex: number };
      const closing = getClosingMessages();

      const newMessages: ChatMessage[] = [
        ...state.messages,
        {
          id: `close-${Date.now()}-${promptIndex}`,
          role: action.role,
          text: action.text,
        },
      ];

      const nextPromptIndex = promptIndex + 1;
      if (closing[nextPromptIndex]) {
        return {
          ...state,
          messages: newMessages,
          phase: { type: "typing-closing", promptIndex: nextPromptIndex },
        };
      }

      return {
        ...state,
        messages: newMessages,
        phase: { type: "success" },
      };
    }

    case "SUBMIT_ERROR": {
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: `wi-err-${Date.now()}`,
            role: "wi",
            text: "Sorry, something went wrong while sending your inquiry.",
          },
        ],
        phase: { type: "error", message: action.message },
        isSubmitting: false,
      };
    }

    case "RETRY": {
      return {
        ...state,
        phase: { type: "waiting", stepIndex: TOTAL_STEPS - 1 },
        errors: {},
      };
    }

    default:
      return state;
  }
}

/* ─── Hook ─── */

export function useChatEngine(mode: Mode, onClose?: () => void) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const formDataRef = useRef(state.formData);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync
  useEffect(() => {
    formDataRef.current = state.formData;
  }, [state.formData]);

  // Typing effect side-effect (intro + step prompts)
  useEffect(() => {
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (state.phase.type === "typing-intro") {
      const { promptIndex } = state.phase;
      const intro = getIntroMessages();
      const prompt = intro[promptIndex];
      if (!prompt) return;

      const delay = promptIndex === 0
        ? TYPING_BASE_DELAY + prompt.text.length * TYPING_SPEED_MS
        : PROMPT_GAP_MS + prompt.text.length * TYPING_SPEED_MS;

      typingTimeoutRef.current = setTimeout(() => {
        dispatch({
          type: "INTRO_MESSAGE_TYPED",
          text: prompt.text,
          role: prompt.side === "wi" ? "wi" : "user",
          emoji: prompt.emoji,
        });
        typingTimeoutRef.current = null;
      }, delay);

      return () => {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      };
    }

    if (state.phase.type === "typing-closing") {
      const { promptIndex } = state.phase;
      const closing = getClosingMessages();
      const prompt = closing[promptIndex];
      if (!prompt) return;

      const delay = promptIndex === 0
        ? TYPING_BASE_DELAY + prompt.text.length * TYPING_SPEED_MS
        : PROMPT_GAP_MS + prompt.text.length * TYPING_SPEED_MS;

      typingTimeoutRef.current = setTimeout(() => {
        dispatch({
          type: "CLOSING_MESSAGE_TYPED",
          text: prompt.text,
          role: prompt.side === "wi" ? "wi" : "user",
          emoji: prompt.emoji,
        });
        typingTimeoutRef.current = null;
      }, delay);

      return () => {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      };
    }

    if (state.phase.type !== "typing-prompts") return;

    const { stepIndex, promptIndex } = state.phase;
    const steps = getSteps(state.formData);
    const step = steps[stepIndex];
    const prompt = step?.prompts[promptIndex];
    if (!prompt) return;

    const delay = promptIndex === 0
      ? TYPING_BASE_DELAY + prompt.text.length * TYPING_SPEED_MS
      : PROMPT_GAP_MS + prompt.text.length * TYPING_SPEED_MS;

    typingTimeoutRef.current = setTimeout(() => {
      dispatch({ type: "WI_MESSAGE_TYPED", text: prompt.text });
      typingTimeoutRef.current = null;
    }, delay);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [state.phase, state.formData]);

  // Auto-scroll only when new messages are added
  const messagesLength = state.messages.length;
  const prevMessagesLengthRef = useRef(messagesLength);

  useEffect(() => {
    const hasNewMessages = messagesLength > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messagesLength;

    if (!hasNewMessages) return;
    if (!isNearBottomRef.current) return;

    const container = chatContainerRef.current;
    if (!container) return;

    const scrollable = container.querySelector('.chat-scroll') as HTMLElement | null;
    if (!scrollable) return;

    const raf = requestAnimationFrame(() => {
      scrollable.scrollTo({ top: scrollable.scrollHeight, behavior: "smooth" });
    });

    return () => cancelAnimationFrame(raf);
  }, [messagesLength]);

  // Track scroll position
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const scrollable = container.querySelector('.chat-scroll') as HTMLElement | null;
    if (!scrollable) return;

    const handleScroll = () => {
      const threshold = 100;
      isNearBottomRef.current =
        scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight < threshold;
    };

    scrollable.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollable.removeEventListener("scroll", handleScroll);
  }, []);

  const start = useCallback(() => {
    dispatch({ type: "START" });
  }, []);

  const send = useCallback((value: string | string[], fieldKey?: string) => {
    dispatch({ type: "VALIDATE_AND_SEND", value, fieldKey });
  }, []);

  const miniOk = useCallback((fieldKey: string) => {
    dispatch({ type: "MINI_OK", fieldKey });
  }, []);

  const continueStep = useCallback(() => {
    dispatch({ type: "CONTINUE_STEP" });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: "GO_BACK" });
  }, []);

  const submit = useCallback(async () => {
    dispatch({ type: "SUBMIT" });

    try {
      const payload = {
        ...formDataRef.current,
        support: Array.isArray(formDataRef.current.support)
          ? formDataRef.current.support
          : [],
        otherServiceDetails: "",
        specificInvestmentDetails: "",
        additionalNotes: "",
      };

      const response = await fetch("/api/send-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        dispatch({ type: "SUBMIT_SUCCESS" });
      } else {
        dispatch({ type: "SUBMIT_ERROR", message: "Failed to send. Please try again." });
      }
    } catch {
      dispatch({ type: "SUBMIT_ERROR", message: "Network error. Please check your connection and try again." });
    }
  }, []);

  const retry = useCallback(() => {
    dispatch({ type: "RETRY" });
  }, []);

  const steps = getSteps(state.formData);
  const currentStep = state.currentStep;
  const currentStepConfig = steps[currentStep];

  return {
    mode,
    onClose,
    state,
    currentStep,
    currentStepConfig,
    steps,
    chatContainerRef,
    start,
    send,
    miniOk,
    continueStep,
    goBack,
    submit,
    retry,
  };
}

export type ChatEngine = ReturnType<typeof useChatEngine>;
