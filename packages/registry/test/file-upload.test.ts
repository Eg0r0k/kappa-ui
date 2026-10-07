import { Upload } from "@lucide/vue";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { type VNode, createSSRApp, defineComponent, h, nextTick, ref, shallowRef } from "vue";
import { renderToString } from "vue/server-renderer";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import {
  FileUpload,
  FileUploadClear,
  FileUploadDescription,
  FileUploadDropzone,
  FileUploadIcon,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  type FileUploadRejection,
  FileUploadTitle,
  FileUploadTrigger,
  fileKey,
} from "@/ui/file-upload";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
  document.documentElement.removeAttribute("dir");
});

const PNG = Uint8Array.from(
  atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="),
  (char) => char.charCodeAt(0),
);

const image = (name = "photo.png", lastModified = 1) => new File([PNG], name, { type: "image/png", lastModified });
const pdf = (name = "report.pdf", size = 2048) =>
  new File([new Uint8Array(size)], name, { type: "application/pdf", lastModified: 1 });

type Look = {
  title?: string;
  description?: string;
  layout?: "list" | "grid";
  variant?: "outline" | "soft" | "subtle";
};

// the whole zone is the button: the dropzone's frame and drops merge onto the trigger
const zone = (look: Look = {}) =>
  h(FileUploadDropzone, { asChild: true, variant: look.variant }, () =>
    h(FileUploadTrigger, null, () => [
      h(FileUploadIcon, null, () => h(Upload)),
      h(FileUploadTitle, null, () => look.title ?? "Upload"),
      look.description ? h(FileUploadDescription, null, () => look.description) : null,
    ]),
  );

const items = (files: File[], layout: Look["layout"] = "list") =>
  h(FileUploadList, { layout }, () =>
    files.map((file) =>
      h(FileUploadItem, { key: fileKey(file), file }, () => [
        h(FileUploadItemPreview),
        h(FileUploadItemMetadata),
        h(FileUploadItemDelete),
      ]),
    ),
  );

const upload = (props: Record<string, unknown> = {}, look: Look = {}) =>
  h(FileUpload, props, { default: ({ files }: { files: File[] }) => [zone(look), items(files, look.layout)] });

// a zone with its content and a Browse button, the list inside it
const browseZone = (props: Record<string, unknown> = {}) =>
  h(FileUpload, props, {
    default: ({ files }: { files: File[] }) =>
      h(FileUploadDropzone, null, () => [
        h(FileUploadTitle, null, () => "Drop files here"),
        h(FileUploadDescription, null, () => "CSV only"),
        h(FileUploadTrigger, { asChild: true }, () => h("button", { "data-test": "browse" }, "Browse")),
        items(files),
      ]),
  });

const render = (node: () => VNode | VNode[]) => mount({ render: node }, { attachTo: document.body });

type Model = File | File[] | null | undefined;

const controlled = (initial: Model, props: Record<string, unknown> = {}, look: Look = {}) => {
  const value = shallowRef<Model>(initial);
  const rejected: FileUploadRejection[][] = [];
  const wrapper = mount(
    defineComponent(
      () => () =>
        upload(
          {
            modelValue: value.value,
            "onUpdate:modelValue": (next: Model) => {
              value.value = next;
            },
            onReject: (rejections: FileUploadRejection[]) => rejected.push(rejections),
            ...props,
          },
          look,
        ),
    ),
    { attachTo: document.body },
  );
  return { value, rejected, wrapper };
};

const $ = <T extends HTMLElement = HTMLElement>(slot: string, scope: ParentNode = document) =>
  scope.querySelector<T>(`[data-slot=${slot}]`)!;
const $$ = <T extends HTMLElement = HTMLElement>(slot: string, scope: ParentNode = document) => [
  ...scope.querySelectorAll<T>(`[data-slot=${slot}]`),
];
const input = () => $<HTMLInputElement>("file-upload-input");
const dropzone = () => $("file-upload-dropzone");
// a trigger on its own, or the zone that is the trigger
const trigger = () =>
  document.querySelector<HTMLButtonElement>("[data-slot=file-upload-trigger], button[data-slot=file-upload-dropzone]")!;
const removes = () => $$<HTMLButtonElement>("file-upload-item-delete");
const names = () => $$("file-upload-item-name").map((element) => element.textContent?.trim());
const browse = () => document.querySelector<HTMLButtonElement>("[data-test=browse]")!;

const transferOf = (...files: File[]) => {
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  return transfer;
};

const drag = (target: Element, type: string, transfer: DataTransfer) => {
  const event = new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: transfer });
  target.dispatchEvent(event);
  return event;
};

