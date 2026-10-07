import { mount } from "@vue/test-utils";
import { ConfigProvider } from "reka-ui";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, ref } from "vue";

import {
  SwipeAction,
  SwipeActionContent,
  SwipeActions,
  SwipeContent,
  SwipeItem,
  SwipeRoot,
  type SwipeState,
} from "../../src/swipe-actions";
import { drag, pointer, wait } from "./pointer";

type Sides = { start?: string[]; end?: string[]; full?: "start" | "end" };

const action = (name: string, clicks: string[]) =>
  h(SwipeAction, { "data-test": name, onClick: () => clicks.push(name) }, () =>
    h(SwipeActionContent, { style: "width: 80px; height: 48px" }, () => name),
  );

const row = (props: Record<string, unknown>, sides: Sides, clicks: string[]) =>
  h(SwipeItem, { style: "width: 300px", ...props }, () => [
    sides.start
      ? h(SwipeActions, { side: "start", fullSwipe: sides.full === "start" }, () =>
          sides.start!.map((name) => action(name, clicks)),
        )
      : null,
    sides.end
      ? h(SwipeActions, { side: "end", fullSwipe: sides.full === "end" }, () =>
          sides.end!.map((name) => action(name, clicks)),
        )
      : null,
    h(SwipeContent, { "data-test": "content", style: "height: 48px; background: white" }, () =>
      h("button", { type: "button", "data-test": "body", onClick: () => clicks.push("body") }, "Row"),
    ),
  ]);

const host = async (render: () => VNode) => {
  const wrapper = mount(
    defineComponent({ setup: () => () => h("div", { style: "position: fixed; left: 0; top: 0" }, render()) }),
    { attachTo: document.body },
  );
  await wait(50);
  return wrapper;
};

const setup = async (
  props: Record<string, unknown> = {},
  sides: Sides = { start: ["archive"], end: ["flag", "delete"] },
) => {
  const clicks: string[] = [];
  const wrapper = await host(() => row(props, sides, clicks));
  return { clicks, wrapper };
};

const items = () => [...document.querySelectorAll<HTMLElement>("[data-state]")];
const item = () => items()[0]!;
const offset = (element = item()) => element.style.getPropertyValue("--swipe-x");
const content = () => document.querySelector<HTMLElement>("[data-test=content]")!;
const strip = (side: "start" | "end") => document.querySelector<HTMLElement>(`[data-side=${side}]`)!;
const button = (name: string) => document.querySelector<HTMLElement>(`[data-test=${name}]`)!;

const openWithKeys = async (index = 0, key = "{ArrowLeft}") => {
  document.querySelectorAll<HTMLElement>("[data-test=body]")[index]!.focus();
  await userEvent.keyboard(key);
};

it("opens the end strip past half its width and holds it open", async () => {
  await setup();
  await drag(content(), [250, 24], [150, 24], 4, 80);
  expect(item().dataset.state).toBe("end");
  expect(offset()).toBe("-160px");
});

it("springs back when released before the threshold", async () => {
  await setup();
  await drag(content(), [250, 24], [190, 24], 4, 80);
  expect(item().dataset.state).toBe("closed");
  expect(offset()).toBe("0px");
});

it("opens on a flick that stops short of the threshold", async () => {
  await setup();
  pointer("pointerdown", content(), 250, 24);
  await wait(10);
  pointer("pointermove", content(), 235, 24);
  await wait(10);
  pointer("pointermove", content(), 200, 24);
  pointer("pointerup", content(), 200, 24);
  await nextTick();
  expect(item().dataset.state).toBe("end");
});

it("stops at the strip, rubber-bands past it and opens the start side to the right", async () => {
  await setup();
  pointer("pointerdown", content(), 20, 24);
  for (const x of [60, 120, 180, 260]) {
    await wait(40);
    pointer("pointermove", content(), x, 24);
  }
  await nextTick();
  const overdrag = parseFloat(offset());
  expect(overdrag).toBeGreaterThan(80);
  expect(overdrag).toBeLessThan(140);
  await wait(40);
  pointer("pointerup", content(), 260, 24);
  await nextTick();
  expect(item().dataset.state).toBe("start");
  expect(offset()).toBe("80px");
});

it("barely moves towards a side without a strip", async () => {
  await setup({}, { end: ["delete"] });
  await drag(content(), [20, 24], [120, 24]);
  expect(item().dataset.state).toBe("closed");
  expect(offset()).toBe("0px");
});

it("arms a full swipe past half the row and clicks the outermost action on release", async () => {
  const { clicks } = await setup({}, { end: ["flag", "delete"], full: "end" });
  pointer("pointerdown", content(), 280, 24);
  for (const x of [230, 180, 130, 60]) {
    await wait(40);
    pointer("pointermove", content(), x, 24);
  }
  await nextTick();
  expect(strip("end").hasAttribute("data-armed")).toBe(true);
  expect(button("delete").hasAttribute("data-armed")).toBe(true);
  expect(button("flag").hasAttribute("data-armed")).toBe(false);
  expect(item().style.getPropertyValue("--swipe-spread")).toBe("0");
  await wait(40);
  pointer("pointerup", content(), 60, 24);
  expect(clicks).toEqual(["delete"]);
  await nextTick();
  expect(item().dataset.state).toBe("closed");
});

