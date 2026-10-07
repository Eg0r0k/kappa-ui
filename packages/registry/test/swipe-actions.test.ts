import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, nextTick } from "vue";

import { SwipeAction, SwipeActions, SwipeContent, SwipeItem, SwipeRoot } from "@/ui/swipe-actions";

const clicks: string[] = [];

const setup = async () => {
  clicks.length = 0;
  mount(
    defineComponent({
      setup: () => () =>
        h(SwipeRoot, { style: "width: 320px; --destructive: rgb(255, 0, 0)" }, () =>
          h(SwipeItem, () => [
            h(SwipeActions, { side: "end" }, () => [
              h(SwipeAction, { onClick: () => clicks.push("flag") }, () => "Flag"),
              h(SwipeAction, { color: "destructive", onClick: () => clicks.push("delete") }, () => "Delete"),
            ]),
            h(SwipeContent, () => h("button", { type: "button", "data-test": "body" }, "Row")),
          ]),
        ),
    }),
    { attachTo: document.body },
  );
  await new Promise((resolve) => setTimeout(resolve, 50));
};

const slot = (name: string) => document.querySelector<HTMLElement>(`[data-slot=${name}]`)!;

it("marks every part and draws an action in its tone", async () => {
  await setup();
  for (const name of [
    "swipe-root",
    "swipe-item",
    "swipe-actions",
    "swipe-action",
    "swipe-action-content",
    "swipe-content",
  ]) {
    expect(slot(name), name).not.toBeNull();
  }
  const [flag, remove] = document.querySelectorAll<HTMLElement>("[data-slot=swipe-action]");
  expect(flag!.dataset.color).toBe("primary");
  expect(remove!.dataset.color).toBe("destructive");
  expect(getComputedStyle(remove!).backgroundColor).toBe("rgb(255, 0, 0)");
  expect(slot("swipe-action-content").getBoundingClientRect().width).toBeGreaterThanOrEqual(80);
});

it("transitions the row and stops while it is dragged", async () => {
  await setup();
  expect(getComputedStyle(slot("swipe-item")).transitionProperty).toContain("--swipe-x");
  slot("swipe-item").setAttribute("data-dragging", "");
  expect(getComputedStyle(slot("swipe-item")).transitionProperty).not.toContain("--swipe-x");
});

it("opens from the keyboard and closes after an action", async () => {
  await setup();
  document.querySelector<HTMLElement>("[data-test=body]")!.focus();
  await userEvent.keyboard("{ArrowLeft}");
  expect(slot("swipe-item").dataset.state).toBe("end");
  document.querySelectorAll<HTMLElement>("[data-slot=swipe-action]")[1]!.click();
  expect(clicks).toEqual(["delete"]);
  await nextTick();
  expect(slot("swipe-item").dataset.state).toBe("closed");
});
