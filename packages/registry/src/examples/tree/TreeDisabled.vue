<script setup lang="ts">
import { Tree } from "@/ui/tree";

const plans = [
  {
    id: "free",
    label: "Free",
    children: [
      { id: "free.projects", label: "3 projects" },
      { id: "free.sso", label: "Single sign-on", disabled: true },
    ],
  },
  { id: "team", label: "Team" },
  { id: "enterprise", label: "Enterprise (contact sales)", disabled: true },
];
</script>

<template>
  <div class="flex flex-wrap items-start gap-6">
    <Tree :items="plans" :default-expanded="['free']" variant="outline" aria-label="Plans" class="w-60" />
    <Tree
      :items="plans"
      :default-expanded="['free']"
      variant="outline"
      disabled
      aria-label="Plans, locked"
      class="w-60"
    />
  </div>
</template>
