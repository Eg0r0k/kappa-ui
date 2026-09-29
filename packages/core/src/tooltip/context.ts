import { createContext } from "reka-ui";
import type { Ref } from "vue";

import { warnOnce } from "./dev";

export type TouchPolicy = "off" | "long-press" | "auto";

export type TooltipRole = "description" | "label";

export type TooltipReason =
  | "trigger-hover"
  | "trigger-focus"
  | "trigger-press"
  | "touch-release"
  | "outside-press"
  | "escape-key"
  | "scroll"
  | "sibling-open"
  | "disabled";

export type TooltipOpenChangeDetails = { reason: TooltipReason; event?: Event };

export interface TooltipProviderProps {
  delay?: number;
  skipDelay?: number;
  restThreshold?: number;
  touch?: TouchPolicy;
  touchDelay?: number;
  touchHideDelay?: number;
  hoverable?: boolean;
  closeOnClick?: boolean;
  disabled?: boolean;
}

export interface TooltipRootProps extends Omit<TooltipProviderProps, "skipDelay"> {
  open?: boolean;
  defaultOpen?: boolean;
  role?: TooltipRole;
}

export type TooltipRootEmits = {
  "update:open": [open: boolean, details: TooltipOpenChangeDetails];
};

export type TooltipSettings = Required<TooltipProviderProps>;

export const tooltipDefaults: TooltipSettings = {
  delay: 600,
  skipDelay: 300,
  restThreshold: 2,
  touch: "auto",
  touchDelay: 500,
  touchHideDelay: 1500,
  hoverable: false,
  closeOnClick: true,
  disabled: false,
};

const policies: TouchPolicy[] = ["off", "long-press", "auto"];

export const resolveTouch = (touch: TouchPolicy): TouchPolicy => {
  if (policies.includes(touch)) return touch;
  warnOnce(`touch:${touch}`, `touch="${touch}" is not one of ${policies.join(", ")}; using "auto".`);
  return "auto";
};

export type TooltipController = {
  open: Readonly<Ref<boolean>>;
  settings: Readonly<Omit<TooltipSettings, "skipDelay">>;
  role: Readonly<Ref<TooltipRole>>;
  closedBy: Readonly<Ref<TooltipReason | undefined>>;
  touch: Readonly<Ref<boolean>>;
  instant: Ref<boolean>;
  forced: Readonly<Ref<number>>;
  isOpening: () => boolean;
  request: (reason: TooltipReason, event?: Event, touch?: boolean) => void;
  hide: (reason: TooltipReason, event?: Event) => void;
};

export const [injectTooltipSettings, provideTooltipSettings] = createContext<TooltipSettings>(
  "TooltipProvider",
  "KappaTooltipSettings",
);

export const [injectTooltipController, provideTooltipController] = createContext<TooltipController>(
  "TooltipRoot",
  "KappaTooltipController",
);
