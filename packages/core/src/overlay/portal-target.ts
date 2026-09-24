import { createContext } from "reka-ui";
import type { Ref } from "vue";

export const [injectOverlayPortalTarget, provideOverlayPortalTarget] =
  createContext<Ref<HTMLElement | undefined>>("OverlayPortalTarget");
