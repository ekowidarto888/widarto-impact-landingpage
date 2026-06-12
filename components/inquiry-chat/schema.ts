import { getSteps } from "./config";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(
  stepIndex: number,
  formData: Record<string, unknown>,
  fieldKey?: string
): Record<string, string | undefined> {
  const steps = getSteps(formData);
  const step = steps[stepIndex];
  if (!step || !step.card) return {};

  const errors: Record<string, string | undefined> = {};

  if (step.card.type === "option") {
    const val = formData[step.card.dataKey];
    if (step.card.multi) {
      const arr = Array.isArray(val) ? val : [];
      if (arr.length === 0) {
        errors[step.card.dataKey] = "Please select at least one option";
      }
    } else {
      if (!val || (typeof val === "string" && !val.trim())) {
        errors[step.card.dataKey] = "Please select an option";
      }
    }
    return errors;
  }

  if (step.card.type === "text") {
    // If a specific fieldKey is provided, validate only that field
    // Otherwise validate all visible fields
    const fieldsToValidate = fieldKey
      ? step.card.fields.filter((f) => f.key === fieldKey)
      : step.card.fields;

    for (const field of fieldsToValidate) {
      const text = String(formData[field.key] || "").trim();
      if (!text) {
        errors[field.key] = "This field is required";
      }
      if (field.type === "email" && text) {
        if (!EMAIL_RE.test(text)) {
          errors[field.key] = "Please enter a valid email address";
        }
      }
    }
    return errors;
  }

  return errors;
}