const drop = async (target: Element, ...files: File[]) => {
  const transfer = transferOf(...files);
  drag(target, "dragenter", transfer);
  drag(target, "dragover", transfer);
  const event = drag(target, "drop", transfer);
  await nextTick();
  return event;
};

describe("FileUpload structure", () => {
  it("makes the zone one type=button trigger with a hidden input outside it and no interactive content inside it", () => {
    render(() => upload({}, { description: "PNG up to 2 MB" }));

    expect($("file-upload")).toBeTruthy();
    expect(trigger()).toBe(dropzone());
    expect(trigger().tagName).toBe("BUTTON");
    expect(trigger().type).toBe("button");
    expect(input().type).toBe("file");
    expect(input().getAttribute("aria-hidden")).toBe("true");
    expect(input().tabIndex).toBe(-1);
    expect(trigger().contains(input())).toBe(false);
    expect(trigger().querySelector("button, a, input, select, textarea, [tabindex]")).toBeNull();
    expect($("file-upload-icon", trigger())).toBeTruthy();
    expect($("file-upload-title", trigger()).textContent).toBe("Upload");
    expect($("file-upload-description", trigger()).textContent).toBe("PNG up to 2 MB");
  });

  it("puts the file list and its Remove buttons outside the trigger", async () => {
    controlled([image(), pdf()], { multiple: true });
    await nextTick();

    expect($$("file-upload-item")).toHaveLength(2);
    expect(trigger().contains($("file-upload-list"))).toBe(false);
    expect($("file-upload").contains($("file-upload-list"))).toBe(true);
    expect($("file-upload-list").getAttribute("role")).toBe("list");
  });

  it("renders no list while there are no files", async () => {
    const { value } = controlled([], { multiple: true });
    await nextTick();
    expect($("file-upload-list")).toBeNull();
    value.value = [pdf()];
    await nextTick();
    expect($("file-upload-list")).toBeTruthy();
  });

  it("marks its state on the root", () => {
    render(() => upload({ disabled: true, "aria-invalid": "true" }));
    expect($("file-upload").dataset).toMatchObject({ size: "md", disabled: "", invalid: "", empty: "" });
  });

  it("names the trigger by the title and describes it by the description, without reading the description twice", async () => {
    render(() => upload({}, { description: "PNG up to 2 MB" }));
    await nextTick();
    await expect.element(page.elementLocator(trigger())).toHaveAccessibleName("Upload");
    await expect.element(page.elementLocator(trigger())).toHaveAccessibleDescription("PNG up to 2 MB");
  });

  it("keeps attributes on the part they are given to", () => {
    render(() =>
      h(
        FileUpload,
        { class: "custom", style: "width: 200px" },
        { default: () => h(FileUploadTrigger, { "aria-label": "Avatar", "data-test": "x" }, () => "Pick") },
      ),
    );
    expect($("file-upload").classList).toContain("custom");
    expect($("file-upload").style.width).toBe("200px");
    expect(trigger().getAttribute("aria-label")).toBe("Avatar");
    expect(trigger().dataset.test).toBe("x");
  });

  it("lets a Button be the trigger, with nothing else around it", async () => {
    render(() =>
      h(
        FileUpload,
        { multiple: true, modelValue: [pdf()] },
        {
          default: ({ files }: { files: File[] }) => [
            h(FileUploadTrigger, { asChild: true }, () => h(Button, null, () => "Attach")),
            items(files),
          ],
        },
      ),
    );
    await nextTick();
    expect(trigger().dataset.slot).toBe("file-upload-trigger");
    expect(trigger().type).toBe("button");
    expect(dropzone()).toBeNull();
    expect(trigger().contains($("file-upload-list"))).toBe(false);
  });
});

