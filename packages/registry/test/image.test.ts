import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h, nextTick, reactive } from "vue";
import { renderToString } from "vue/server-renderer";

import { Image } from "@/ui/image";

afterEach(() => {
  document.body.innerHTML = "";
});

const png = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas.toDataURL();
};

const broken = "data:image/png;base64,AAAA";

const render = (initial: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) => {
  const props = reactive({ ...initial });
  const events: string[] = [];
  mount(
    {
      render: () =>
        h("div", { style: "width: 400px" }, [
          h(Image, { ...props, onLoad: () => events.push("load"), onError: () => events.push("error") }, slots),
        ]),
    },
    { attachTo: document.body },
  );
  const root = document.querySelector<HTMLElement>("[data-slot=image]")!;
  return { props, events, root, img: () => root.querySelector<HTMLImageElement>("img") };
};

const size = (element: Element) => {
  const { width, height } = element.getBoundingClientRect();
  return [Math.round(width), Math.round(height)];
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Image", () => {
  it("renders the img with alt, lazy loading and cover fit", () => {
    const { img } = render({ src: png(4, 2) });
    expect(img()!.dataset.slot).toBe("image-img");
    expect(img()!.getAttribute("alt")).toBe("");
    expect(img()!.getAttribute("loading")).toBe("lazy");
    expect(img()!.hasAttribute("draggable")).toBe(false);
    expect(getComputedStyle(img()!).objectFit).toBe("cover");
    expect(getComputedStyle(img()!).objectPosition).toBe("50% 50%");
  });

  it("passes native attributes to the img", () => {
    const { img } = render({
      src: png(4, 2),
      alt: "A photo",
      srcset: "a.png 1x",
      sizes: "100vw",
      width: 40,
      height: 20,
      loading: "eager",
      fetchpriority: "high",
      decoding: "async",
      crossorigin: "anonymous",
      referrerpolicy: "no-referrer",
      draggable: false,
    });
    const attributes = Object.fromEntries([...img()!.attributes].map((a) => [a.name, a.value]));
    expect(attributes).toMatchObject({
      alt: "A photo",
      srcset: "a.png 1x",
      sizes: "100vw",
      width: "40",
      height: "20",
      loading: "eager",
      fetchpriority: "high",
      decoding: "async",
      crossorigin: "anonymous",
      referrerpolicy: "no-referrer",
      draggable: "false",
    });
  });

  it("goes from loading to loaded and emits load once", async () => {
    const { root, events } = render({ src: png(40, 20) });
    await nextTick();
    expect(root.dataset.state).toBe("loading");
    await expect.poll(() => root.dataset.state).toBe("loaded");
    await wait(100);
    expect(events).toEqual(["load"]);
  });

  it("is 16 / 9 before load and takes the natural ratio after", async () => {
    const { root } = render({ src: png(40, 20) });
    expect(size(root)).toEqual([400, 225]);
    await expect.poll(() => size(root)).toEqual([400, 200]);
  });

  it("prefers ratio, then width and height, over the natural ratio", async () => {
    const { root, props } = render({ src: png(40, 20), width: 300, height: 100, ratio: 1 });
    expect(size(root)).toEqual([300, 300]);
    props.ratio = undefined;
    await nextTick();
    expect(size(root)).toEqual([300, 100]);
    await expect.poll(() => root.dataset.state).toBe("loaded");
    expect(size(root)).toEqual([300, 100]);
  });

  it("caps width at the container and lets a class override it", async () => {
    const { root, props } = render({ src: png(40, 20), width: 800, height: 400 });
    expect(size(root)).toEqual([400, 200]);
    props.class = "w-64";
    await nextTick();
    expect(size(root)).toEqual([256, 128]);
  });

  it("derives the width from the ratio when a class sets only the height", () => {
    const { root } = render({ src: png(40, 20), ratio: 2, class: "h-40" });
    expect(size(root)).toEqual([320, 160]);
  });

  it("puts fit and position on the img", () => {
    const { img } = render({ src: png(4, 2), fit: "contain", position: "0% 100%" });
    expect(getComputedStyle(img()!).objectFit).toBe("contain");
    expect(getComputedStyle(img()!).objectPosition).toBe("0% 100%");
  });

  it("goes to error and emits error when the image fails", async () => {
    const { root, events } = render({ src: broken });
    await expect.poll(() => root.dataset.state).toBe("error");
    await wait(100);
    expect(events).toEqual(["error"]);
  });

  it("is in error without a source, renders no img and emits nothing", async () => {
    const { root, img, events } = render({});
    await nextTick();
    expect(root.dataset.state).toBe("error");
    expect(img()).toBeNull();
    await wait(100);
    expect(events).toEqual([]);
  });

  it("goes back to loading when the source changes", async () => {
    const { root, props, events } = render({ src: png(40, 20) });
    await expect.poll(() => root.dataset.state).toBe("loaded");
    props.src = png(30, 10);
    await nextTick();
    expect(root.dataset.state).toBe("loading");
    await expect.poll(() => root.dataset.state).toBe("loaded");
    await expect.poll(() => size(root)).toEqual([400, 133]);
    expect(events).toEqual(["load", "load"]);
  });

  it("does not reload when a re-render passes equal sources", async () => {
    const src = png(40, 20);
    const { root, props, events } = render({ src, sources: [{ srcset: src, type: "image/png" }] });
    await expect.poll(() => root.dataset.state).toBe("loaded");
    props.sources = [{ srcset: src, type: "image/png" }];
    await nextTick();
    expect(root.dataset.state).toBe("loaded");
    await wait(100);
    expect(events).toEqual(["load"]);
  });

  it("renders sources as a picture, in order, before the img", () => {
    const { root } = render({
      src: png(4, 2),
      sources: [
        { srcset: "a.avif", type: "image/avif" },
        { srcset: "b.webp", type: "image/webp", media: "(min-width: 1px)", sizes: "50vw", width: 4, height: 2 },
      ],
    });
    const picture = root.querySelector("picture")!;
    expect([...picture.children].map((child) => child.tagName)).toEqual(["SOURCE", "SOURCE", "IMG"]);
    const second = picture.children[1]!;
    expect(second.getAttribute("media")).toBe("(min-width: 1px)");
    expect(second.getAttribute("sizes")).toBe("50vw");
    expect(second.getAttribute("width")).toBe("4");
  });

  it("renders the img on the server and settles at once when hydrated over a loaded image", async () => {
    const src = png(40, 20);
    const events: string[] = [];
    const app = () =>
      createSSRApp({
        render: () =>
          h("div", { style: "width: 400px" }, [
            h(Image, { src, onLoad: () => events.push("load"), onError: () => events.push("error") }),
          ]),
      });
    const html = await renderToString(app());
    expect(html).toContain('data-state="idle"');
    expect(html).toContain("<img");

    const container = document.body.appendChild(document.createElement("div"));
    container.innerHTML = html;
    await container.querySelector("img")!.decode();
    const warn = vi.spyOn(console, "warn");
    app().mount(container);
    const root = container.querySelector<HTMLElement>("[data-slot=image]")!;
    await nextTick();
    expect(root.dataset.state).toBe("loaded");
    await wait(100);
    expect(events).toEqual(["load"]);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
