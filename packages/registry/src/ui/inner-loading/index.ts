import { createContext } from "reka-ui";
import type { ComputedRef, Ref } from "vue";

export { default as InnerLoading } from "./InnerLoading.vue";
export { default as InnerLoadingContent } from "./InnerLoadingContent.vue";
export { default as InnerLoadingOverlay } from "./InnerLoadingOverlay.vue";

export const [injectInnerLoadingContext, provideInnerLoadingContext] = createContext<{
  loading: ComputedRef<boolean>;
  content: Ref<HTMLElement | null>;
}>("InnerLoading");
