<!--
  The API (mode, layout, position, the file slots and the size format) follows Nuxt UI's FileUpload
  (https://github.com/nuxt/ui), modified for kappa-ui.
  Copyright (c) 2023 Nuxt. MIT License: https://github.com/nuxt/ui/blob/v4/LICENSE.md
-->
<script setup lang="ts" generic="M extends boolean = false">
import { File as FileIcon, Upload, X } from "@lucide/vue";
import { useId } from "reka-ui";
import {
  type Component,
  type ComponentPublicInstance,
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
import { Button } from "@/ui/button";
import {
  type FileUploadCandidate,
  type FileUploadLayout,
  type FileUploadMode,
  type FileUploadModel,
  type FileUploadPosition,
  type FileUploadRejection,
  type FileUploadSize,
  type FileUploadSlotActions,
  type FileUploadVariant,
  fileUploadActionsVariants,
  fileUploadDescriptionVariants,
  fileUploadFrameVariants,
  fileUploadIconVariants,
  fileUploadItemMediaVariants,
  fileUploadItemNameVariants,
  fileUploadItemVariants,
  fileUploadLabelVariants,
  fileUploadListVariants,
  fileUploadRemoveOverlayVariants,
  fileUploadRemoveSize,
  fileUploadTriggerVariants,
  fileUploadVariants,
  formatFileSize,
  gateFiles,
} from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Holds a list of files (`File[]`) instead of one (`File`). */
    multiple?: M & boolean;
    defaultValue?: FileUploadModel<M>;
    accept?: string;
    maxFiles?: number;
    maxSize?: number;
    mode?: FileUploadMode;
    variant?: FileUploadVariant;
    size?: FileUploadSize;
    layout?: FileUploadLayout;
    position?: FileUploadPosition;
    label?: string;
    description?: string;
    icon?: Component | false;
    fileIcon?: Component;
    fileImage?: boolean;
    fileDelete?: boolean;
    preview?: boolean;
    dropzone?: boolean;
    interactive?: boolean;
    paste?: boolean;
    id?: string;
    name?: string;
    form?: string;
    capture?: "user" | "environment";
    disabled?: boolean;
    required?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  {
    icon: undefined,
    mode: "area",
    variant: "outline",
    size: "md",
    layout: "list",
    position: "outside",
    fileImage: true,
    fileDelete: true,
    preview: true,
    dropzone: true,
    interactive: true,
    paste: true,
  },
);

const emit = defineEmits<{
  reject: [rejections: FileUploadRejection[]];
}>();

type TriggerAttrs = Record<string, unknown>;

const slots = defineSlots<{
  default?(props: FileUploadSlotActions & { dragging: boolean; triggerAttrs: TriggerAttrs }): unknown;
  leading?(props: Record<string, never>): unknown;
  label?(props: Record<string, never>): unknown;
  description?(props: Record<string, never>): unknown;
  actions?(props: FileUploadSlotActions & { triggerAttrs: TriggerAttrs }): unknown;
  files?(props: { files: File[]; removeFile: (index?: number) => void }): unknown;
  "files-top"?(props: FileUploadSlotActions): unknown;
  "files-bottom"?(props: FileUploadSlotActions): unknown;
  file?(props: { file: File; index: number; url: string | undefined; removeFile: (index?: number) => void }): unknown;
  "file-leading"?(props: { file: File; index: number; url: string | undefined }): unknown;
  "file-name"?(props: { file: File; index: number }): unknown;
  "file-size"?(props: { file: File; index: number }): unknown;
  "file-trailing"?(props: { file: File; index: number; removeFile: (index?: number) => void }): unknown;
}>();

const model = defineModel<FileUploadModel<M>>();
if (model.value === undefined && props.defaultValue !== undefined) model.value = props.defaultValue;

const attrs = useAttrs();
const control = useFieldControl(props, attrs);
const fallbackId = useId(undefined, "file-upload");
const descriptionId = useId(undefined, "file-upload-description");

const root = useTemplateRef<HTMLDivElement>("root");
const input = useTemplateRef<HTMLInputElement>("input");
const trigger = shallowRef<HTMLElement | null>(null);
const setTrigger = (target: Element | ComponentPublicInstance | null) => {
  trigger.value = target instanceof Element ? (target as HTMLElement) : ((target?.$el as HTMLElement) ?? null);
};

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
const showDescription = computed(
  () => props.mode === "area" && !slots.default && Boolean(props.description || slots.description),
);
const triggerAttrs = computed<TriggerAttrs>(() => {
  const { style: _, ...rest } = attrs;
  return {
    ...rest,
    id: triggerId.value,
    "aria-describedby":
      [showDescription.value && descriptionId, control.describedBy.value].filter(Boolean).join(" ") || undefined,
    "aria-invalid": invalid.value,
    disabled: isDisabled.value || undefined,
  };
});

const surfaceIsRoot = computed(() => props.mode === "area" && props.position === "inside");
const buttonPreview = computed(
  () => props.mode === "button" && !props.multiple && props.layout === "grid" && props.preview,
);
const previewFile = computed(() => (buttonPreview.value ? files.value[0] : undefined));
const hasLabel = computed(() => Boolean(props.label || slots.label));
const showList = computed(() => props.preview && files.value.length > 0 && !buttonPreview.value);

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
  const buttons = [...element.querySelectorAll<HTMLElement>("[data-slot=file-upload-item-remove]")];
  const target = buttons[index] ?? buttons[index - 1] ?? trigger.value ?? document.getElementById(triggerId.value);
  target?.focus();
};

