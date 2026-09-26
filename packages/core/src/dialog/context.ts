import { createContext } from "reka-ui";
import { type Ref, ref } from "vue";

export type DialogContentParts = { titles: Ref<number>; descriptions: Ref<number> };

export const [injectDialogContentParts, provideDialogContentParts] =
  createContext<DialogContentParts>("DialogContentParts");

export const createDialogContentParts = (): DialogContentParts => ({ titles: ref(0), descriptions: ref(0) });
