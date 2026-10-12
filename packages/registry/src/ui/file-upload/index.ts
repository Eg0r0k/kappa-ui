/*
  The parts follow Dice UI's FileUpload (https://github.com/sadmann7/diceui), the file-size format Nuxt UI's
  (https://github.com/nuxt/ui), both modified for kappa-ui.
  Copyright (c) 2024 Sadman Sakib. MIT License: https://github.com/sadmann7/diceui/blob/main/LICENSE
  Copyright (c) 2023 Nuxt. MIT License: https://github.com/nuxt/ui/blob/v4/LICENSE.md
*/
import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { ComputedRef } from "vue";

import type { ButtonSize } from "@/ui/button";

export { default as FileUpload } from "./FileUpload.vue";
export { default as FileUploadClear } from "./FileUploadClear.vue";
export { default as FileUploadDescription } from "./FileUploadDescription.vue";
export { default as FileUploadDropzone } from "./FileUploadDropzone.vue";
export { default as FileUploadIcon } from "./FileUploadIcon.vue";
export { default as FileUploadItem } from "./FileUploadItem.vue";
export { default as FileUploadItemDelete } from "./FileUploadItemDelete.vue";
export { default as FileUploadItemMetadata } from "./FileUploadItemMetadata.vue";
export { default as FileUploadItemPreview } from "./FileUploadItemPreview.vue";
export { default as FileUploadList } from "./FileUploadList.vue";
export { default as FileUploadTitle } from "./FileUploadTitle.vue";
export { default as FileUploadTrigger } from "./FileUploadTrigger.vue";

export type FileUploadVariant = "outline" | "soft" | "subtle";
export type FileUploadSize = "xs" | "sm" | "md" | "lg" | "xl";
export type FileUploadLayout = "list" | "grid";
export type FileUploadRejectReason = "type" | "size" | "count" | "duplicate" | "directory";
export type FileUploadRejection = { file: File; reason: FileUploadRejectReason };
export type FileUploadModel<M extends boolean = false> = (M extends true ? File[] : File) | null;

/** What a template ref on FileUpload gives you. */
export type FileUploadExpose = {
  open: () => void;
  clear: () => void;
  addFiles: (files: FileList | File[]) => void;
  removeFile: (file: File) => void;
  inputRef: HTMLInputElement | null;
};

/** Whether `file` matches an `accept` list: MIME types, `type/*` wildcards and `.ext` extensions, comma-separated. */
export const acceptsFile = (file: File, accept?: string) => {
  const patterns = (accept ?? "")
    .split(",")
    .map((pattern) => pattern.trim().toLowerCase())
    .filter(Boolean);
  if (patterns.length === 0) return true;
  const fileName = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  return patterns.some((pattern) => {
    if (pattern === "*" || pattern === "*/*") return true;
    if (pattern.startsWith(".")) return fileName.endsWith(pattern);
    if (pattern.endsWith("/*")) return mime !== "" && mime.startsWith(pattern.slice(0, -1));
    return mime === pattern;
  });
};

const units = ["B", "KB", "MB", "GB", "TB"];

/** A byte count for people: `0 B`, `980 B`, `1.5 KB`, `12 MB`. Base 1024. */
export const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  let exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  let value = bytes / 1024 ** exponent;
  // 1,048,575 bytes rounds to 1024 KB: print it as 1 MB
  if (Math.round(value) >= 1024 && exponent > 0 && exponent < units.length - 1) {
    exponent += 1;
    value /= 1024;
  }
  const digits = exponent === 0 || value >= 10 ? 0 : 1;
  return `${Number(value.toFixed(digits))} ${units[exponent]}`;
};

const keys = new WeakMap<File, number>();
let nextKey = 0;

/** A stable `v-for` key for a file: Vue keys must be primitives, and two files can share a name. */
export const fileKey = (file: File) => {
  let key = keys.get(file);
  if (key === undefined) {
    key = nextKey++;
    keys.set(file, key);
  }
  return key;
};

const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

export type FileUploadCandidate = { file: File; directory?: boolean };

export type FileUploadGateOptions = {
  multiple: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
};

/**
 * Runs incoming files through the checks in order (directory, type, size, duplicate, count) and returns the
 * files the model should hold next, the ones that got in, and the ones that didn't with the reason.
 */
export const gateFiles = (candidates: FileUploadCandidate[], current: File[], options: FileUploadGateOptions) => {
  const rejections: FileUploadRejection[] = [];
  const passed: File[] = [];
  const reject = (file: File, reason: FileUploadRejectReason) => rejections.push({ file, reason });

  for (const { file, directory } of candidates) {
    if (directory) reject(file, "directory");
    else if (!acceptsFile(file, options.accept)) reject(file, "type");
    else if (options.maxSize !== undefined && file.size > options.maxSize) reject(file, "size");
    else if (options.multiple && [...current, ...passed].some((other) => sameFile(other, file)))
      reject(file, "duplicate");
    else passed.push(file);
  }

  const room = options.multiple
    ? Math.max(0, (options.maxFiles ?? Number.POSITIVE_INFINITY) - current.length)
    : Math.min(passed.length, 1);
  const accepted = passed.slice(0, room);
  for (const file of passed.slice(room)) reject(file, "count");

  const files = options.multiple ? [...current, ...accepted] : accepted.length > 0 ? accepted : current;
  return { files, accepted, rejections };
};

