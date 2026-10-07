<script setup lang="ts">
import { Copy, Pencil, Trash2 } from "@lucide/vue";
import { computed, nextTick, ref, shallowRef } from "vue";

import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/ui/menu";
import { Tree, TreeItem, TreeItemLabel, TreeItemToggle, flattenTree } from "@/ui/tree";

type Note = { id: string; label: string; children?: Note[] };

let next = 0;
const note = (label: string, children?: Note[]): Note => ({ id: `note-${next++}`, label, children });

const notes = shallowRef<Note[]>([
  note("Work", [note("Roadmap"), note("1:1 agenda"), note("Hiring plan")]),
  note("Personal", [note("Reading list"), note("Trip to Kyoto")]),
  note("Inbox"),
]);

// Rows stop click, not contextmenu: one menu on the container finds the row it opened on.
const target = ref<string>();
const pick = (event: MouseEvent) => {
  target.value = (event.target as Element).closest<HTMLElement>("[role=treeitem]")?.dataset.key;
};
const targetNote = computed(() => flattenTree(notes.value).find((item) => item.id === target.value));

const edit = (nodes: Note[], id: string, change: (node: Note) => Note[]): Note[] =>
  nodes.flatMap((node) =>
    node.id === id ? change(node) : node.children ? [{ ...node, children: edit(node.children, id, change) }] : [node],
  );

const copyOf = (node: Note): Note => note(`${node.label} copy`, node.children?.map(copyOf));

const duplicate = () => {
  if (target.value) notes.value = edit(notes.value, target.value, (node) => [node, copyOf(node)]);
};
const remove = () => {
  if (target.value) notes.value = edit(notes.value, target.value, () => []);
};

const renaming = ref<string>();
const vFocus = { mounted: (el: HTMLInputElement) => el.select() };

// The menu gives focus back to the row as it closes; start editing then, so the field keeps focus.
const pending = ref<string>();
const onFocusin = (event: FocusEvent) => {
  const key = (event.target as Element).closest<HTMLElement>("[role=treeitem]")?.dataset.key;
  if (pending.value === undefined || key !== pending.value) return;
  renaming.value = pending.value;
  pending.value = undefined;
};

const commit = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const id = renaming.value;
  if (id === undefined) return;
  const label = input.value.trim();
  if (label) notes.value = edit(notes.value, id, (node) => [{ ...node, label }]);
  renaming.value = undefined;
  // The input is gone after the update; give focus back to its row.
  const row = input.closest<HTMLElement>("[role=treeitem]");
  nextTick(() => row?.focus());
};
const cancel = (event: Event) => {
  const row = (event.target as Element).closest<HTMLElement>("[role=treeitem]");
  renaming.value = undefined;
  nextTick(() => row?.focus());
};
</script>

<template>
  <div class="w-full max-w-xs" @contextmenu.capture="pick" @focusin="onFocusin">
    <Tree v-slot="{ items }" :items="notes" :default-expanded="[notes[0]!.id]" variant="outline" aria-label="Notes">
      <TreeItem v-for="row in items" :key="row._id" v-slot="{ item }" :item="row">
        <TreeItemToggle />
        <TreeItemLabel>
          <input
            v-if="item.id === renaming"
            v-focus
            :value="item.label"
            aria-label="Name"
            class="w-full min-w-0 rounded-sm bg-background px-1 outline-none focus-visible:focus-ring"
            @click.stop
            @keydown.enter.prevent="commit"
            @keydown.escape.stop="cancel"
            @blur="commit"
          />
          <template v-else>{{ item.label }}</template>
        </TreeItemLabel>
      </TreeItem>
    </Tree>
    <Menu context-menu class="w-48">
      <MenuLabel class="truncate">{{ targetNote?.label ?? "Notes" }}</MenuLabel>
      <MenuSeparator />
      <MenuItem :disabled="!targetNote" @select="pending = target">
        <Pencil />
        Rename
      </MenuItem>
      <MenuItem :disabled="!targetNote" @select="duplicate">
        <Copy />
        Duplicate
      </MenuItem>
      <MenuItem :disabled="!targetNote" variant="destructive" @select="remove">
        <Trash2 />
        Delete
      </MenuItem>
    </Menu>
  </div>
</template>
