<script setup lang="ts">
import { computed, shallowRef } from "vue";

import { Tree } from "@/ui/tree";

type Permission = { id: string; label: string; children?: Permission[]; disabled?: boolean };

const permissions: Permission[] = [
  {
    id: "billing",
    label: "Billing",
    children: [
      { id: "billing.invoices", label: "View invoices" },
      { id: "billing.refunds", label: "Issue refunds" },
      { id: "billing.payouts", label: "Change payout account", disabled: true },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    children: [
      { id: "projects.read", label: "Read" },
      { id: "projects.write", label: "Write" },
      {
        id: "projects.admin",
        label: "Administer",
        children: [
          { id: "projects.admin.members", label: "Manage members" },
          { id: "projects.admin.delete", label: "Delete projects" },
        ],
      },
    ],
  },
  { id: "audit", label: "Audit log" },
];

const granted = shallowRef<Permission[]>([permissions[1]!.children![0]!]);

// v-model holds every checked node, fully checked parents included. Keep the leaves for a flat list.
const leaves = computed(() => granted.value.filter((permission) => !permission.children));
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-3">
    <Tree
      v-model="granted"
      :items="permissions"
      :default-expanded="['billing', 'projects']"
      multiple
      checkbox
      variant="outline"
      aria-label="Permissions"
    />
    <p class="text-body-sm text-muted-foreground" aria-live="polite">
      {{ leaves.length ? leaves.map((permission) => permission.id).join(", ") : "No permissions" }}
    </p>
  </div>
</template>