describe("FileUpload inside a form", () => {
  // nuxt/ui#4935: a button inside a form submits it unless it says type=button
  it("never submits the form from the trigger or a Remove button", async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    const files = shallowRef<File[]>([image()]);
    mount(
      defineComponent(
        () => () =>
          h("form", { onSubmit }, [
            upload({
              multiple: true,
              modelValue: files.value,
              "onUpdate:modelValue": (next: unknown) => (files.value = next as File[]),
            }),
          ]),
      ),
      { attachTo: document.body },
    );
    vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});

    trigger().click();
    removes()[0]!.click();
    await nextTick();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(files.value).toEqual([]);
  });

  // nuxt/ui#5210: the native input mirrors the model, so FormData and required agree with what is shown
  it("submits exactly the model's files and follows required", async () => {
    const files = shallowRef<File[]>([]);
    mount(
      defineComponent(
        () => () =>
          h("form", { onSubmit: (event: Event) => event.preventDefault() }, [
            upload({
              multiple: true,
              name: "attachments",
              required: true,
              modelValue: files.value,
              "onUpdate:modelValue": (next: unknown) => (files.value = next as File[]),
            }),
          ]),
      ),
      { attachTo: document.body },
    );
    const form = document.querySelector("form")!;
    const submitted = () => new FormData(form).getAll("attachments").map((entry) => (entry as File).name);
    await nextTick();

    expect(form.checkValidity()).toBe(false);

    await drop(dropzone(), image("a.png"), pdf("b.pdf"));
    await nextTick();
    expect(submitted()).toEqual(["a.png", "b.pdf"]);
    expect(input().files).toHaveLength(2);
    expect(form.checkValidity()).toBe(true);

    await drop(dropzone(), image("c.png"));
    await nextTick();
    expect(submitted()).toEqual(["a.png", "b.pdf", "c.png"]);

    removes()[1]!.click();
    await nextTick();
    await nextTick();
    expect(submitted()).toEqual(["a.png", "c.png"]);

    files.value = [];
    await nextTick();
    await nextTick();
    expect(input().files).toHaveLength(0);
    expect(form.checkValidity()).toBe(false);
  });

  // a native reset empties the file input; the model follows, back to the starting files
  it("goes back to the starting files on a form reset, and keeps them when the reset is cancelled", async () => {
    const start = [pdf("start.pdf")];
    const cancel = ref(false);
    mount(
      defineComponent(
        () => () =>
          h("form", { onReset: (event: Event) => cancel.value && event.preventDefault() }, [
            upload({ multiple: true, name: "files", defaultValue: start }),
          ]),
      ),
      { attachTo: document.body },
    );
    const form = document.querySelector("form")!;
    const submitted = () => new FormData(form).getAll("files").map((entry) => (entry as File).name);
    await nextTick();

    await drop(dropzone(), image("a.png"));
    await nextTick();
    expect(names()).toEqual(["start.pdf", "a.png"]);
    expect(submitted()).toEqual(["start.pdf", "a.png"]);

    cancel.value = true;
    form.reset();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(names()).toEqual(["start.pdf", "a.png"]);
    expect(submitted()).toEqual(["start.pdf", "a.png"]);

    cancel.value = false;
    form.reset();
    await expect.poll(names).toEqual(["start.pdf"]);
    await expect.poll(submitted).toEqual(["start.pdf"]);
  });

  it("empties on a form reset without starting files, and ignores other forms", async () => {
    const value = shallowRef<File | null>(image());
    mount(
      defineComponent(() => () => [
        h("form", { id: "mine" }, [
          upload({
            name: "photo",
            modelValue: value.value,
            "onUpdate:modelValue": (next: unknown) => (value.value = next as File | null),
          }),
        ]),
        h("form", { id: "other" }),
      ]),
      { attachTo: document.body },
    );
    await nextTick();

    document.querySelector<HTMLFormElement>("#other")!.reset();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(value.value).not.toBeNull();

    document.querySelector<HTMLFormElement>("#mine")!.reset();
    await expect.poll(() => value.value).toBeNull();
    expect(input().files).toHaveLength(0);
  });

  it("turns invalid after a failed submit and clears once a file is added", async () => {
    mount(
      defineComponent(
        () => () =>
          h("form", { onSubmit: (event: Event) => event.preventDefault() }, [
            upload({ name: "avatar", required: true, style: "--destructive: rgb(255, 0, 0)" }),
          ]),
      ),
      { attachTo: document.body },
    );
    const form = document.querySelector("form")!;
    expect($("file-upload").dataset.invalid).toBeUndefined();

    form.requestSubmit();
    await nextTick();
    expect($("file-upload").dataset.invalid).toBe("");
    expect(dropzone().dataset.invalid).toBe("");
    expect(trigger().getAttribute("aria-invalid")).toBe("true");
    await expect.poll(() => getComputedStyle(dropzone()).borderTopColor).toBe("rgb(255, 0, 0)");
    // the browser focuses the hidden input to point its message at it; the frame shows that focus
    expect(document.activeElement).toBe(input());
    expect(getComputedStyle(dropzone()).outlineStyle).toBe("solid");
    await userEvent.tab({ shift: true });
    expect(document.activeElement).not.toBe(trigger());
    input().focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger());

    await drop(dropzone(), image());
    await nextTick();
    await nextTick();
    expect($("file-upload").dataset.invalid).toBeUndefined();
    expect(trigger().hasAttribute("aria-invalid")).toBe(false);
  });
});

