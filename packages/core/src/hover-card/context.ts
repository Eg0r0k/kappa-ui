import { type FocusOutsideEvent, type PointerDownOutsideEvent, createContext } from "reka-ui";
import type { Ref } from "vue";

import type { TouchPolicy } from "../internal/long-press";

export type { TouchPolicy };

export type HoverCardReason =
  "trigger-hover" | "trigger-focus" | "trigger-press" | "outside-press" | "escape-key" | "scroll" | "disabled";

export type HoverCardOpenChangeDetails = { reason: HoverCardReason; event?: Event };

export interface HoverCardRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  openDelay?: number;
  closeDelay?: number;
  restThreshold?: number;
  touch?: TouchPolicy;
  touchDelay?: number;
  disabled?: boolean;
}

export type HoverCardRootEmits = {
  "update:open": [open: boolean, details: HoverCardOpenChangeDetails];
};

export type HoverCardContentEmits = {
  escapeKeyDown: [event: KeyboardEvent];
  pointerDownOutside: [event: PointerDownOutsideEvent];
  focusOutside: [event: FocusOutsideEvent];
  interactOutside: [event: PointerDownOutsideEvent | FocusOutsideEvent];
};

export type HoverCardSettings = Required<Omit<HoverCardRootProps, "open" | "defaultOpen">>;

export const hoverCardDefaults: HoverCardSettings = {
  openDelay: 700,
  closeDelay: 300,
  restThreshold: 2,
  touch: "auto",
  touchDelay: 500,
  disabled: false,
};

export type HoverCardController = {
  open: Readonly<Ref<boolean>>;
  touch: Readonly<Ref<boolean>>;
  settings: Readonly<HoverCardSettings>;
  closedBy: Readonly<Ref<HoverCardReason | undefined>>;
  request: (reason: HoverCardReason, event?: Event) => void;
  cancel: () => void;
  expectClose: (reason: HoverCardReason, event?: Event) => void;
  show: (reason: HoverCardReason, event?: Event) => void;
  hide: (reason: HoverCardReason, event?: Event) => void;
};

export const [injectHoverCardController, provideHoverCardController] = createContext<HoverCardController>(
  "HoverCardRoot",
  "KappaHoverCardController",
);
