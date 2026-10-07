import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { nextTick } from "vue";

import FileUploadAvatar from "@/examples/file-upload/FileUploadAvatar.vue";
import FileUploadForm from "@/examples/file-upload/FileUploadForm.vue";
import FileUploadMultiple from "@/examples/file-upload/FileUploadMultiple.vue";
import FileUploadPageDrop from "@/examples/file-upload/FileUploadPageDrop.vue";

afterEach(() => {
  vi.restoreAllMocks();
});

const transferOf = (...files: File[]) => {
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  return transfer;
};

const drop = async (target: EventTarget, ...files: File[]) => {
  const transfer = transferOf(...files);
  for (const type of ["dragenter", "dragover", "drop"])
    target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: transfer }));
  await nextTick();
};

const pdf = (name: string, size = 1024) => new File([new Uint8Array(size)], name, { type: "application/pdf" });
const png = (name: string) => new File([new Uint8Array(16)], name, { type: "image/png" });

const all = (slot: string, scope: ParentNode = document) => [
  ...scope.querySelectorAll<HTMLElement>(`[data-slot=${slot}]`),
];

describe("FileUpload examples", () => {
  it("reads a bare multiple attribute as true", async () => {
    mount(FileUploadMultiple, { attachTo: document.body });
    await drop(all("file-upload-dropzone")[0]!, pdf("a.pdf"), pdf("b.pdf"));
    await nextTick();
    expect(all("file-upload-item")).toHaveLength(2);
    expect(document.querySelector<HTMLInputElement>("[data-slot=file-upload-input]")!.multiple).toBe(true);
  });

  it("validates files with Formisch: errors on submit, focus on the first trigger, one error per bad file", async () => {
    mount(FileUploadForm, { attachTo: document.body });
    document.querySelector<HTMLButtonElement>("button[type=submit]")!.click();

    // the cover's zone is its trigger; the floor plans have a trigger Button
    const triggers = () => [
      ...document.querySelectorAll<HTMLElement>(
        "button[data-slot=file-upload-dropzone], [data-slot=file-upload-trigger]",
      ),
    ];
    await expect
      .poll(() => all("field-error").map((error) => error.textContent))
      .toEqual(["Choose a cover photo.", "Add at least one floor plan."]);
    expect(triggers().map((trigger) => trigger.getAttribute("aria-invalid"))).toEqual(["true", "true"]);
    await expect.poll(() => document.activeElement).toBe(triggers()[0]);

    await drop(all("file-upload-dropzone")[0]!, png("front.png"));
    await userEvent.upload(all("file-upload-input")[1]!, [pdf("ground.pdf"), png("upstairs.png")]);

    const list = (index: number) => all("file-upload-list")[index]!;
    const lines = () =>
      all("file-upload-item-content", list(1)).map((content) =>
        [...content.children].map((line) => line.textContent?.trim()),
      );
    await expect.poll(lines).toEqual([
      ["ground.pdf", "1 KB"],
      ["upstairs.png", "Floor plans must be PDFs."],
    ]);
    expect(all("file-upload-item-size", list(0)).map((size) => size.textContent?.trim())).toEqual(["16 B"]);

    all("file-upload-item-delete")[2]!.click();
    await nextTick();
    document.querySelector<HTMLButtonElement>("button[type=submit]")!.click();
    await expect
      .poll(() => document.querySelector("[role=status]")?.textContent)
      .toBe("Published with front.png and 1 floor plan(s).");
    expect(all("field-error")).toHaveLength(0);
  });

  it("attaches files dropped anywhere on the page, once", async () => {
    mount(FileUploadPageDrop, { attachTo: document.body });
    await drop(document.body, pdf("notes.pdf"));
    await nextTick();
    expect(all("file-upload-item-name").map((name) => name.textContent)).toEqual(["notes.pdf"]);

    // a drop on the Attach button reaches the page handler too, and is added once
    await drop(all("file-upload-trigger")[0]!, pdf("plan.pdf"));
    await nextTick();
    expect(all("file-upload-item-name").map((name) => name.textContent)).toEqual(["notes.pdf", "plan.pdf"]);
  });

  it("keeps the saved avatar until a new photo is picked, and removes either", async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});
    mount(FileUploadAvatar, { attachTo: document.body });
    const [change, remove] = [...document.querySelectorAll<HTMLButtonElement>("button")];
    expect(change!.id).toBe(document.querySelector("[data-slot=field-label]")!.getAttribute("for"));
    change!.click();
    expect(click).toHaveBeenCalledTimes(1);

    remove!.click();
    await nextTick();
    expect(remove!.disabled).toBe(true);

    await drop(all("file-upload-dropzone")[0]!, png("me.png"));
    await nextTick();
    expect(remove!.disabled).toBe(false);
  });
});
