<script setup lang="ts" generic="M extends boolean = false">
import { useId } from "reka-ui";
import {
  type HTMLAttributes,
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  useTemplateRef,
  watch,
} from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";

import {
  type FileUploadCandidate,
  type FileUploadModel,
  type FileUploadRejection,
  type FileUploadSize,
  fileUploadVariants,
  gateFiles,
  provideFileUploadContext,
} from ".";

const props = withDefaults(
  defineProps<{
    /** Holds a list of files (`File[]`) instead of one (`File`). */
    multiple?: M & boolean;
    defaultValue?: FileUploadModel<M>;
    accept?: string;
    maxFiles?: number;
    maxSize?: number;
    paste?: boolean;
    size?: FileUploadSize;
    id?: string;
    name?: string;
    form?: string;
    capture?: "user" | "environment";
    disabled?: boolean;
    required?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  { size: "md", paste: true },
);

const emit = defineEmits<{
  reject: [rejections: FileUploadRejection[]];
}>();

defineSlots<{
  default?(props: {
    files: File[];
    open: () => void;
    clear: () => void;
    removeFile: (file: File) => void;
    addFiles: (files: FileList | File[]) => void;
    urlOf: (file: File) => string | undefined;
    dragging: boolean;
    invalid: boolean;
  }): unknown;
}>();

const model = defineModel<FileUploadModel<M>>();
if (model.value === undefined && props.defaultValue !== undefined) model.value = props.defaultValue;

const attrs = useAttrs();
const control = useFieldControl(props, attrs);
const fallbackId = useId(undefined, "file-upload");

const root = useTemplateRef<HTMLDivElement>("root");
const input = useTemplateRef<HTMLInputElement>("input");

const files = computed<File[]>(() => {
  const value = model.value as File | File[] | null | undefined;
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
});

const isDisabled = computed(() => Boolean(control.disabled.value));
const nativeInvalid = ref(false);
const invalid = computed(() => control.invalid.value ?? (nativeInvalid.value || undefined));
const isInvalid = computed(() => invalid.value === true || invalid.value === "true");
const triggerId = computed(() => control.id.value ?? fallbackId);

const descriptions = shallowRef<string[]>([]);
const registerDescription = (id: string) => {
  descriptions.value = [...descriptions.value, id];
  return () => {
    descriptions.value = descriptions.value.filter((entry) => entry !== id);
  };
};
const describedBy = computed(
  () => [...descriptions.value, control.describedBy.value].filter(Boolean).join(" ") || undefined,
);

const draggingZones = ref(0);
const dragging = computed(() => !isDisabled.value && draggingZones.value > 0);
const setDragging = (on: boolean) => {
  draggingZones.value = Math.max(0, draggingZones.value + (on ? 1 : -1));
};

const write = (next: File[]) => {
  model.value = (props.multiple ? next : (next[0] ?? null)) as FileUploadModel<M>;
};

const syncInput = () => {
  const element = input.value;
  if (!element) return;
  try {
    const transfer = new DataTransfer();
    for (const file of files.value) transfer.items.add(file);
    element.files = transfer.files;
  } catch {
    // Safari before 14.1 has no DataTransfer constructor: v-model still works, native submission misses drops
    if (files.value.length === 0) element.value = "";
  }
  if (element.validity.valid) nativeInvalid.value = false;
};

const addCandidates = (candidates: FileUploadCandidate[]) => {
  if (isDisabled.value || candidates.length === 0) return;
  const result = gateFiles(candidates, files.value, {
    multiple: Boolean(props.multiple),
    accept: props.accept,
    maxSize: props.maxSize,
    maxFiles: props.maxFiles,
  });
  if (result.accepted.length > 0) write(result.files);
  if (result.rejections.length > 0) emit("reject", result.rejections);
};

const addFiles = (incoming: FileList | File[]) => addCandidates([...incoming].map((file) => ({ file })));

const open = () => {
  if (isDisabled.value) return;
  input.value?.click();
};

const focusAfterRemoval = async (index: number, change: () => void) => {
  const hadFocus = root.value?.contains(document.activeElement) ?? false;
  change();
  await nextTick();
  const element = root.value;
  if (!hadFocus || !element || element.contains(document.activeElement)) return;
  const buttons = [...element.querySelectorAll<HTMLElement>("[data-slot=file-upload-item-delete]")];
  const target = buttons[index] ?? buttons[index - 1] ?? document.getElementById(triggerId.value);
  target?.focus();
};

const clear = () => {
  if (files.value.length === 0) return;
  void focusAfterRemoval(0, () => write([]));
};

const removeFile = (file: File) => {
  const index = files.value.indexOf(file);
  if (index === -1) return;
  void focusAfterRemoval(index, () => write(files.value.filter((entry) => entry !== file)));
};

const onChange = () => {
  const element = input.value;
  if (!element) return;
  addFiles([...(element.files ?? [])]);
  // the dialog replaced the input's files with the new pick; put the model's files back
  void nextTick(syncInput);
};

const onPaste = (event: ClipboardEvent) => {
  if (!props.paste || isDisabled.value) return;
  const pasted = [...(event.clipboardData?.files ?? [])];
  if (pasted.length === 0) return;
  event.preventDefault();
  addFiles(pasted);
};

// A blob URL lives only in the document that made it, so none is made on the server or for the hydrating render
const mounted = ref(false);
const urls = new Map<File, string>();
const urlOf = (file: File) => {
  if (!mounted.value || !file.type.startsWith("image/")) return undefined;
  let url = urls.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    urls.set(file, url);
  }
  return url;
};
const revokeUrls = (keep: File[] = []) => {
  for (const [file, url] of urls) {
    if (keep.includes(file)) continue;
    URL.revokeObjectURL(url);
    urls.delete(file);
  }
};

