import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

import FileUploadAvatar from "@/examples/file-upload/FileUploadAvatar.vue";
import FileUploadForm from "@/examples/file-upload/FileUploadForm.vue";
import FileUploadMultiple from "@/examples/file-upload/FileUploadMultiple.vue";
import FileUploadPageDrop from "@/examples/file-upload/FileUploadPageDrop.vue";

const settle = () => new Promise((resolve) => setTimeout(resolve, 100));

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
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
    await settle();
    await nextTick();

    const triggers = all("file-upload-trigger");
    expect(all("field-error").map((error) => error.textContent)).toEqual([
      "Choose a cover photo.",
      "Add at least one floor plan.",
    ]);
    expect(triggers.map((trigger) => trigger.getAttribute("aria-invalid"))).toEqual(["true", "true"]);
    expect(document.activeElement).toBe(triggers[0]);

    const [cover, plans] = all("file-upload-dropzone");
    await drop(cover!, png("front.png"));
    await drop(plans!, pdf("ground.pdf"), png("upstairs.png"));
    await settle();
    await nextTick();

    const sizes = all("file-upload-item-size").map((size) => size.textContent?.trim());
    expect(sizes).toEqual(["16 B", "1 KB", "Floor plans must be PDFs."]);

    all("file-upload-item-remove")[2]!.click();
    await nextTick();
    document.querySelector<HTMLButtonElement>("button[type=submit]")!.click();
    await settle();
    await nextTick();
    expect(all("field-error")).toHaveLength(0);
    expect(document.querySelector("[role=status]")?.textContent).toBe("Published with front.png and 1 floor plan(s).");
  });

  it("attaches files dropped anywhere on the page, once", async () => {
    mount(FileUploadPageDrop, { attachTo: document.body });
    await drop(document.body, pdf("notes.pdf"));
    await nextTick();
    expect(all("file-upload-item-name").map((name) => name.textContent)).toEqual(["notes.pdf"]);

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