describe("FileUpload opening the dialog", () => {
  it("clicks the input on a click, Enter and Space, and not when disabled", async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});
    const disabled = ref(false);
    mount(
      defineComponent(() => () => upload({ disabled: disabled.value })),
      { attachTo: document.body },
    );

    await userEvent.click(trigger());
    expect(click).toHaveBeenCalledTimes(1);

    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(click).toHaveBeenCalledTimes(3);

    disabled.value = true;
    await nextTick();
    expect(trigger().disabled).toBe(true);
    expect(input().disabled).toBe(true);
    trigger().click();
    expect(click).toHaveBeenCalledTimes(3);
  });

  it("opens from a FieldLabel, since the trigger takes the field's id", async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});
    render(() => h(Field, () => [h(FieldLabel, () => "Avatar"), upload()]));

    await userEvent.click($("field-label"));
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("opens once from a click on the zone or its Browse button, never from a file row, and is no tab stop", async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});
    render(() => browseZone({ multiple: true, modelValue: [pdf()], id: "upload" }));
    await nextTick();

    expect(dropzone().tagName).toBe("DIV");
    expect(dropzone().hasAttribute("tabindex")).toBe(false);
    expect(dropzone().hasAttribute("role")).toBe(false);

    await userEvent.click($("file-upload-title"));
    expect(click).toHaveBeenCalledTimes(1);
    await userEvent.click(browse());
    expect(click).toHaveBeenCalledTimes(2);
    await userEvent.click($("file-upload-item-name"));
    expect(click).toHaveBeenCalledTimes(2);

    expect(browse().id).toBe("upload");
    expect(browse().getAttribute("aria-describedby")).toBe($("file-upload-description").id);
  });

  // nuxt/ui#5102: no key handlers, so Tab walks out of the component as usual
  it("lets Tab move from the trigger through the Remove buttons and out", async () => {
    render(() => [
      upload({ multiple: true, modelValue: [image("a.png"), pdf("b.pdf")] }),
      h("button", { id: "after" }, "After"),
    ]);
    await nextTick();

    trigger().focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(removes()[0]);
    await userEvent.tab();
    expect(document.activeElement).toBe(removes()[1]);
    await userEvent.tab();
    expect(document.activeElement?.id).toBe("after");
  });
});

describe("FileUpload picking files", () => {
  it("replaces the file in single mode", async () => {
    const { value } = controlled(null, { accept: "image/*" });
    await userEvent.upload(input(), image("a.png"));
    expect((value.value as File).name).toBe("a.png");
    await userEvent.upload(input(), image("b.png"));
    expect((value.value as File).name).toBe("b.png");
    expect(names()).toEqual(["b.png"]);
  });

  it("appends in multiple mode", async () => {
    const { value } = controlled([], { multiple: true });
    await userEvent.upload(input(), [image("a.png"), pdf("b.pdf")]);
    await userEvent.upload(input(), pdf("c.pdf"));

    expect((value.value as File[]).map((file) => file.name)).toEqual(["a.png", "b.pdf", "c.pdf"]);
    await nextTick();
    expect(input().files).toHaveLength(3);
  });

  it("drops duplicates (same name, size and date) and reports them", async () => {
    const { value, rejected } = controlled([image("a.png", 5)], { multiple: true });
    await drop(dropzone(), image("a.png", 5), image("a.png", 6));

    expect((value.value as File[]).map((file) => file.lastModified)).toEqual([5, 6]);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]!.map(({ file, reason }) => [file.name, reason])).toEqual([["a.png", "duplicate"]]);
  });

  it("checks the dialog's files against accept too, since the OS dialog can show all files", async () => {
    const { value, rejected } = controlled(null, { accept: "image/*" });
    await userEvent.upload(input(), pdf());
    expect(value.value).toBeNull();
    expect(rejected[0]![0]!.reason).toBe("type");
    await nextTick();
    expect(input().files).toHaveLength(0);
  });
});