const clear = () => {
  if (files.value.length === 0) return;
  void focusAfterRemoval(0, () => write([]));
};

const removeFile = (index?: number) => {
  if (index === undefined || !props.multiple) return clear();
  if (index < 0 || index >= files.value.length) return;
  void focusAfterRemoval(index, () => write(files.value.filter((_, at) => at !== index)));
};

const onChange = () => {
  const element = input.value;
  if (!element) return;
  addFiles([...(element.files ?? [])]);
  // the dialog replaced the input's files with the new pick; put the model's files back
  void nextTick(syncInput);
};

// Drops

const dragDepth = ref(0);
const dragging = computed(() => props.dropzone && !isDisabled.value && dragDepth.value > 0);
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

// With the zone on, a file drag is always taken, even when disabled or about to be rejected, so the browser never
// opens or downloads the file in place of the page.
const onDragEnter = (event: DragEvent) => {
  if (!props.dropzone || !carriesFiles(event)) return;
  event.preventDefault();
  dragDepth.value += 1;
};

const onDragOver = (event: DragEvent) => {
  if (!props.dropzone || !carriesFiles(event)) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = isDisabled.value ? "none" : "copy";
};

const onDragLeave = (event: DragEvent) => {
  if (!props.dropzone || !carriesFiles(event)) return;
  dragDepth.value = Math.max(0, dragDepth.value - 1);
};

const onDrop = (event: DragEvent) => {
  if (!props.dropzone || !carriesFiles(event)) return;
  event.preventDefault();
  dragDepth.value = 0;
  if (event.dataTransfer) addCandidates(candidatesOf(event.dataTransfer));
};

const dropListeners = { dragenter: onDragEnter, dragover: onDragOver, dragleave: onDragLeave, drop: onDrop };
const resetDrag = () => {
  dragDepth.value = 0;
};

const onPaste = (event: ClipboardEvent) => {
  if (!props.paste || isDisabled.value) return;
  const pasted = [...(event.clipboardData?.files ?? [])];
  if (pasted.length === 0) return;
  event.preventDefault();
  addFiles(pasted);
};

// Thumbnails: one object URL per image file, made on first render and revoked when the file leaves

