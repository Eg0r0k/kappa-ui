import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h } from "vue";

import {
  Tour,
  TourClose,
  TourContent,
  TourDescription,
  TourFooter,
  TourNext,
  TourPrev,
  TourProgress,
  TourTitle,
  type TourStep,
  useTour,
} from "@/ui/tour";

type Step = TourStep & { target: string | null; title: string; body: string };

const Harness = defineComponent(() => {
  const tour = useTour<Step>(
    [
      { target: "tour-a", title: "First", body: "Alpha" },
      { target: "tour-b", title: "Second", body: "Beta" },
      { target: null, title: "Done", body: "Gamma" },
    ],
    { scrollIntoView: false },
  );
  return () => [
    h("button", { id: "tour-start", onClick: () => tour.start() }, "Start"),
    h("div", { id: "tour-a", style: "margin:40px;width:80px;height:20px" }, "A"),
    h("div", { id: "tour-b", style: "margin:40px;width:80px;height:20px" }, "B"),
    h("div", { id: "tour-outside", style: "position:fixed;right:0;bottom:0;width:40px;height:40px" }),
    h(
      Tour,
      { tour },
      {
        default: ({ step }: { step: Step }) =>
          h(TourContent, () => [
            h(TourTitle, () => step.title),
            h(TourDescription, () => step.body),
            h(TourFooter, () => [h(TourProgress), h(TourPrev), h(TourNext)]),
            h(TourClose),
          ]),
      },
    ),
  ];
});

const content = () => document.querySelector<HTMLElement>("[data-slot=tour-content]");
const part = (slot: string) => content()!.querySelector<HTMLElement>(`[data-slot=${slot}]`)!;

const start = async () => {
  mount(Harness, { attachTo: document.body });
  await userEvent.click(document.getElementById("tour-start")!);
  await expect.poll(() => content()).not.toBeNull();
};

describe("Tour", () => {
  it("walks the steps, then finishes and gives focus back", async () => {
    await start();
    expect(part("tour-title").textContent).toBe("First");
    expect(part("tour-progress").textContent).toBe("1 / 3");
    expect(part("tour-prev").getAttribute("aria-disabled")).toBe("true");
    await expect.poll(() => document.activeElement).toBe(part("tour-next"));

    await userEvent.click(part("tour-next"));
    await expect.poll(() => part("tour-title").textContent).toBe("Second");
    expect(part("tour-progress").textContent).toBe("2 / 3");
    expect(part("tour-prev").hasAttribute("aria-disabled")).toBe(false);

    await userEvent.click(part("tour-next"));
    await expect.poll(() => part("tour-title").textContent).toBe("Done");
    expect(part("tour-next").textContent).toBe("Finish");

    await userEvent.click(part("tour-next"));
    await expect.poll(() => content()).toBeNull();
    expect(document.activeElement).toBe(document.getElementById("tour-start"));
  });

  it("anchors to the target", async () => {
    await start();
    const target = document.getElementById("tour-a")!.getBoundingClientRect();
    await expect.poll(() => content()!.getBoundingClientRect().top).toBeGreaterThanOrEqual(target.bottom);
  });

  it("centres a step without a target", async () => {
    await start();
    await userEvent.click(part("tour-next"));
    await userEvent.click(part("tour-next"));
    await expect.poll(() => content()!.dataset.centered).toBe("true");
    await expect
      .poll(() => {
        const box = content()!.getBoundingClientRect();
        return Math.abs(box.top + box.height / 2 - innerHeight / 2);
      })
      .toBeLessThan(2);
  });

  it("stays open on an outside click and finishes on Escape", async () => {
    await start();
    await userEvent.click(document.getElementById("tour-outside")!);
    expect(content()).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => content()).toBeNull();
  });

  it("finishes from the close button", async () => {
    await start();
    expect(part("tour-close").getAttribute("aria-label")).toBe("Close");
    await userEvent.click(part("tour-close"));
    await expect.poll(() => content()).toBeNull();
  });

  it("is labelled by its title and described by its description", async () => {
    await start();
    expect(content()!.getAttribute("aria-labelledby")).toBe(part("tour-title").id);
    expect(content()!.getAttribute("aria-describedby")).toBe(part("tour-description").id);
    expect(part("tour-title").id).not.toBe("");
  });
});
