import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge, validators } from "tailwind-merge";

const typescale = ["display", "headline", "title", "body", "label"].flatMap((role) =>
  ["lg", "md", "sm"].map((size) => `${role}-${size}`),
);

const twMerge = extendTailwindMerge<"icon-size">({
  extend: {
    theme: { text: typescale },
    classGroups: { "icon-size": [{ "icon-size": [validators.isAny] }] },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
