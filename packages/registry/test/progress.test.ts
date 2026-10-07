import { mount } from "@vue/test-utils";
import { ConfigProvider } from "reka-ui";
import { describe, expect, it } from "vitest";
import { h, nextTick } from "vue";

import { Progress, ProgressLabel, ProgressValue } from "@/ui/progress";

const render = (
  props: Record<string, unknown> = {},
  slots: Record<string, () => unknown> = {},
  dir: "ltr" | "rtl" = "ltr",
) => {
  document.body.innerHTML = "";
  mount(
    {
      render: () =>
        h(ConfigProvider, { dir }, () =>
          h("div", { dir, style: "width: 400px; height: 200px; --primary: rgb(1, 2, 3); --success: rgb(0, 128, 0)" }, [
            h(Progress, props, slots),
          ]),
        ),
    },
    { attachTo: document.body },
  );
  const find = (slot: string) => document.querySelector<HTMLElement>(`[data-slot=${slot}]`)!;
  return {
    root: find("progress"),
    track: find("progress-track"),
    indicator: find("progress-indicator"),
    status: find("progress-status"),
  };
};

describe("Progress", () => {
  it("is indeterminate and animated by default", () => {
    const { track, indicator } = render();
    expect(track.getAttribute("role")).toBe("progressbar");
    expect(track.dataset.state).toBe("indeterminate");
    expect(track.hasAttribute("aria-valuenow")).toBe(false);
    expect(getComputedStyle(indicator).animationName).toBe("kappa-progress-carousel");
  });

  it.each([
    ["carousel-inverse", "kappa-progress-carousel-inverse"],
    ["swing", "kappa-progress-swing"],
    ["elastic", "kappa-progress-elastic"],
  ])("runs the %s animation", (animation, name) => {
    expect(getComputedStyle(render({ animation }).indicator).animationName).toBe(name);
  });

  it("mirrors the carousels in rtl and turns them for vertical bars", () => {
    expect(getComputedStyle(render({}, {}, "rtl").indicator).animationName).toBe("kappa-progress-carousel-rtl");
    expect(getComputedStyle(render({ animation: "carousel-inverse" }, {}, "rtl").indicator).animationName).toBe(
      "kappa-progress-carousel-inverse-rtl",
    );
    expect(getComputedStyle(render({ orientation: "vertical" }).indicator).animationName).toBe(
      "kappa-progress-carousel-vertical",
    );
    expect(getComputedStyle(render({ orientation: "vertical", animation: "swing" }).indicator).animationName).toBe(
      "kappa-progress-swing-vertical",
    );
  });

  it("stops animating once there is a value", () => {
    expect(getComputedStyle(render({ modelValue: 10 }).indicator).animationName).toBe("none");
  });

  it("shifts the indicator by the missing share", () => {
    const { track, indicator } = render({ modelValue: 40 });
    expect(track.getAttribute("aria-valuenow")).toBe("40");
    expect(track.dataset.state).toBe("loading");
    expect(indicator.style.transform).toBe("translateX(-60%)");
  });

  it("shifts from the other end when inverted, in rtl and vertically", () => {
    expect(render({ modelValue: 40, inverted: true }).indicator.style.transform).toBe("translateX(60%)");
    expect(render({ modelValue: 40 }, {}, "rtl").indicator.style.transform).toBe("translateX(60%)");
    expect(render({ modelValue: 40, inverted: true }, {}, "rtl").indicator.style.transform).toBe("translateX(-60%)");
    expect(render({ modelValue: 40, orientation: "vertical" }).indicator.style.transform).toBe("translateY(-60%)");
    expect(render({ modelValue: 40, orientation: "vertical", inverted: true }).indicator.style.transform).toBe(
      "translateY(60%)",
    );
  });

  it("scales to max", () => {
    const { track, indicator } = render({ modelValue: 50, max: 200 });
    expect(track.getAttribute("aria-valuemax")).toBe("200");
    expect(indicator.style.transform).toBe("translateX(-75%)");
  });

  it.each([
    ["2xs", 1],
    ["xs", 2],
    ["sm", 4],
    ["md", 8],
    ["lg", 12],
    ["xl", 16],
    ["2xl", 20],
  ])("is %s at %ipx thick", (size, thickness) => {
    expect(render({ size }).track.getBoundingClientRect().height).toBe(thickness);
    expect(render({ size, orientation: "vertical" }).track.getBoundingClientRect().width).toBe(thickness);
  });

  it("draws the indicator in the text colour, primary unless a class says otherwise", () => {
    expect(getComputedStyle(render({ modelValue: 10 }).indicator).backgroundColor).toBe("rgb(1, 2, 3)");
    expect(getComputedStyle(render({ modelValue: 10, class: "text-success" }).indicator).backgroundColor).toBe(
      "rgb(0, 128, 0)",
    );
  });

  const activeStep = () => document.querySelector<HTMLElement>("[data-slot=progress-step][data-state=active]")!;

  it("draws the bar, its track and the step names in its color's text shade", () => {
    expect(render().root.dataset.color).toBe("primary");
    const { root, track, indicator } = render({
      modelValue: 1,
      max: ["Queued", "Running", "Done"],
      color: "success",
      style: "--success-text: rgb(0, 90, 0)",
    });
    expect(root.dataset.color).toBe("success");
    expect(getComputedStyle(indicator).backgroundColor).toBe("rgb(0, 90, 0)");
    const faint = document.createElement("div");
    faint.style.backgroundColor = "color-mix(in oklab, rgb(0, 90, 0) 20%, transparent)";
    document.body.append(faint);
    expect(getComputedStyle(track).backgroundColor).toBe(getComputedStyle(faint).backgroundColor);
    expect(getComputedStyle(activeStep()).color).toBe("rgb(0, 90, 0)");
  });

  it("still lets a class recolour the step names along with the bar", () => {
    render({ modelValue: 1, max: ["Queued", "Running", "Done"], class: "text-success" });
    expect(getComputedStyle(activeStep()).color).toBe("rgb(0, 128, 0)");
  });

  it("takes a custom tone from a [data-slot][data-color] rule", () => {
    const style = document.createElement("style");
    style.textContent = '@layer base { [data-slot][data-color="brand"] { --tone-text: rgb(255, 0, 200); } }';
    document.head.append(style);
    try {
      expect(getComputedStyle(render({ modelValue: 10, color: "brand" }).indicator).backgroundColor).toBe(
        "rgb(255, 0, 200)",
      );
    } finally {
      style.remove();
    }
  });

  it("shows the percentage as a status that follows the value", () => {
    const { root, status } = render({ modelValue: 50, status: true });
    expect(status.textContent?.trim()).toBe("50%");
    expect(status.getBoundingClientRect().width).toBe(root.getBoundingClientRect().width / 2);
  });

  it("hides the status while indeterminate", () => {
    expect(render({ status: true }).status).toBeNull();
  });

  it("shows only the active step", () => {
    render({ modelValue: 1, max: ["Waiting", "Cloning", "Done"] });
    const steps = [...document.querySelectorAll<HTMLElement>("[data-slot=progress-step]")];
    expect(steps.map((step) => step.dataset.state)).toEqual(["other", "active", "other"]);
    expect(steps.map((step) => getComputedStyle(step).opacity)).toEqual(["0", "1", "0"]);
  });

  it("labels the bar with ProgressLabel and shows ProgressValue at the end", async () => {
    const { track } = render(
      { modelValue: 30 },
      { default: () => [h(ProgressLabel, () => "Uploading"), h(ProgressValue)] },
    );
    await nextTick();
    const label = document.querySelector<HTMLElement>("[data-slot=progress-label]")!;
    const value = document.querySelector<HTMLElement>("[data-slot=progress-value]")!;
    expect(label.id).not.toBe("");
    expect(track.getAttribute("aria-labelledby")).toBe(label.id);
    expect(value.textContent).toBe("30%");
    expect(value.getAttribute("aria-hidden")).toBe("true");
    expect(value.getBoundingClientRect().right).toBe(track.getBoundingClientRect().right);
  });

  it("leaves the bar unlabelled without ProgressLabel", () => {
    const { track } = render({ modelValue: 30 });
    expect(track.hasAttribute("aria-labelledby")).toBe(false);
    expect(document.querySelector("[data-slot=progress-header]")).toBeNull();
  });
});