describe("FileUpload drops", () => {
  it("tracks dragging through nested children and resets on drop", async () => {
    controlled(null);
    const zoneElement = dropzone();
    const child = $("file-upload-title");
    const transfer = transferOf(image());

    drag(zoneElement, "dragenter", transfer);
    drag(child, "dragenter", transfer);
    drag(zoneElement, "dragleave", transfer);
    await nextTick();
    expect($("file-upload").dataset.dragging).toBe("");
    expect(zoneElement.dataset.dragging).toBe("");

    drag(child, "drop", transfer);
    await nextTick();
    expect($("file-upload").dataset.dragging).toBeUndefined();
  });

  it("resets dragging when the drag ends anywhere on the page", async () => {
    controlled(null);
    drag(dropzone(), "dragenter", transferOf(image()));
    await nextTick();
    expect($("file-upload").dataset.dragging).toBe("");
    window.dispatchEvent(new DragEvent("dragend"));
    await nextTick();
    expect($("file-upload").dataset.dragging).toBeUndefined();
  });

  // nuxt/ui#4638: a rejected or disabled drop must still be taken, or the browser opens the file
  it("takes every file drag, even a rejected or disabled one, but leaves text drags alone", async () => {
    const { value, rejected } = controlled(null, { accept: "image/*" });
    const over = drag(dropzone(), "dragover", transferOf(pdf()));
    expect(over.defaultPrevented).toBe(true);
    expect((await drop(dropzone(), pdf())).defaultPrevented).toBe(true);
    expect(value.value).toBeNull();
    expect(rejected[0]![0]!.reason).toBe("type");

    const text = new DataTransfer();
    text.setData("text/plain", "hello");
    expect(drag(dropzone(), "dragover", text).defaultPrevented).toBe(false);

    document.body.innerHTML = "";
    const disabled = controlled(null, { disabled: true });
    const event = drag(dropzone(), "dragover", transferOf(image()));
    expect(event.defaultPrevented).toBe(true);
    expect(event.dataTransfer!.dropEffect).toBe("none");
    expect((await drop(dropzone(), image())).defaultPrevented).toBe(true);
    expect(disabled.value.value).toBeNull();
    expect($("file-upload").dataset.dragging).toBeUndefined();
  });

  // nuxt/ui#6699: the zone reads its props at event time
  it("follows accept changes after mount", async () => {
    const accept = ref("image/*");
    const value = shallowRef<File | null>(null);
    mount(
      defineComponent(
        () => () =>
          upload({
            accept: accept.value,
            modelValue: value.value,
            "onUpdate:modelValue": (next: unknown) => (value.value = next as File | null),
          }),
      ),
      { attachTo: document.body },
    );

    accept.value = ".pdf";
    await nextTick();
    await drop(dropzone(), image());
    expect(value.value).toBeNull();
    await drop(dropzone(), pdf());
    expect(value.value?.name).toBe("report.pdf");
  });

  it("rejects folders, oversize files and files past maxFiles in one reject event", async () => {
    const entry = vi.spyOn(DataTransferItem.prototype, "webkitGetAsEntry");
    entry.mockImplementation(function (this: DataTransferItem) {
      return { isDirectory: this.getAsFile()?.name === "folder" } as FileSystemEntry;
    });
    const { value, rejected } = controlled([pdf("kept.pdf")], { multiple: true, maxFiles: 2, maxSize: 4096 });

    await drop(dropzone(), new File([], "folder"), pdf("big.pdf", 8192), pdf("one.pdf"), pdf("two.pdf"));

    expect((value.value as File[]).map((file) => file.name)).toEqual(["kept.pdf", "one.pdf"]);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]!.map(({ file, reason }) => [file.name, reason])).toEqual([
      ["folder", "directory"],
      ["big.pdf", "size"],
      ["two.pdf", "count"],
    ]);
  });

  it("keeps the first of several dropped files in single mode", async () => {
    const { value, rejected } = controlled(null);
    await drop(dropzone(), image("a.png"), image("b.png"), image("c.png"));
    expect((value.value as File).name).toBe("a.png");
    expect(rejected[0]!.map(({ reason }) => reason)).toEqual(["count", "count"]);
  });

  it("takes drops on a zone that holds the list", async () => {
    const value = shallowRef<File[]>([]);
    mount(
      defineComponent(
        () => () =>
          browseZone({
            multiple: true,
            modelValue: value.value,
            "onUpdate:modelValue": (next: unknown) => (value.value = next as File[]),
          }),
      ),
      { attachTo: document.body },
    );
    await drop(dropzone(), image());
    await nextTick();
    expect(value.value).toHaveLength(1);
    expect(dropzone().contains($("file-upload-list"))).toBe(true);
  });
});

