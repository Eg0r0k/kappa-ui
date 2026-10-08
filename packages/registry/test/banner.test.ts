import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { h } from "vue";

import { Banner, BannerActions, BannerClose, BannerSubtitle, BannerTitle } from "@/ui/banner";

const render = (props: Record<string, unknown> = {}, close = true) =>
  mount(Banner, {
    props,
    slots: {
      default: () => [
        h(BannerTitle, () => "kappa-ui 0.15"),
        h(BannerSubtitle, () => "Tour, Banner and Marker are in."),
        h(BannerActions, () => h("button", "Read more")),
        close ? h(BannerClose) : null,
      ],
    },
    attachTo: document.body,
  });

const banner = () => document.querySelector<HTMLElement>("[data-slot=banner]");

const probe = (className: string, color: string) => {
  const element = document.createElement("span");
  element.dataset.slot = "probe";
  element.dataset.color = color;
  element.className = className;
  document.body.append(element);
  return getComputedStyle(element);
};

describe("Banner", () => {
  it("fills with its tone, primary by default", () => {
    render();
    const style = getComputedStyle(banner()!);
    expect(banner()!.dataset.color).toBe("primary");
    expect(style.backgroundColor).toBe(probe("bg-tone", "primary").backgroundColor);
    expect(style.color).toBe(probe("text-tone-foreground", "primary").color);

    document.body.innerHTML = "";
    render({ color: "success" });
    expect(banner()!.dataset.color).toBe("success");
  });

  it("closes from BannerClose and reports it", async () => {
    const onUpdate = vi.fn();
    render({ "onUpdate:open": onUpdate });
    const close = document.querySelector<HTMLElement>("[data-slot=banner-close]")!;
    expect(close.tagName).toBe("BUTTON");
    expect(close.getAttribute("aria-label")).toBe("Close");

    await userEvent.click(close);
    await expect.poll(() => banner()).toBeNull();
    expect(onUpdate).toHaveBeenCalledWith(false);
  });

  it("stays hidden while open is false", () => {
    render({ open: false });
    expect(banner()).toBeNull();
  });

  it("keeps the content centred around the close button", () => {
    render();
    const withClose = getComputedStyle(banner()!);
    expect([withClose.paddingLeft, withClose.paddingRight]).toEqual(["48px", "48px"]);

    document.body.innerHTML = "";
    render({}, false);
    const without = getComputedStyle(banner()!);
    expect([without.paddingLeft, without.paddingRight]).toEqual(["16px", "16px"]);
  });
});
