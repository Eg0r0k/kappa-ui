import type { UseTourReturn } from "@kappa-ui/core/tour";
import { createContext } from "reka-ui";

export { default as Tour } from "./Tour.vue";
export { default as TourClose } from "./TourClose.vue";
export { default as TourContent } from "./TourContent.vue";
export { default as TourDescription } from "./TourDescription.vue";
export { default as TourFooter } from "./TourFooter.vue";
export { default as TourNext } from "./TourNext.vue";
export { default as TourPrev } from "./TourPrev.vue";
export { default as TourProgress } from "./TourProgress.vue";
export { default as TourTitle } from "./TourTitle.vue";
export { type TourStep, type TourTarget, type UseTourOptions, type UseTourReturn, useTour } from "@kappa-ui/core/tour";

export const [injectTourContext, provideTourContext] = createContext<{
  tour: UseTourReturn;
  titleId: string;
  descriptionId: string;
  restoreFocus: () => void;
}>("Tour");
