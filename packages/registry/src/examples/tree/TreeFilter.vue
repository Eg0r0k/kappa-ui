<script setup lang="ts">
import { Search } from "@lucide/vue";
import { computed, ref, shallowRef, watch } from "vue";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/ui/input-group";
import { Tree } from "@/ui/tree";

type Country = { id: string; label: string; children?: Country[] };

const world: Country[] = [
  {
    id: "europe",
    label: "Europe",
    children: [
      {
        id: "pt",
        label: "Portugal",
        children: [
          { id: "lis", label: "Lisbon" },
          { id: "opo", label: "Porto" },
        ],
      },
      {
        id: "de",
        label: "Germany",
        children: [
          { id: "ber", label: "Berlin" },
          { id: "muc", label: "Munich" },
        ],
      },
    ],
  },
  {
    id: "asia",
    label: "Asia",
    children: [
      {
        id: "jp",
        label: "Japan",
        children: [
          { id: "tyo", label: "Tokyo" },
          { id: "osa", label: "Osaka" },
        ],
      },
      {
        id: "kr",
        label: "South Korea",
        children: [
          { id: "sel", label: "Seoul" },
          { id: "pus", label: "Busan" },
        ],
      },
    ],
  },
];

const query = ref("");

// Keeps every match, the ancestors that lead to it, and a matching parent's whole subtree.
const filter = (nodes: Country[], text: string): Country[] =>
  nodes.flatMap((node) => {
    if (node.label.toLowerCase().includes(text)) return [node];
    const children = filter(node.children ?? [], text);
    return children.length ? [{ ...node, children }] : [];
  });

const filtered = computed(() => {
  const text = query.value.trim().toLowerCase();
  return text ? filter(world, text) : world;
});

// Open every node the filter kept a path through, so the matches show.
const parents = (nodes: Country[]): string[] =>
  nodes.flatMap((node) => (node.children?.length ? [node.id, ...parents(node.children)] : []));

const expanded = shallowRef<string[]>(["europe"]);
watch(query, (text) => (expanded.value = text.trim() ? parents(filtered.value) : ["europe"]));
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-3">
    <InputGroup>
      <InputGroupInput v-model="query" placeholder="Filter cities" aria-label="Filter cities" />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
    </InputGroup>
    <Tree v-model:expanded="expanded" :items="filtered" variant="outline" aria-label="Cities" />
    <p v-if="filtered.length === 0" class="text-body-sm text-muted-foreground" aria-live="polite">No matches.</p>
  </div>
</template>
