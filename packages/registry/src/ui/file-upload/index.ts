/*
  The API (mode, layout, position, the file slots and the size format) follows Nuxt UI's FileUpload
  (https://github.com/nuxt/ui), modified for kappa-ui.
  Copyright (c) 2023 Nuxt. MIT License: https://github.com/nuxt/ui/blob/v4/LICENSE.md
*/
import { type VariantProps, cva } from "class-variance-authority";

import type { ButtonSize } from "@/ui/button";

export { default as FileUpload } from "./FileUpload.vue";

export type FileUploadMode = "area" | "button";
export type FileUploadVariant = "outline" | "soft" | "subtle";
export type FileUploadSize = "xs" | "sm" | "md" | "lg" | "xl";
export type FileUploadLayout = "list" | "grid";
export type FileUploadPosition = "inside" | "outside";
export type FileUploadRejectReason = "type" | "size" | "count" | "duplicate" | "directory";
export type FileUploadRejection = { file: File; reason: FileUploadRejectReason };
export type FileUploadModel<M extends boolean = false> = (M extends true ? File[] : File) | null;

/** What the slots get to act on the files. */
export type FileUploadSlotActions = {
  files: File[];
  open: () => void;
  removeFile: (index?: number) => void;
  clear: () => void;
};

/** What a template ref on FileUpload gives you. */
export type FileUploadExpose = {
  open: () => void;
  clear: () => void;
  addFiles: (files: FileList | File[]) => void;
  removeFile: (index?: number) => void;
  inputRef: HTMLInputElement | null;
  triggerEl: HTMLElement | null;
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

/** The root: the column holding the drop zone and the file list. */
export const fileUploadVariants = cva("relative flex w-full min-w-0 flex-col", {
  variants: {
    mode: { area: "", button: "items-start" },
    size: {
      xs: "gap-(--control-gap-xs) [--file-upload-radius:--theme(--radius-lg)]",
      sm: "gap-(--control-gap-sm) [--file-upload-radius:--theme(--radius-lg)]",
      md: "gap-(--control-gap-md) [--file-upload-radius:--theme(--radius-xl)]",
      lg: "gap-(--control-gap-lg) [--file-upload-radius:--theme(--radius-xl)]",
      xl: "gap-(--control-gap-xl) [--file-upload-radius:--theme(--radius-xl)]",
    },
  },
  defaultVariants: { mode: "area", size: "md" },
});

/** The dashed surface that takes drops in `area` mode: the drop zone, or the whole root with `position="inside"`. */
export const fileUploadFrameVariants = cva(
  `
    rounded-(--file-upload-radius) border transition-[border-color,background-color] duration-short-3 ease-standard
    has-[[data-slot=file-upload-trigger]:focus-visible]:focus-ring
    has-[[data-slot=file-upload-input]:focus]:focus-ring
    not-data-invalid:has-[[data-slot=file-upload-trigger]:focus-visible]:border-primary
    not-data-invalid:has-[[data-slot=file-upload-input]:focus]:border-primary
    data-dragging:border-primary data-dragging:bg-primary/(--state-pressed)
    data-invalid:not-data-dragging:border-destructive
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

/** The trigger in `area` mode: the button that opens the file dialog, holding the icon, label and description. */
export const fileUploadTriggerVariants = cva(
  `
    relative flex w-full flex-1 flex-col items-center justify-center rounded-[calc(var(--file-upload-radius)-1px)]
    text-center text-foreground outline-none
  `,
  {
    variants: {
      interactive: {
        true: `
          state-layer cursor-pointer
          disabled:cursor-not-allowed disabled:text-foreground/(--disabled-opacity)
          disabled:before:hidden
        `,
        false: "",
      },
      size: {
        xs: "gap-(--control-gap-xs) px-(--control-padding-xs) py-[calc(var(--control-padding-xs)*2)]",
        sm: "gap-(--control-gap-sm) px-(--control-padding-sm) py-[calc(var(--control-padding-sm)*2)]",
        md: "gap-(--control-gap-md) px-(--control-padding-md) py-[calc(var(--control-padding-md)*2)]",
        lg: "gap-(--control-gap-lg) px-(--control-padding-lg) py-[calc(var(--control-padding-lg)*2)]",
        xl: "gap-(--control-gap-xl) px-(--control-padding-xl) py-[calc(var(--control-padding-xl)*2)]",
      },
    },
    defaultVariants: { interactive: true, size: "md" },
  },
);

/** The circle behind the upload icon in `area` mode, lifted off a filled frame. */
export const fileUploadIconVariants = cva(
  "flex shrink-0 items-center justify-center rounded-full text-muted-foreground",
  {
    variants: {
      variant: {
        outline: "bg-muted",
        soft: "bg-background",
        subtle: "bg-background",
      },
      size: {
        xs: "size-(--control-height-xs) icon-size-(--control-icon-xs)",
        sm: "size-(--control-height-sm) icon-size-(--control-icon-sm)",
        md: "size-(--control-height-md) icon-size-(--control-icon-md)",
        lg: "size-(--control-height-lg) icon-size-(--control-icon-lg)",
        xl: "size-(--control-height-xl) icon-size-(--control-icon-xl)",
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export const fileUploadLabelVariants = cva("block", {
  variants: {
    size: {
      xs: "text-label-md",
      sm: "text-label-lg",
      md: "text-label-lg",
      lg: "text-label-lg",
      xl: "text-title-md",
    },
  },
  defaultVariants: { size: "md" },
});

export const fileUploadDescriptionVariants = cva("block text-muted-foreground", {
  variants: {
    size: {
      xs: "text-body-sm",
      sm: "text-body-sm",
      md: "text-body-sm",
      lg: "text-body-sm",
      xl: "text-body-md",
    },
  },
  defaultVariants: { size: "md" },
});

export const fileUploadActionsVariants = cva("flex flex-wrap items-center justify-center", {
  variants: {
    size: {
      xs: "gap-(--control-gap-xs) px-(--control-padding-xs) pb-(--control-padding-xs)",
      sm: "gap-(--control-gap-sm) px-(--control-padding-sm) pb-(--control-padding-sm)",
      md: "gap-(--control-gap-md) px-(--control-padding-md) pb-(--control-padding-md)",
      lg: "gap-(--control-gap-lg) px-(--control-padding-lg) pb-(--control-padding-lg)",
      xl: "gap-(--control-gap-xl) px-(--control-padding-xl) pb-(--control-padding-xl)",
    },
  },
  defaultVariants: { size: "md" },
});

export const fileUploadListVariants = cva("w-full min-w-0", {
  variants: {
    layout: {
      list: "flex flex-col",
      grid: "grid grid-cols-[repeat(auto-fill,minmax(var(--file-upload-tile),1fr))]",
    },
    inside: { true: "", false: "" },
    size: {
      xs: "gap-(--control-gap-xs) [--file-upload-tile:calc(var(--control-height-xs)*2.5)]",
      sm: "gap-(--control-gap-sm) [--file-upload-tile:calc(var(--control-height-sm)*2.5)]",
      md: "gap-(--control-gap-md) [--file-upload-tile:calc(var(--control-height-md)*2.5)]",
      lg: "gap-(--control-gap-lg) [--file-upload-tile:calc(var(--control-height-lg)*2.5)]",
      xl: "gap-(--control-gap-xl) [--file-upload-tile:calc(var(--control-height-xl)*2.5)]",
    },
  },
  compoundVariants: [
    { inside: true, size: "xs", class: "px-(--control-padding-xs) pb-(--control-padding-xs)" },
    { inside: true, size: "sm", class: "px-(--control-padding-sm) pb-(--control-padding-sm)" },
    { inside: true, size: "md", class: "px-(--control-padding-md) pb-(--control-padding-md)" },
    { inside: true, size: "lg", class: "px-(--control-padding-lg) pb-(--control-padding-lg)" },
    { inside: true, size: "xl", class: "px-(--control-padding-xl) pb-(--control-padding-xl)" },
  ],
  defaultVariants: { layout: "list", inside: false, size: "md" },
});

export const fileUploadItemVariants = cva("relative min-w-0 rounded-lg border border-border", {
  variants: {
    layout: {
      list: "flex items-center",
      grid: "flex aspect-square flex-col items-center justify-center bg-muted text-muted-foreground",
    },
    size: {
      xs: "gap-(--control-gap-xs) p-(--control-gap-xs)",
      sm: "gap-(--control-gap-sm) p-(--control-gap-sm)",
      md: "gap-(--control-gap-md) p-(--control-gap-md)",
      lg: "gap-(--control-gap-lg) p-(--control-gap-lg)",
      xl: "gap-(--control-gap-xl) p-(--control-gap-xl)",
    },
  },
  defaultVariants: { layout: "list", size: "md" },
});

export const fileUploadItemMediaVariants = cva(
  "flex shrink-0 items-center justify-center overflow-hidden text-muted-foreground",
  {
    variants: {
      layout: {
        list: "rounded-md bg-muted",
        grid: "data-image:absolute data-image:inset-0 data-image:rounded-[calc(--theme(--radius-lg)-1px)]",
      },
      size: {
        xs: "icon-size-(--control-icon-xs)",
        sm: "icon-size-(--control-icon-sm)",
        md: "icon-size-(--control-icon-md)",
        lg: "icon-size-(--control-icon-lg)",
        xl: "icon-size-(--control-icon-xl)",
      },
    },
    compoundVariants: [
      { layout: "list", size: "xs", class: "size-(--control-height-xs)" },
      { layout: "list", size: "sm", class: "size-(--control-height-sm)" },
      { layout: "list", size: "md", class: "size-(--control-height-md)" },
      { layout: "list", size: "lg", class: "size-(--control-height-lg)" },
      { layout: "list", size: "xl", class: "size-(--control-height-xl)" },
    ],
    defaultVariants: { layout: "list", size: "md" },
  },
);

export const fileUploadItemNameVariants = cva("block truncate", {
  variants: {
    size: {
      xs: "text-body-sm",
      sm: "text-body-md",
      md: "text-body-md",
      lg: "text-body-md",
      xl: "text-body-md",
    },
  },
  defaultVariants: { size: "md" },
});

/** The Remove button of a list row, one step below the control's size. */
export const fileUploadRemoveSize: Record<FileUploadSize, ButtonSize> = {
  xs: "icon-xs",
  sm: "icon-xs",
  md: "icon-sm",
  lg: "icon-md",
  xl: "icon-lg",
};

/** The round Remove button over the top-end corner of a tile or a button-mode preview. */
export const fileUploadRemoveOverlayVariants = cva(
  "absolute -end-1.5 -top-1.5 z-10 rounded-full ring-2 ring-background",
  {
    variants: {
      size: {
        xs: "size-[calc(var(--control-icon-xs)+--spacing(2))] icon-size-(--control-icon-xs)",
        sm: "size-[calc(var(--control-icon-sm)+--spacing(2))] icon-size-(--control-icon-xs)",
        md: "size-[calc(var(--control-icon-md)+--spacing(2))] icon-size-(--control-icon-xs)",
        lg: "size-[calc(var(--control-icon-lg)+--spacing(2))] icon-size-(--control-icon-sm)",
        xl: "size-[calc(var(--control-icon-xl)+--spacing(2))] icon-size-(--control-icon-sm)",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type FileUploadVariants = VariantProps<typeof fileUploadVariants>;