export type FileUploadContext = {
  files: ComputedRef<File[]>;
  size: ComputedRef<FileUploadSize>;
  disabled: ComputedRef<boolean>;
  invalid: ComputedRef<boolean>;
  triggerId: ComputedRef<string>;
  describedBy: ComputedRef<string | undefined>;
  registerDescription: (id: string) => () => void;
  setDragging: (dragging: boolean) => void;
  open: () => void;
  addCandidates: (candidates: FileUploadCandidate[]) => void;
  removeFile: (file: File) => void;
  clear: () => void;
  urlOf: (file: File) => string | undefined;
};

export const [injectFileUploadContext, provideFileUploadContext] = createContext<FileUploadContext>("FileUpload");

export const [injectFileUploadListContext, provideFileUploadListContext] = createContext<{
  layout: ComputedRef<FileUploadLayout>;
}>("FileUploadList");

export const [injectFileUploadItemContext, provideFileUploadItemContext] = createContext<{
  file: ComputedRef<File>;
  url: ComputedRef<string | undefined>;
}>("FileUploadItem");

/** The root: a column holding the drop zone, the triggers and the file list. */
export const fileUploadVariants = cva("relative flex w-full min-w-0 flex-col gap-(--file-upload-gap)", {
  variants: {
    size: {
      xs: `
        [--file-upload-radius:--theme(--radius-surface-sm)] [--file-upload-gap:var(--control-gap-xs)]
        [--file-upload-padding:var(--control-padding-xs)] [--file-upload-control:var(--control-height-xs)]
        [--file-upload-icon:var(--control-icon-xs)] [--file-upload-remove-icon:var(--control-icon-xs)]
        [--file-upload-title:var(--typescale-label-md-size)]
        [--file-upload-title-leading:var(--typescale-label-md-line-height)]
        [--file-upload-description:var(--typescale-body-sm-size)]
        [--file-upload-description-leading:var(--typescale-body-sm-line-height)]
        [--file-upload-name:var(--typescale-body-sm-size)]
        [--file-upload-name-leading:var(--typescale-body-sm-line-height)]
      `,
      sm: `
        [--file-upload-radius:--theme(--radius-surface-sm)] [--file-upload-gap:var(--control-gap-sm)]
        [--file-upload-padding:var(--control-padding-sm)] [--file-upload-control:var(--control-height-sm)]
        [--file-upload-icon:var(--control-icon-sm)] [--file-upload-remove-icon:var(--control-icon-xs)]
        [--file-upload-title:var(--typescale-label-lg-size)]
        [--file-upload-title-leading:var(--typescale-label-lg-line-height)]
        [--file-upload-description:var(--typescale-body-sm-size)]
        [--file-upload-description-leading:var(--typescale-body-sm-line-height)]
        [--file-upload-name:var(--typescale-body-md-size)]
        [--file-upload-name-leading:var(--typescale-body-md-line-height)]
      `,
      md: `
        [--file-upload-radius:--theme(--radius-surface-md)] [--file-upload-gap:var(--control-gap-md)]
        [--file-upload-padding:var(--control-padding-md)] [--file-upload-control:var(--control-height-md)]
        [--file-upload-icon:var(--control-icon-md)] [--file-upload-remove-icon:var(--control-icon-xs)]
        [--file-upload-title:var(--typescale-label-lg-size)]
        [--file-upload-title-leading:var(--typescale-label-lg-line-height)]
        [--file-upload-description:var(--typescale-body-sm-size)]
        [--file-upload-description-leading:var(--typescale-body-sm-line-height)]
        [--file-upload-name:var(--typescale-body-md-size)]
        [--file-upload-name-leading:var(--typescale-body-md-line-height)]
      `,
      lg: `
        [--file-upload-radius:--theme(--radius-surface-md)] [--file-upload-gap:var(--control-gap-lg)]
        [--file-upload-padding:var(--control-padding-lg)] [--file-upload-control:var(--control-height-lg)]
        [--file-upload-icon:var(--control-icon-lg)] [--file-upload-remove-icon:var(--control-icon-sm)]
        [--file-upload-title:var(--typescale-label-lg-size)]
        [--file-upload-title-leading:var(--typescale-label-lg-line-height)]
        [--file-upload-description:var(--typescale-body-sm-size)]
        [--file-upload-description-leading:var(--typescale-body-sm-line-height)]
        [--file-upload-name:var(--typescale-body-md-size)]
        [--file-upload-name-leading:var(--typescale-body-md-line-height)]
      `,
      xl: `
        [--file-upload-radius:--theme(--radius-surface-md)] [--file-upload-gap:var(--control-gap-xl)]
        [--file-upload-padding:var(--control-padding-xl)] [--file-upload-control:var(--control-height-xl)]
        [--file-upload-icon:var(--control-icon-xl)] [--file-upload-remove-icon:var(--control-icon-sm)]
        [--file-upload-title:var(--typescale-title-md-size)]
        [--file-upload-title-leading:var(--typescale-title-md-line-height)]
        [--file-upload-description:var(--typescale-body-md-size)]
        [--file-upload-description-leading:var(--typescale-body-md-line-height)]
        [--file-upload-name:var(--typescale-body-md-size)]
        [--file-upload-name-leading:var(--typescale-body-md-line-height)]
      `,
    },
  },
  defaultVariants: { size: "md" },
});

