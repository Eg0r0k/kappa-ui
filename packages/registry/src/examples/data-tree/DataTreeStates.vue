<script setup lang="ts">
import { RotateCw } from "@lucide/vue";
import { computed, ref } from "vue";

import { Button } from "@/ui/button";
import { DataTree } from "@/ui/data-tree";
import {
  ErrorState,
  ErrorStateActions,
  ErrorStateDescription,
  ErrorStateHeader,
  ErrorStateMedia,
  ErrorStateTitle,
} from "@/ui/error-state";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";

type Folder = { id: string; label: string; children?: Folder[] };

const folders: Folder[] = [
  { id: "inbox", label: "Inbox" },
  {
    id: "projects",
    label: "Projects",
    children: [
      { id: "projects/kappa", label: "kappa-ui" },
      { id: "projects/site", label: "Website" },
    ],
  },
  { id: "archive", label: "Archive" },
];

const states = ["data", "loading", "empty", "error"] as const;
type State = (typeof states)[number];
const state = ref<State>("data");
const setState = (value: unknown) => {
  const next = states.find((candidate) => candidate === value);
  if (next) state.value = next;
};

const items = computed(() => (state.value === "data" ? folders : []));

const retry = () => {
  state.value = "loading";
  setTimeout(() => (state.value = "data"), 1000);
};
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-4">
    <ToggleGroup type="single" variant="outline" size="sm" :model-value="state" @update:model-value="setState">
      <ToggleGroupItem value="data">Data</ToggleGroupItem>
      <ToggleGroupItem value="loading">Loading</ToggleGroupItem>
      <ToggleGroupItem value="empty">Empty</ToggleGroupItem>
      <ToggleGroupItem value="error">Error</ToggleGroupItem>
    </ToggleGroup>
    <DataTree
      :items="items"
      :loading="state === 'loading'"
      :error="state === 'error'"
      variant="outline"
      aria-label="Folders"
      class="h-64"
    >
      <template #error>
        <ErrorState size="sm">
          <ErrorStateHeader>
            <ErrorStateMedia />
            <ErrorStateTitle>Couldn't load folders</ErrorStateTitle>
            <ErrorStateDescription>Check your connection and try again.</ErrorStateDescription>
          </ErrorStateHeader>
          <ErrorStateActions>
            <Button variant="outline" color="neutral" size="sm" @click="retry">
              <RotateCw data-icon="inline-start" />
              Retry
            </Button>
          </ErrorStateActions>
        </ErrorState>
      </template>
    </DataTree>
  </div>
</template>