describe("FileUpload paste", () => {
  const paste = (target: Element, ...files: File[]) => {
    const event = new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: transferOf(...files) });
    target.dispatchEvent(event);
    return event;
  };

  it("adds pasted files through the same checks", async () => {
    const { value, rejected } = controlled([], { multiple: true, accept: "image/*" });
    trigger().focus();
    expect(paste(trigger(), image(), pdf()).defaultPrevented).toBe(true);
    await nextTick();
    expect((value.value as File[]).map((file) => file.name)).toEqual(["photo.png"]);
    expect(rejected[0]![0]!.reason).toBe("type");
  });

  it.each([{ paste: false }, { disabled: true }])("ignores pastes with %o", async (props) => {
    const { value } = controlled(null, props);
    expect(paste($("file-upload"), image()).defaultPrevented).toBe(false);
    await nextTick();
    expect(value.value).toBeNull();
  });
});

describe("FileUpload model", () => {
  // nuxt/ui#5202
  it("clears to null in single mode and to [] in multiple mode", async () => {
    const single = controlled(image());
    await nextTick();
    removes()[0]!.click();
    await nextTick();
    expect(single.value.value).toBeNull();

    document.body.innerHTML = "";
    const multiple = controlled([image()], { multiple: true });
    await nextTick();
    removes()[0]!.click();
    await nextTick();
    expect(multiple.value.value).toEqual([]);
  });

  it("emits a new array on every change", async () => {
    const start: File[] = [image("a.png")];
    const { value } = controlled(start, { multiple: true });
    await drop(dropzone(), image("b.png"));
    expect(value.value).not.toBe(start);
    expect(start).toHaveLength(1);
  });

  it("works without v-model", async () => {
    render(() => upload({ multiple: true }));
    await drop(dropzone(), image("a.png"), pdf("b.pdf"));
    await nextTick();
    expect(names()).toEqual(["a.png", "b.pdf"]);
  });

  // nuxt/ui#6200
  it("converts the model when multiple changes", async () => {
    const multiple = ref(false);
    const value = shallowRef<Model>(image("a.png"));
    const rejected: FileUploadRejection[][] = [];
    mount(
      defineComponent(
        () => () =>
          upload({
            multiple: multiple.value,
            modelValue: value.value,
            "onUpdate:modelValue": (next: Model) => (value.value = next),
            onReject: (next: FileUploadRejection[]) => rejected.push(next),
          }),
      ),
      { attachTo: document.body },
    );

    multiple.value = true;
    await nextTick();
    await nextTick();
    expect((value.value as File[]).map((file) => file.name)).toEqual(["a.png"]);
    expect(input().multiple).toBe(true);

    value.value = [...(value.value as File[]), pdf("b.pdf")];
    await nextTick();
    multiple.value = false;
    await nextTick();
    await nextTick();
    expect((value.value as Model as File).name).toBe("a.png");
    expect(rejected[0]!.map(({ file, reason }) => [file.name, reason])).toEqual([["b.pdf", "count"]]);
  });
});

describe("FileUpload removing files", () => {
  it("labels Remove buttons with the file name and moves focus to the next one, the previous one, then the trigger", async () => {
    controlled([image("a.png"), image("b.png", 2), image("c.png", 3)], { multiple: true });
    await nextTick();
    expect(removes().map((button) => button.getAttribute("aria-label"))).toEqual([
      "Remove a.png",
      "Remove b.png",
      "Remove c.png",
    ]);

    removes()[0]!.focus();
    removes()[0]!.click();
    await nextTick();
    await nextTick();
    expect(names()).toEqual(["b.png", "c.png"]);
    expect(document.activeElement).toBe(removes()[0]);

    removes()[1]!.focus();
    removes()[1]!.click();
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(removes()[0]);

    removes()[0]!.click();
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(trigger());
  });

  it("does not move focus when a file is removed from outside", async () => {
    const { value } = controlled([image("a.png")], { multiple: true });
    await nextTick();
    const outside = document.createElement("button");
    document.body.append(outside);
    outside.focus();
    value.value = [];
    await nextTick();
    expect(document.activeElement).toBe(outside);
  });

  it("disables the Remove buttons when disabled", async () => {
    controlled([image()], { multiple: true, disabled: true });
    await nextTick();
    expect(removes()[0]!.disabled).toBe(true);
  });

  it("renders two files with the same name without duplicate-key warnings", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    controlled([image("a.png", 1), image("a.png", 2)], { multiple: true });
    await nextTick();
    expect(names()).toEqual(["a.png", "a.png"]);
    expect(warn).not.toHaveBeenCalled();
  });

  it("empties the model from a Clear button, which is disabled while there is nothing to clear", async () => {
    const value = shallowRef<File[]>([image(), pdf()]);
    mount(
      defineComponent(
        () => () =>
          h(
            FileUpload,
            {
              multiple: true,
              modelValue: value.value,
              "onUpdate:modelValue": (next: unknown) => (value.value = next as File[]),
            },
            { default: () => h(FileUploadClear, null, () => "Clear all") },
          ),
      ),
      { attachTo: document.body },
    );
    const clear = $<HTMLButtonElement>("file-upload-clear");
    expect(clear.type).toBe("button");
    clear.click();
    await nextTick();
    expect(value.value).toEqual([]);
    expect(clear.disabled).toBe(true);
  });
});

