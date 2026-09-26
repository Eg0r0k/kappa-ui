<script setup lang="ts">
import { FileText, Trash2 } from "@lucide/vue";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { useToast } from "@/ui/toast";

const toast = useToast();

const files = ref(["Budget.xlsx", "Minutes.docx", "Roadmap.pdf"]);
const deleted = ref<string[]>([]);

const remove = (name: string) => {
  const index = files.value.indexOf(name);
  files.value.splice(index, 1);
  let undone = false;
  toast.add({
    title: `${name} moved to the bin`,
    actions: [
      {
        label: "Undo",
        altText: "Restore it from the bin",
        onClick: () => {
          undone = true;
          files.value.splice(index, 0, name);
        },
      },
    ],
    onClose: () => {
      if (!undone) deleted.value.push(name);
    },
  });
};
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-3">
    <ul class="flex flex-col gap-1">
      <li v-for="name in files" :key="name" class="flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-muted">
        <FileText class="size-4 text-muted-foreground" />
        <span class="flex-1 text-body-md">{{ name }}</span>
        <Button variant="ghost" color="neutral" size="icon-xs" :aria-label="`Delete ${name}`" @click="remove(name)">
          <Trash2 />
        </Button>
      </li>
    </ul>
    <p class="text-body-sm text-muted-foreground">
      Deleted for good: {{ deleted.length ? deleted.join(", ") : "nothing yet" }}
    </p>
  </div>
</template>
