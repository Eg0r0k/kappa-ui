import type { TooltipRole } from "./context";

const isDev = Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV);
const warned = new Set<string>();

export const warnOnce = (key: string, message: string) => {
  if (!isDev || warned.has(key)) return;
  warned.add(key);
  console.warn(`[kappa-ui] Tooltip: ${message}`);
};

export const hasOwnName = (el: HTMLElement) =>
  Boolean(el.getAttribute("aria-label")?.trim() || el.hasAttribute("aria-labelledby") || el.textContent?.trim());

export const inspectTrigger = (el: HTMLElement, role: TooltipRole) => {
  if (el.matches(":disabled"))
    warnOnce(
      "disabled",
      'the trigger is natively disabled, so it gets no pointer events or focus and the tooltip never opens. Use aria-disabled="true" instead.',
    );
  if (el.hasAttribute("title"))
    warnOnce("title", "the trigger has a title attribute, so the browser shows its own tooltip as well. Remove it.");
  if (role === "label" && !hasOwnName(el))
    warnOnce(
      "label",
      'role="label" leaves the tooltip\'s text out of the description, but the trigger has no accessible name. Give it an aria-label.',
    );
};
