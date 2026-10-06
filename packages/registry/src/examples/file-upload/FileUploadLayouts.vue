<script setup lang="ts">
import { FileUpload } from "@/ui/file-upload";

const picture = (name: string, from: string, to: string) =>
  new File(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><linearGradient id="g" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient><rect width="4" height="3" fill="url(#g)"/></svg>`,
    ],
    name,
    { type: "image/svg+xml", lastModified: 0 },
  );

const files = [
  picture("sunset.svg", "#f97316", "#7c3aed"),
  picture("forest.svg", "#166534", "#a3e635"),
  new File([new Uint8Array(184_320)], "itinerary.pdf", { type: "application/pdf", lastModified: 0 }),
];

const layouts = [
  { layout: "list", position: "outside" },
  { layout: "list", position: "inside" },
  { layout: "grid", position: "outside" },
  { layout: "grid", position: "inside" },
] as const;
</script>

<template>
  <div class="grid w-full max-w-3xl gap-6 md:grid-cols-2">
    <FileUpload
      v-for="{ layout, position } in layouts"
      :key="`${layout}-${position}`"
      :default-value="files"
      multiple
      :layout="layout"
      :position="position"
      size="sm"
      :label="`${layout}, ${position}`"
      description="Photos and PDFs"
    />
  </div>
</template>