describe("FileUpload thumbnails", () => {
  it("makes one object URL per image file, none for other files, and revokes them on removal and unmount", async () => {
    const create = vi.spyOn(URL, "createObjectURL");
    const revoke = vi.spyOn(URL, "revokeObjectURL");
    const a = image("a.png");
    const b = image("b.png", 2);
    const { value, wrapper } = controlled([a, b, pdf()], { multiple: true });
    await nextTick();
    value.value = [...(value.value as File[])];
    await nextTick();
    value.value = [...(value.value as File[])];
    await nextTick();

    expect(create).toHaveBeenCalledTimes(2);
    const previews = $$("file-upload-item-preview");
    expect(previews.map((element) => element.querySelector("img")?.getAttribute("alt"))).toEqual(["", "", undefined]);

    value.value = [b];
    await nextTick();
    expect(revoke).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    expect(revoke).toHaveBeenCalledTimes(2);
  });

  // a blob: URL made while rendering on the server means nothing in the browser, and hydration would keep it
  it("makes no object URL on the server and hydrates without a mismatch", async () => {
    const create = vi.spyOn(URL, "createObjectURL");
    const files = [image("a.png"), pdf()];
    const app = () => createSSRApp({ render: () => upload({ multiple: true, defaultValue: files }) });
    const html = await renderToString(app());
    expect(html).not.toContain("blob:");
    expect(create).not.toHaveBeenCalled();

    const container = document.body.appendChild(document.createElement("div"));
    container.innerHTML = html;
    const warn = vi.spyOn(console, "warn");
    app().mount(container);
    await nextTick();
    expect(warn).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(1);
    expect(container.querySelector("img")?.getAttribute("src")).toMatch(/^blob:/);
  });
});

describe("FileUpload layouts", () => {
  // nuxt/ui#6543: grid tiles keep the name of files without a thumbnail
  it("shows the name under a non-image tile and keeps it for screen readers on an image tile", async () => {
    controlled([image("a.png"), pdf("b.pdf")], { multiple: true }, { layout: "grid" });
    await nextTick();
    const [tileA, tileB] = $$("file-upload-item");
    expect(tileA!.title).toBe("a.png");
    expect($("file-upload-item-content", tileA!).className).toContain("sr-only");
    expect($("file-upload-item-content", tileB!).className).not.toContain("sr-only");
    expect($("file-upload-item-name", tileB!).getBoundingClientRect().width).toBeGreaterThan(0);
    expect($("file-upload-item-size", tileB!).className).toContain("sr-only");
  });

  it("puts the Remove overlay on the top-end corner of a tile, mirrored in RTL", async () => {
    document.documentElement.dir = "rtl";
    controlled([image()], { multiple: true }, { layout: "grid" });
    await nextTick();
    const tile = $("file-upload-item").getBoundingClientRect();
    const remove = removes()[0]!.getBoundingClientRect();
    expect(remove.left).toBeLessThan(tile.left);
    expect(remove.top).toBeLessThan(tile.top);
  });

  // without isolation, "228 B" and "notes (1).pdf" come out as "B 228" and "notes (1.pdf)" in an RTL page
  it("keeps Latin names and sizes in reading order in RTL, aligned to the start", async () => {
    document.documentElement.dir = "rtl";
    controlled([pdf("notes (1).pdf", 228)], { multiple: true });
    await nextTick();
    const left = (element: Element, char: string) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let text = walker.nextNode() as Text;
      while (!text.data.includes(char)) text = walker.nextNode() as Text;
      const at = text.data.indexOf(char);
      const range = document.createRange();
      range.setStart(text, at);
      range.setEnd(text, at + 1);
      return range.getBoundingClientRect().left;
    };
    const size = $("file-upload-item-size");
    const name = $("file-upload-item-name");
    expect(size.textContent).toBe("228 B");
    expect(left(size, "2")).toBeLessThan(left(size, "B"));
    expect(left(name, "n")).toBeLessThan(left(name, "f"));
    expect(getComputedStyle(name).direction).toBe("rtl");
    expect(name.getBoundingClientRect().right).toBeCloseTo($("file-upload-item-content").getBoundingClientRect().right);
  });
});

