import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { h } from "vue";

import { getEdgeZones, ScrollArea, type ScrollAreaApi, type ScrollAreaEdge } from "@/ui/scroll-area";

type Hit = { edge: ScrollAreaEdge; ref: ScrollAreaApi };

const mountArea = (props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) => {
  const hits: ScrollAreaEdge[] = [];
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    props: { onReachEdge: (info: Hit) => hits.push(info.edge), ...props },
    attrs: { style: "height: 100px; width: 200px", ...attrs },
    slots: { default: () => h("div", { style: "width: 600px; height: 400px" }) },
  });
  const viewport = (wrapper.element as Element).querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;
  return { wrapper, hits, viewport };
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

afterEach(() => {
  document.body.innerHTML = "";
});

it("computes the zones with a pixel of tolerance", () => {
  expect(getEdgeZones(0, 400, 100, 0)).toEqual({ start: true, end: false });
  expect(getEdgeZones(1, 400, 100, 0)).toEqual({ start: true, end: false });
  expect(getEdgeZones(2, 400, 100, 0)).toEqual({ start: false, end: false });
  expect(getEdgeZones(299, 400, 100, 0)).toEqual({ start: false, end: true });
  expect(getEdgeZones(298, 400, 100, 0)).toEqual({ start: false, end: false });
  expect(getEdgeZones(150, 400, 100, 150)).toEqual({ start: true, end: true });
  expect(getEdgeZones(0, 50, 100, 0)).toEqual({ start: true, end: true });
});

it("fires once on entering the bottom zone and again only after leaving it", async () => {
  const { wrapper, hits, viewport } = mountArea();
  await settle();
  expect(hits).toEqual([]);

  viewport.scrollTop = 300;
  await vi.waitFor(() => expect(hits).toEqual(["bottom"]));

  for (const top of [299, 300, 299, 300]) {
    viewport.scrollTop = top;
    viewport.dispatchEvent(new Event("scroll"));
    await settle();
  }
  expect(hits).toEqual(["bottom"]);

  viewport.scrollTop = 100;
  await settle();
  viewport.scrollTop = 300;
  await vi.waitFor(() => expect(hits).toEqual(["bottom", "bottom"]));

  viewport.scrollTop = 0;
  await vi.waitFor(() => expect(hits).toEqual(["bottom", "bottom", "top"]));

  wrapper.unmount();
});

it("moves the zone out by edgeOffset", async () => {
  const { wrapper, hits, viewport } = mountArea({ edgeOffset: 100 });
  viewport.scrollTop = 150;
  await settle();
  expect(hits).toEqual([]);
  viewport.scrollTop = 200;
  await vi.waitFor(() => expect(hits).toEqual(["bottom"]));
  wrapper.unmount();
});

it("reports only the axes the orientation scrolls", async () => {
  const vertical = mountArea();
  vertical.viewport.scrollTop = 300;
  await vi.waitFor(() => expect(vertical.hits).toEqual(["bottom"]));
  vertical.wrapper.unmount();

  const both = mountArea({ orientation: "both" });
  both.viewport.scrollLeft = 400;
  await vi.waitFor(() => expect(both.hits).toEqual(["end"]));
  both.viewport.scrollLeft = 0;
  await vi.waitFor(() => expect(both.hits).toEqual(["end", "start"]));
  both.wrapper.unmount();
});

it("keeps start and end logical under rtl", async () => {
  const { wrapper, hits, viewport } = mountArea({ orientation: "horizontal" }, { dir: "rtl" });
  viewport.scrollLeft = -400;
  await vi.waitFor(() => expect(hits).toEqual(["end"]));
  wrapper.unmount();
});

it("hands the api over in the payload", async () => {
  let received: Hit | null = null;
  const { wrapper, viewport } = mountArea({ onReachEdge: (info: Hit) => (received = info) });
  viewport.scrollTop = 300;
  await vi.waitFor(() => expect(received).not.toBeNull());
  expect(received!.ref.getScrollPosition().top).toBe(300);
  wrapper.unmount();
});