const urls = new Map<File, string>();
const urlOf = (file: File) => {
  if (!props.fileImage || !file.type.startsWith("image/")) return undefined;
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

const keys = new WeakMap<File, number>();
let nextKey = 0;
const keyOf = (file: File) => {
  let key = keys.get(file);
  if (key === undefined) {
    key = nextKey++;
    keys.set(file, key);
  }
  return key;
};

watch(files, (current) => revokeUrls(props.fileImage ? current : []));
watch(
  () => props.fileImage,
  (on) => !on && revokeUrls(),
);
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

onMounted(() => {
  syncInput();
  window.addEventListener("dragend", resetDrag);
  window.addEventListener("drop", resetDrag);
});

onBeforeUnmount(() => {
  window.removeEventListener("dragend", resetDrag);
  window.removeEventListener("drop", resetDrag);
  revokeUrls();
});

const slotActions = computed<FileUploadSlotActions>(() => ({ files: files.value, open, removeFile, clear }));

const stateAttrs = computed(() => ({
  "data-dragging": dragging.value ? "" : undefined,
  "data-disabled": isDisabled.value ? "" : undefined,
  "data-invalid": isInvalid.value ? "" : undefined,
}));

const buttonColor = computed(() => (isInvalid.value ? "destructive" : dragging.value ? "primary" : "neutral"));
const buttonSize = computed(() => (hasLabel.value ? props.size : (`icon-${props.size}` as const)));

defineExpose({ open, clear, addFiles, removeFile, inputRef: input, triggerRef: trigger });
</script>

<template>
  <div
    ref="root"
    data-slot="file-upload"
    v-bind="stateAttrs"
    :data-mode="props.mode"
    :data-variant="props.variant"
    :data-size="props.size"
    :data-layout="props.layout"
    :data-position="props.position"
    :data-empty="files.length === 0 ? '' : undefined"
    :style="attrs.style as HTMLAttributes['style']"
    :class="
      cn(
        fileUploadVariants({ mode: props.mode, size: props.size }),
        surfaceIsRoot && ['gap-0', fileUploadFrameVariants({ variant: props.variant })],
        props.class,
      )
    "
    v-on="surfaceIsRoot ? dropListeners : {}"
    @paste="onPaste"
  >
    <div
      data-slot="file-upload-dropzone"
      v-bind="stateAttrs"
      :class="
        cn(
          'relative flex flex-col',
          props.mode === 'area' ? 'w-full flex-1' : 'w-fit max-w-full',
          props.mode === 'area' && !surfaceIsRoot && fileUploadFrameVariants({ variant: props.variant }),
        )
      "
      v-on="surfaceIsRoot ? {} : dropListeners"
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
      <slot v-bind="slotActions" :dragging="dragging" :trigger-attrs="triggerAttrs">
        <template v-if="props.mode === 'area'">
          <button
            v-if="props.interactive"
            :ref="setTrigger"
            v-bind="triggerAttrs"
            type="button"
            data-slot="file-upload-trigger"
            :class="fileUploadTriggerVariants({ interactive: true, size: props.size })"
            @click="open"
          >
            <span
              v-if="props.icon !== false || slots.leading"
              data-slot="file-upload-icon"
              :class="
                cn(
                  fileUploadIconVariants({ size: props.size }),
                  'in-data-disabled:text-foreground/(--disabled-opacity)',
                )
              "
            >
              <slot name="leading">
                <component :is="props.icon || Upload" />
              </slot>
            </span>
            <span v-if="hasLabel" data-slot="file-upload-label" :class="fileUploadLabelVariants({ size: props.size })">
              <slot name="label">{{ props.label }}</slot>
            </span>
            <span
              v-if="showDescription"
              :id="descriptionId"
              data-slot="file-upload-description"
              :class="
                cn(
                  fileUploadDescriptionVariants({ size: props.size }),
                  'in-data-disabled:text-foreground/(--disabled-opacity)',
                )
              "
            >
              <slot name="description">{{ props.description }}</slot>
            </span>
          </button>
          <div
            v-else
            data-slot="file-upload-trigger"
            :class="fileUploadTriggerVariants({ interactive: false, size: props.size })"
          >
            <span
              v-if="props.icon !== false || slots.leading"
              data-slot="file-upload-icon"
              :class="fileUploadIconVariants({ size: props.size })"
            >
              <slot name="leading">
                <component :is="props.icon || Upload" />
              </slot>
            </span>
            <span v-if="hasLabel" data-slot="file-upload-label" :class="fileUploadLabelVariants({ size: props.size })">
              <slot name="label">{{ props.label }}</slot>
            </span>
            <span
              v-if="showDescription"
              :id="descriptionId"
              data-slot="file-upload-description"
              :class="fileUploadDescriptionVariants({ size: props.size })"
            >
              <slot name="description">{{ props.description }}</slot>
            </span>
          </div>
          <div
            v-if="slots.actions"
            data-slot="file-upload-actions"
            :class="fileUploadActionsVariants({ size: props.size })"
          >
            <slot name="actions" v-bind="slotActions" :trigger-attrs="triggerAttrs" />
          </div>
        </template>
        <template v-else>
          <Button
            :ref="setTrigger"
            v-bind="triggerAttrs"
            type="button"
            data-slot="file-upload-trigger"
            :variant="props.variant"
            :color="buttonColor"
            :size="buttonSize"
            :class="cn('peer-focus:focus-ring', previewFile && urlOf(previewFile) && 'overflow-hidden')"
            @click="open"
          >
            <img
              v-if="previewFile && urlOf(previewFile)"
              data-slot="file-upload-preview"
              :src="urlOf(previewFile)"
              :alt="previewFile.name"
              class="size-full object-cover"
            />
            <template v-else>
              <slot name="leading">
                <component
                  :is="previewFile ? props.fileIcon || FileIcon : props.icon || Upload"
                  v-if="previewFile || props.icon !== false"
                  data-slot="file-upload-icon"
                  :data-icon="hasLabel ? 'inline-start' : undefined"
                />
              </slot>
              <span v-if="hasLabel" data-slot="file-upload-label">
                <slot name="label">{{ props.label }}</slot>
              </span>
            </template>
          </Button>
          <Button
            v-if="previewFile && props.fileDelete"
            data-slot="file-upload-item-remove"
            type="button"
            variant="solid"
            color="neutral"
            size="icon-xs"
            touch-target="expand"
            :disabled="isDisabled"
            :aria-label="`Remove ${previewFile.name}`"
            :class="fileUploadRemoveOverlayVariants({ size: props.size })"
            @click="removeFile(0)"
          >
            <X />
          </Button>
        </template>
      </slot>
    </div>
    <template v-if="props.preview">
      <slot name="files-top" v-bind="slotActions" />
      <component
        :is="slots.files ? 'div' : 'ul'"
        v-if="showList"
        data-slot="file-upload-list"
        :role="slots.files ? undefined : 'list'"
        :class="fileUploadListVariants({ layout: props.layout, inside: surfaceIsRoot, size: props.size })"
      >
        <slot name="files" :files="files" :remove-file="removeFile">
          <li
            v-for="(file, index) in files"
            :key="keyOf(file)"
            data-slot="file-upload-item"
            :data-image="urlOf(file) ? '' : undefined"
            :title="props.layout === 'grid' ? file.name : undefined"
            :class="
              cn(
                fileUploadItemVariants({ layout: props.layout, size: props.size }),
                'in-data-disabled:text-foreground/(--disabled-opacity)',
              )
            "
          >
            <slot name="file" :file="file" :index="index" :url="urlOf(file)" :remove-file="removeFile">
              <div
                data-slot="file-upload-item-media"
                :data-image="urlOf(file) ? '' : undefined"
                :class="fileUploadItemMediaVariants({ layout: props.layout, size: props.size })"
              >
                <slot name="file-leading" :file="file" :index="index" :url="urlOf(file)">
                  <img
                    v-if="urlOf(file)"
                    :src="urlOf(file)"
                    alt=""
                    class="size-full object-cover in-data-disabled:opacity-(--disabled-opacity)"
                  />
                  <component :is="props.fileIcon || FileIcon" v-else />
                </slot>
              </div>
              <div
                data-slot="file-upload-item-content"
                :class="
                  props.layout === 'list'
                    ? 'flex min-w-0 flex-1 flex-col'
                    : urlOf(file)
                      ? 'sr-only'
                      : 'w-full min-w-0 text-center'
                "
              >
                <div
                  data-slot="file-upload-item-name"
                  :class="
                    cn(fileUploadItemNameVariants({ size: props.size }), props.layout === 'grid' && 'text-body-sm')
                  "
                >
                  <slot name="file-name" :file="file" :index="index">{{ file.name }}</slot>
                </div>
                <div
                  data-slot="file-upload-item-size"
                  :class="cn('block text-body-sm text-muted-foreground', props.layout === 'grid' && 'sr-only')"
                >
                  <slot name="file-size" :file="file" :index="index">{{ formatFileSize(file.size) }}</slot>
                </div>
              </div>
              <slot name="file-trailing" :file="file" :index="index" :remove-file="removeFile">
                <Button
                  v-if="props.fileDelete"
                  data-slot="file-upload-item-remove"
                  type="button"
                  :variant="props.layout === 'grid' ? 'solid' : 'ghost'"
                  color="neutral"
                  :size="props.layout === 'grid' ? 'icon-xs' : fileUploadRemoveSize[props.size]"
                  touch-target="expand"
                  :disabled="isDisabled"
                  :aria-label="`Remove ${file.name}`"
                  :class="
                    props.layout === 'grid' ? fileUploadRemoveOverlayVariants({ size: props.size }) : 'ms-auto shrink-0'
                  "
                  @click="removeFile(index)"
                >
                  <X />
                </Button>
              </slot>
            </slot>
          </li>
        </slot>
      </component>
      <slot name="files-bottom" v-bind="slotActions" />
    </template>
  </div>
</template>