describe("FileUpload item content", () => {
  it("lets FileUploadItemMetadata's content be replaced, with the file and its formatted size", async () => {
    render(() =>
      h(
        FileUpload,
        { multiple: true, modelValue: [pdf("a.pdf", 1024)] },
        {
          default: ({ files }: { files: File[] }) =>
            h(FileUploadList, null, () =>
              files.map((file) =>
                h(FileUploadItem, { key: fileKey(file), file }, () =>
                  h(FileUploadItemMetadata, null, {
                    default: ({ file: entry, size }: { file: File; size: string }) =>
                      h("span", { "data-test": "custom" }, `${entry.name}: ${size}`),
                  }),
                ),
              ),
            ),
        },
      ),
    );
    await nextTick();
    expect(document.querySelector("[data-test=custom]")?.textContent).toBe("a.pdf: 1 KB");
    expect($("file-upload-item-name")).toBeNull();
  });
});

describe("FileUpload in a Field", () => {
  it("takes the field's id, description, error, invalid and disabled state", async () => {
    render(() =>
      h(Field, { invalid: true, disabled: true }, () => [
        h(FieldLabel, () => "Résumé"),
        upload({ multiple: true, modelValue: [pdf()] }, { description: "PDF only" }),
        h(FieldDescription, () => "We read every one."),
        h(FieldError, { errors: "Add your résumé." }),
      ]),
    );
    await nextTick();

    const field = $("field");
    const described = trigger().getAttribute("aria-describedby")!.split(" ");
    expect(trigger().id).toBe($("field-label").getAttribute("for"));
    expect(described).toContain($("file-upload-description").id);
    expect(described).toContain($("field-description").id);
    expect(described).toContain($("field-error").id);
    expect(trigger().getAttribute("aria-invalid")).toBe("true");
    expect(trigger().disabled).toBe(true);
    expect(input().disabled).toBe(true);
    expect(removes()[0]!.disabled).toBe(true);
    expect(field.contains(trigger())).toBe(true);
  });

  it("puts required on the input only", () => {
    render(() => h(Field, { required: true }, () => [h(FieldLabel, () => "Avatar"), upload()]));
    expect(input().required).toBe(true);
    expect(trigger().hasAttribute("aria-required")).toBe(false);
    expect(trigger().hasAttribute("required")).toBe(false);
  });
});

describe("FileUpload sizes", () => {
  overrideControlTokens();

  it.each(controlSizes)("reads the control tokens at %s", async (size) => {
    controlled([pdf()], { size, multiple: true });
    await nextTick();
    const icon = $("file-upload-icon");
    const zoneStyle = getComputedStyle(dropzone());
    expect(px(getComputedStyle(icon).width)).toBe(sentinel.height[size]);
    expect(px(getComputedStyle(icon.querySelector("svg")!).width)).toBe(sentinel.icon[size]);
    expect(px(zoneStyle.rowGap)).toBe(sentinel.gap[size]);
    expect(px(zoneStyle.paddingInlineStart)).toBe(sentinel.padding[size]);
    expect(px(zoneStyle.paddingTop)).toBe(sentinel.padding[size] * 2);
    expect(px(getComputedStyle($("file-upload-item-preview")).width)).toBe(sentinel.height[size]);
    expect(px(getComputedStyle($("file-upload-list")).rowGap)).toBe(sentinel.gap[size]);
    expect($("file-upload").dataset.size).toBe(size);
  });
});

describe("FileUpload variants", () => {
  it.each([
    ["outline", "dashed", false],
    ["soft", "solid", true],
    ["subtle", "dashed", true],
  ] as const)("draws the %s frame", (variant, borderStyle, filled) => {
    render(() => upload({ style: "--muted: rgb(1, 2, 3); --background: rgb(4, 5, 6)" }, { variant }));
    const style = getComputedStyle(dropzone());
    expect(style.borderTopStyle).toBe(borderStyle);
    expect(style.backgroundColor === "rgb(1, 2, 3)").toBe(filled);
    // the icon circle stays visible on a filled frame
    expect(getComputedStyle($("file-upload-icon")).backgroundColor).toBe(filled ? "rgb(4, 5, 6)" : "rgb(1, 2, 3)");
  });

  it("rings the frame while the trigger has keyboard focus", async () => {
    render(() => [h("button", { id: "before" }, "Before"), upload()]);
    document.getElementById("before")!.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger());
    expect(getComputedStyle(dropzone()).outlineStyle).toBe("solid");
  });
});
