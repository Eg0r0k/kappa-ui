import { afterEach, beforeEach } from "vitest";

export const controlSizes = ["xs", "sm", "md", "lg", "xl"] as const;
export type ControlSize = (typeof controlSizes)[number];

export const sentinel = {
  height: { xs: 61, sm: 62, md: 63, lg: 64, xl: 65 },
  padding: { xs: 21, sm: 22, md: 23, lg: 24, xl: 25 },
  icon: { xs: 11, sm: 12, md: 13, lg: 14, xl: 15 },
  gap: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
} satisfies Record<string, Record<ControlSize, number>>;

const tokens = Object.entries(sentinel).flatMap(([kind, values]) =>
  controlSizes.map((size) => [`--control-${kind}-${size}`, `${values[size]}px`] as const),
);

export const overrideControlTokens = () => {
  beforeEach(() => {
    for (const [name, value] of tokens) document.documentElement.style.setProperty(name, value);
  });
  afterEach(() => {
    for (const [name] of tokens) document.documentElement.style.removeProperty(name);
  });
};

export const px = (value: string) => Number.parseFloat(value);