it("swallows the click that ends a drag, and closes an open row on click", async () => {
  const { clicks } = await setup();
  await drag(content(), [250, 24], [150, 24], 4, 40);
  button("body").click();
  expect(clicks).toEqual([]);
  await wait(10);
  button("body").click();
  expect(clicks).toEqual([]);
  await nextTick();
  expect(item().dataset.state).toBe("closed");
  await wait(10);
  button("body").click();
  expect(clicks).toEqual(["body"]);
});

it("closes on a pointerdown outside and on Escape, and after an action runs", async () => {
  const state = ref<SwipeState>("end");
  const clicks: string[] = [];
  await host(() =>
    row(
      { state: state.value, "onUpdate:state": (next: SwipeState) => (state.value = next) },
      { end: ["flag"] },
      clicks,
    ),
  );
  pointer("pointerdown", document.body, 600, 400, "mouse");
  await nextTick();
  expect(state.value).toBe("closed");

  state.value = "end";
  await nextTick();
  await userEvent.keyboard("{Escape}");
  expect(state.value).toBe("closed");

  state.value = "end";
  await nextTick();
  button("flag").click();
  expect(clicks).toEqual(["flag"]);
  expect(state.value).toBe("closed");
});

it("closes on scroll with closeOnScroll", async () => {
  await setup({ closeOnScroll: true });
  await openWithKeys();
  expect(item().dataset.state).toBe("end");
  window.dispatchEvent(new Event("scroll"));
  await nextTick();
  expect(item().dataset.state).toBe("closed");
});

it("keeps one row open inside a SwipeRoot", async () => {
  const clicks: string[] = [];
  await host(() =>
    h(SwipeRoot, () => [
      row({}, { end: ["flag"] }, clicks),
      h("div", { style: "height: 20px" }),
      row({}, { end: ["flag"] }, clicks),
    ]),
  );
  await openWithKeys(0);
  expect(items()[0]!.dataset.state).toBe("end");
  const second = document.querySelectorAll<HTMLElement>("[data-test=content]")[1]!;
  await drag(second, [250, 92], [150, 92], 4, 80);
  await nextTick();
  expect(items().map((element) => element.dataset.state)).toEqual(["closed", "end"]);
});

it("follows v-model:state and the exposed open and close", async () => {
  const state = ref<SwipeState>("start");
  const exposed = ref<{ open: (side: "start" | "end") => void; close: () => void }>();
  await host(() =>
    row(
      { ref: exposed, state: state.value, "onUpdate:state": (next: SwipeState) => (state.value = next) },
      { start: ["archive"], end: ["flag"] },
      [],
    ),
  );
  expect(offset()).toBe("80px");
  state.value = "closed";
  await nextTick();
  expect(offset()).toBe("0px");
  exposed.value!.open("end");
  await nextTick();
  expect(state.value).toBe("end");
  expect(offset()).toBe("-80px");
  exposed.value!.close();
  await nextTick();
  expect(state.value).toBe("closed");
});

it("keeps closed strips inert", async () => {
  await setup();
  expect(strip("end").inert).toBe(true);
  await openWithKeys();
  expect(strip("end").inert).toBe(false);
  expect(strip("start").inert).toBe(true);
});

it("places each action after the ones before it", async () => {
  await setup();
  expect(button("flag").style.getPropertyValue("--swipe-before")).toBe("0px");
  expect(button("delete").style.getPropertyValue("--swipe-before")).toBe("80px");
});

it("moves with the arrow keys", async () => {
  await setup();
  button("body").focus();
  await userEvent.keyboard("{ArrowLeft}");
  expect(item().dataset.state).toBe("end");
  await userEvent.keyboard("{ArrowRight}");
  expect(item().dataset.state).toBe("closed");
  await userEvent.keyboard("{ArrowRight}");
  expect(item().dataset.state).toBe("start");
});

it("mirrors the gesture and the arrow keys in right-to-left", async () => {
  const clicks: string[] = [];
  await host(() =>
    h(ConfigProvider, { dir: "rtl" }, () =>
      h("div", { dir: "rtl" }, row({}, { start: ["archive"], end: ["flag", "delete"] }, clicks)),
    ),
  );
  await drag(content(), [50, 24], [150, 24], 4, 80);
  expect(item().dataset.state).toBe("end");
  expect(offset()).toBe("160px");
  button("body").focus();
  await userEvent.keyboard("{ArrowLeft}");
  expect(item().dataset.state).toBe("closed");
  await userEvent.keyboard("{ArrowLeft}");
  expect(item().dataset.state).toBe("start");
});

it("ignores the gesture and the keys when disabled", async () => {
  await setup({ disabled: true });
  await drag(content(), [250, 24], [150, 24]);
  expect(item().dataset.state).toBe("closed");
  expect(item().hasAttribute("data-disabled")).toBe(true);
  button("body").focus();
  await userEvent.keyboard("{ArrowLeft}");
  expect(item().dataset.state).toBe("closed");
});
