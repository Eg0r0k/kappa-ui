<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type HTMLAttributes, computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { cn } from "@/lib/utils";

import {
  type FileUploadCandidate,
  type FileUploadVariant,
  fileUploadDropzoneVariants,
  injectFileUploadContext,
} from ".";

const props = withDefaults(
  defineProps<PrimitiveProps & { variant?: FileUploadVariant; class?: HTMLAttributes["class"] }>(),
  { as: "div", variant: "outline" },
);

const upload = injectFileUploadContext();

const depth = ref(0);
const dragging = computed(() => !upload.disabled.value && depth.value > 0);
watch(
  () => depth.value > 0,
  (over) => upload.setDragging(over),
);

const carriesFiles = (event: DragEvent) => event.dataTransfer?.types.includes("Files") ?? false;

const candidatesOf = (transfer: DataTransfer): FileUploadCandidate[] => {
  const items = [...(transfer.items ?? [])].filter((item) => item.kind === "file");
  if (items.length === 0) return [...transfer.files].map((file) => ({ file }));
  return items.flatMap((item) => {
    const file = item.getAsFile();
    if (!file) return [];
    return [{ file, directory: item.webkitGetAsEntry?.()?.isDirectory ?? false }];
  });
};

// A file drag is always taken, even when disabled or about to be rejected, so the browser never opens or downloads
// the file in place of the page.
const onDragEnter = (event: DragEvent) => {
  if (!carriesFiles(event)) return;
  event.preventDefault();
  depth.value += 1;
};

const onDragOver = (event: DragEvent) => {
  if (!carriesFiles(event)) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = upload.disabled.value ? "none" : "copy";
};

const onDragLeave = (event: DragEvent) => {
  if (!carriesFiles(event)) return;
  depth.value = Math.max(0, depth.value - 1);
};

const onDrop = (event: DragEvent) => {
  if (!carriesFiles(event)) return;
  event.preventDefault();
  depth.value = 0;
  if (event.dataTransfer) upload.addCandidates(candidatesOf(event.dataTransfer));
};

const resetDrag = () => {
  depth.value = 0;
};

// The trigger opens the dialog itself, and a file row or another control inside the zone is not a way to open it
const interactive = "[data-slot=file-upload-trigger], [data-slot=file-upload-list], a, button, input, label";

const onClick = (event: MouseEvent) => {
  if ((event.target as Element).closest(interactive)) return;
  upload.open();
};

onMounted(() => {
  window.addEventListener("dragend", resetDrag);
  window.addEventListener("drop", resetDrag);
});

onBeforeUnmount(() => {
  window.removeEventListener("dragend", resetDrag);
  window.removeEventListener("drop", resetDrag);
  if (depth.value > 0) upload.setDragging(false);
});
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    data-slot="file-upload-dropzone"
    :data-variant="props.variant"
    :data-dragging="dragging ? '' : undefined"
    :data-disabled="upload.disabled.value ? '' : undefined"
    :data-invalid="upload.invalid.value ? '' : undefined"
    :class="
      cn(
        'group/file-upload-dropzone',
        fileUploadDropzoneVariants({ variant: props.variant, size: upload.size.value }),
        props.class,
      )
    "
    @click="onClick"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <slot :dragging="dragging" />
  </Primitive>
</template>
