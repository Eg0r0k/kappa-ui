import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h, nextTick, reactive } from "vue";
import { renderToString } from "vue/server-renderer";

import { Image, ImageError, ImageLoading } from "@/ui/image";

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
const deferred = "/never-requested.png";

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

  it("derives the width from the ratio when a class sets a height and w-auto", () => {
    const { root } = render({ src: png(40, 20), ratio: 2, class: "h-40 w-auto" });
    expect(size(root)).toEqual([320, 160]);
  });

  it("fills a flex column that does not stretch its items", () => {
    const { root } = render({ src: png(40, 20), ratio: 2 });
    root.parentElement!.style.cssText = "width: 400px; display: flex; flex-direction: column; align-items: flex-start";
    expect(size(root)).toEqual([400, 200]);
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

  it("is loading while src is undefined, renders no img and emits nothing", async () => {
    const { root, img, events } = render({});
    await nextTick();
    expect(root.dataset.state).toBe("loading");
    expect(img()).toBeNull();
    await wait(100);
    expect(events).toEqual([]);
  });

  it.each([null, ""])("is in error when src is %j, and emits nothing", async (src) => {
    const { root, img, events } = render({ src });
    await nextTick();
    expect(root.dataset.state).toBe("error");
    expect(img()).toBeNull();
    await wait(100);
    expect(events).toEqual([]);
  });

  it("goes to error when an undefined src turns out null", async () => {
    const { root, props } = render({});
    await nextTick();
    expect(root.dataset.state).toBe("loading");
    props.src = null;
    await nextTick();
    expect(root.dataset.state).toBe("error");
  });

  it("loads once an undefined src arrives", async () => {
    const { root, props, events } = render({});
    await nextTick();
    props.src = png(40, 20);
    await expect.poll(() => root.dataset.state).toBe("loaded");
    expect(events).toEqual(["load"]);
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

describe("ImageLoading and ImageError", () => {
  const layers = (root: HTMLElement) => ({
    loading: root.querySelector<HTMLElement>("[data-slot=image-loading]")!,
    error: root.querySelector<HTMLElement>("[data-slot=image-error]")!,
  });

  const offscreen = () => {
    const spacer = document.body.appendChild(document.createElement("div"));
    spacer.style.height = "10000px";
  };

  it("shows the loading layer with a spinner while loading", async () => {
    offscreen();
    const { root } = render({ src: deferred }, { default: () => [h(ImageLoading), h(ImageError)] });
    await nextTick();
    const { loading, error } = layers(root);
    expect(root.dataset.state).toBe("loading");
    expect(loading.getAttribute("aria-hidden")).toBe("true");
    expect(loading.querySelector("[data-slot=spinner]")).not.toBeNull();
    await expect.poll(() => getComputedStyle(loading).visibility).toBe("visible");
    expect(getComputedStyle(error).visibility).toBe("hidden");
  });

  it("hides the loading layer once loaded", async () => {
    const { root } = render({ src: png(40, 20) }, { default: () => h(ImageLoading) });
    await expect.poll(() => root.dataset.state).toBe("loaded");
    await expect.poll(() => getComputedStyle(layers(root).loading).visibility).toBe("hidden");
  });

  it("shows the error layer with an icon on error", async () => {
    const { root } = render({ src: broken }, { default: () => [h(ImageLoading), h(ImageError)] });
    await expect.poll(() => getComputedStyle(layers(root).error).visibility).toBe("visible");
    expect(layers(root).error.querySelector("svg")).not.toBeNull();
    expect(layers(root).error.hasAttribute("aria-hidden")).toBe(false);
    expect(getComputedStyle(root.querySelector("img")!).visibility).toBe("hidden");
    await expect.poll(() => getComputedStyle(layers(root).loading).visibility).toBe("hidden");
  });

  it("keeps the native broken image without an ImageError", async () => {
    const { root, img } = render({ src: broken });
    await expect.poll(() => root.dataset.state).toBe("error");
    expect(getComputedStyle(img()!).visibility).toBe("visible");
  });

  it("replaces the default content with its slot", () => {
    const { root } = render({}, { default: () => [h(ImageLoading, () => "Wait"), h(ImageError, () => "No photo")] });
    expect(layers(root).loading.textContent).toBe("Wait");
    expect(layers(root).error.textContent).toBe("No photo");
  });

  it("delays showing the loading layer, not hiding it", async () => {
    offscreen();
    const { root, props } = render({ src: deferred }, { default: () => h(ImageLoading, { class: "delay-300" }) });
    await nextTick();
    expect(getComputedStyle(layers(root).loading).transitionDelay).toBe("0.3s");
    props.loading = "eager";
    props.src = broken;
    await expect.poll(() => root.dataset.state).toBe("error");
    expect(getComputedStyle(layers(root).loading).transitionDelay).toBe("0s");
  });

  it("keeps the layers hidden in server HTML", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(Image, { src: png(4, 2) }, () => [h(ImageLoading), h(ImageError)]) }),
    );
    document.body.innerHTML = html;
    const root = document.querySelector<HTMLElement>("[data-slot=image]")!;
    expect(getComputedStyle(layers(root).loading).visibility).toBe("hidden");
    expect(getComputedStyle(layers(root).error).visibility).toBe("hidden");
  });
});
