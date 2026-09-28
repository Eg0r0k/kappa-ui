import { afterEach, describe, expect, it } from "vitest";

const classes = {
  xs: "shadow-shadow-xs",
  sm: "shadow-shadow-sm",
  md: "shadow-shadow-md",
  lg: "shadow-shadow-lg",
  xl: "shadow-shadow-xl",
} as const;

afterEach(() => {
  document.body.innerHTML = "";
});

const render = (className: string) => {
  const element = document.createElement("div");
  element.className = className;
  document.body.append(element);
  return element;
};

describe("shadow tokens", () => {
  it.each(Object.entries(classes))("draws %s from its token", (size, className) => {
    const element = render(className);
    element.style.setProperty(`--shadow-${size}`, "0 0 0 5px rgb(255, 0, 0)");
    expect(getComputedStyle(element).boxShadow).toContain("rgb(255, 0, 0) 0px 0px 0px 5px");
  });

  it("defaults to Tailwind's shadow scale", () => {
    expect(getComputedStyle(render(classes.lg)).boxShadow).toContain(
      "oklch(0 0 0 / 0.1) 0px 10px 15px -3px, oklch(0 0 0 / 0.1) 0px 4px 6px -4px",
    );
  });
});
