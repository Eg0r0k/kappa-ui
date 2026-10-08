import { createContext } from "reka-ui";

export { default as Banner } from "./Banner.vue";
export { default as BannerActions } from "./BannerActions.vue";
export { default as BannerClose } from "./BannerClose.vue";
export { default as BannerSubtitle } from "./BannerSubtitle.vue";
export { default as BannerTitle } from "./BannerTitle.vue";

export type BannerColor = "primary" | "neutral" | "destructive" | "success" | "warning" | "info";

export const [injectBannerContext, provideBannerContext] = createContext<{ close: () => void }>("Banner");