/** The surface that takes drops: a dashed or filled frame, its content centred in a column. */
export const fileUploadDropzoneVariants = cva(
  `
    relative flex w-full flex-1 flex-col items-center justify-center gap-(--file-upload-gap)
    rounded-(--file-upload-radius) border px-(--file-upload-padding) py-[calc(var(--file-upload-padding)*2)] text-center
    text-foreground outline-none state-layer cursor-pointer transition-[border-color,background-color] duration-short-3
    ease-standard
    focus-visible:focus-ring
    not-data-invalid:focus-visible:border-primary
    group-has-[[data-slot=file-upload-input]:focus]/file-upload:focus-ring
    not-data-invalid:group-has-[[data-slot=file-upload-input]:focus]/file-upload:border-primary
    data-dragging:border-primary data-dragging:bg-primary/(--state-pressed)
    data-invalid:not-data-dragging:border-destructive
    data-disabled:cursor-not-allowed data-disabled:text-foreground/(--disabled-opacity)
    data-disabled:before:hidden
    motion-reduce:transition-none
  `,
  {
    variants: {
      variant: {
        outline: `border-dashed border-input data-disabled:border-foreground/(--disabled-container-opacity)`,
        soft: "border-transparent bg-muted",
        subtle: `border-dashed border-input bg-muted data-disabled:border-foreground/(--disabled-container-opacity)`,
      },
    },
    defaultVariants: { variant: "outline" },
  },
);

/** The trigger on its own: a bare button; a Button through `as-child`, or the dropzone's frame through its `as-child`. */
export const fileUploadTrigger = "outline-none focus-visible:focus-ring disabled:cursor-not-allowed";

/** The circle behind the zone's icon, lifted off a filled frame. */
export const fileUploadIcon = `
  flex size-(--file-upload-control) shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground
  icon-size-(--file-upload-icon)
  group-data-[variant=soft]/file-upload-dropzone:bg-background
  group-data-[variant=subtle]/file-upload-dropzone:bg-background
  in-data-disabled:text-foreground/(--disabled-opacity)
`;

export const fileUploadTitle = "block text-(length:--file-upload-title)/(--file-upload-title-leading) font-medium";

export const fileUploadDescription = `
  block text-(length:--file-upload-description)/(--file-upload-description-leading) font-normal text-muted-foreground
  in-data-disabled:text-foreground/(--disabled-opacity)
`;

export const fileUploadListVariants = cva(
  "w-full min-w-0 gap-(--file-upload-gap) text-start [--file-upload-tile:calc(var(--file-upload-control)*2.5)]",
  {
    variants: {
      layout: {
        list: "flex flex-col",
        grid: "grid grid-cols-[repeat(auto-fill,minmax(var(--file-upload-tile),1fr))]",
      },
    },
    defaultVariants: { layout: "list" },
  },
);

export const fileUploadItemVariants = cva(
  `
    relative min-w-0 cursor-auto gap-(--file-upload-gap) rounded-item-md border border-border p-(--file-upload-gap)
    in-data-disabled:text-foreground/(--disabled-opacity)
  `,
  {
    variants: {
      layout: {
        list: "flex items-center",
        grid: "flex aspect-square flex-col items-center justify-center bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { layout: "list" },
  },
);

export const fileUploadItemPreviewVariants = cva(
  "flex shrink-0 items-center justify-center overflow-hidden text-muted-foreground icon-size-(--file-upload-icon)",
  {
    variants: {
      layout: {
        list: "size-(--file-upload-control) rounded-item-xs bg-muted",
        grid: "data-image:absolute data-image:inset-0 data-image:rounded-inset-item-md/[1px]",
      },
    },
    defaultVariants: { layout: "list" },
  },
);

export const fileUploadItemName =
  "block truncate text-(length:--file-upload-name)/(--file-upload-name-leading) font-normal";

/** The Remove button of a list row, one step below the control's size. */
export const fileUploadRemoveSize: Record<FileUploadSize, ButtonSize> = {
  xs: "icon-xs",
  sm: "icon-xs",
  md: "icon-sm",
  lg: "icon-md",
  xl: "icon-lg",
};

/** The round Remove button over the top-end corner of a tile. */
export const fileUploadRemoveOverlay = `
  absolute -end-1.5 -top-1.5 z-10 size-[calc(var(--file-upload-icon)+--spacing(2))] rounded-full ring-2 ring-background
  icon-size-(--file-upload-remove-icon)
`;

export type FileUploadVariants = VariantProps<typeof fileUploadVariants>;
