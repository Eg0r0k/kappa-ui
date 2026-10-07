import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/ui/avatar";

const png = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL();
};

const broken = "data:image/png;base64,AAAA";

const render = (node: () => unknown) => {
  mount({ render: node }, { attachTo: document.body });
  return document.body;
};

const fallback = (root: HTMLElement) => root.querySelector<HTMLElement>("[data-slot=avatar-fallback]");

describe("Avatar", () => {
  it("replaces the fallback with the image once it has loaded", async () => {
    const root = render(() => h(Avatar, () => [h(AvatarImage, { src: png() }), h(AvatarFallback, () => "KP")]));
    await expect.poll(() => fallback(root)).toBeNull();
    expect(getComputedStyle(root.querySelector("img")!).display).not.toBe("none");
  });

  it("keeps the fallback when the image fails", async () => {
    const root = render(() => h(Avatar, () => [h(AvatarImage, { src: broken }), h(AvatarFallback, () => "KP")]));
    await expect.poll(() => root.querySelector("img")?.style.display).toBe("none");
    expect(fallback(root)?.textContent).toBe("KP");
  });

  it("delays the fallback by delayMs", async () => {
    const root = render(() =>
      h(Avatar, () => [h(AvatarImage, { src: broken }), h(AvatarFallback, { delayMs: 150 }, () => "KP")]),
    );
    expect(fallback(root)).toBeNull();
    await expect.poll(() => fallback(root), { timeout: 2000 }).not.toBeNull();
  });

  it.each([
    ["xs", 24],
    ["sm", 32],
    ["md", 40],
    ["lg", 48],
    ["xl", 64],
  ] as const)("is %spx wide at size %s", (size, px) => {
    const root = render(() => h(Avatar, { size }, () => h(AvatarFallback, () => "K")));
    const avatar = root.querySelector<HTMLElement>("[data-slot=avatar]")!;
    expect(avatar.dataset.size).toBe(size);
    expect(Math.round(avatar.getBoundingClientRect().width)).toBe(px);
    expect(Math.round(avatar.getBoundingClientRect().height)).toBe(px);
  });

  it("defaults to md", () => {
    const root = render(() => h(Avatar, () => h(AvatarFallback, () => "K")));
    expect(root.querySelector<HTMLElement>("[data-slot=avatar]")!.dataset.size).toBe("md");
  });
});

describe("AvatarGroup", () => {
  const group = (attrs: Record<string, unknown> = {}) =>
    render(() =>
      h(AvatarGroup, attrs, () => [
        h(Avatar, { size: "sm" }, () => h(AvatarFallback, () => "A")),
        h(Avatar, { size: "sm" }, () => h(AvatarFallback, () => "B")),
        h(AvatarGroupCount, { size: "sm" }, () => "+3"),
      ]),
    ).querySelector<HTMLElement>("[data-slot=avatar-group]")!;

  it("overlaps each member by a quarter of its size and rings it", () => {
    const [first, second, count] = [...group().children] as HTMLElement[];
    expect(getComputedStyle(first!).marginInlineEnd).toBe("-8px");
    expect(getComputedStyle(second!).marginInlineEnd).toBe("-8px");
    expect(getComputedStyle(count!).marginInlineEnd).toBe("0px");
    expect(getComputedStyle(second!).boxShadow).toContain("0px 0px 0px 2px");
    expect(getComputedStyle(count!).boxShadow).toContain("0px 0px 0px 2px");
  });

  it("sizes the count like an avatar", () => {
    const [avatar, , count] = [...group().children] as HTMLElement[];
    expect(count!.dataset.size).toBe("sm");
    expect(count!.getBoundingClientRect().width).toBe(avatar!.getBoundingClientRect().width);
  });

  it("draws the ring in --avatar-ring", () => {
    const [, second] = [...group({ class: "[--avatar-ring:rgb(1,2,3)]" }).children] as HTMLElement[];
    expect(getComputedStyle(second!).boxShadow).toContain("rgb(1, 2, 3)");
  });
});