watch(files, (current) => revokeUrls(current));
watch(files, syncInput, { flush: "post" });

watch(
  () => Boolean(props.multiple),
  (multiple) => {
    const value = model.value as File | File[] | null | undefined;
    if (multiple && !Array.isArray(value)) {
      model.value = (value ? [value] : []) as FileUploadModel<M>;
    } else if (!multiple && Array.isArray(value)) {
      const [first = null, ...rest] = value;
      model.value = first as FileUploadModel<M>;
      if (rest.length > 0)
        emit(
          "reject",
          rest.map((file) => ({ file, reason: "count" })),
        );
    }
  },
);

// A native form reset empties the file input. Follow it back to the starting files, so the list and what the form
// submits stay the same. The event comes before the reset and a later listener may still cancel it, so wait a task.
const onFormReset = (event: Event) => {
  if (!input.value?.form || event.target !== input.value.form) return;
  setTimeout(() => {
    if (event.defaultPrevented) return;
    const start = props.defaultValue as File | File[] | null | undefined;
    nativeInvalid.value = false;
    write(start ? (Array.isArray(start) ? [...start] : [start]) : []);
    void nextTick(syncInput);
  });
};

onMounted(() => {
  mounted.value = true;
  syncInput();
  document.addEventListener("reset", onFormReset);
});

onBeforeUnmount(() => {
  document.removeEventListener("reset", onFormReset);
  revokeUrls();
});

provideFileUploadContext({
  files,
  size: computed(() => props.size),
  disabled: isDisabled,
  invalid: isInvalid,
  triggerId,
  describedBy,
  registerDescription,
  setDragging,
  open,
  addCandidates,
  removeFile,
  clear,
  urlOf,
});

defineExpose({ open, clear, addFiles, removeFile, inputRef: input });
</script>

<template>
  <div
    ref="root"
    data-slot="file-upload"
    :data-size="props.size"
    :data-disabled="isDisabled ? '' : undefined"
    :data-invalid="isInvalid ? '' : undefined"
    :data-dragging="dragging ? '' : undefined"
    :data-empty="files.length === 0 ? '' : undefined"
    :class="cn('group/file-upload', fileUploadVariants({ size: props.size }), props.class)"
    @paste="onPaste"
  >
    <input
      ref="input"
      type="file"
      data-slot="file-upload-input"
      aria-hidden="true"
      tabindex="-1"
      :name="props.name"
      :form="props.form"
      :accept="props.accept"
      :multiple="props.multiple"
      :capture="props.capture"
      :required="control.required.value"
      :disabled="isDisabled"
      class="peer pointer-events-none sr-only start-1/2 bottom-0"
      @change="onChange"
      @invalid="nativeInvalid = true"
    />
    <slot
      :files="files"
      :open="open"
      :clear="clear"
      :remove-file="removeFile"
      :add-files="addFiles"
      :url-of="urlOf"
      :dragging="dragging"
      :invalid="isInvalid"
    />
  </div>
</template>
