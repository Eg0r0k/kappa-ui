<script setup lang="ts">
import { Ellipsis } from "@lucide/vue";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { createDataTableColumnHelper, DataTable } from "@/ui/data-table";
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from "@/ui/menu";

type Member = { id: number; name: string; email: string; role: "owner" | "editor" | "viewer" };

const members: Member[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com", role: "owner" },
  { id: 2, name: "Grace Hopper", email: "grace@example.com", role: "editor" },
  { id: 3, name: "Linus Torvalds", email: "linus@example.com", role: "editor" },
  { id: 4, name: "Margaret Hamilton", email: "margaret@example.com", role: "viewer" },
  { id: 5, name: "Katherine Johnson", email: "katherine@example.com", role: "viewer" },
  { id: 6, name: "Marie Curie", email: "marie@example.com", role: "viewer" },
];

const last = ref("");
const act = (action: string, member: Member) => {
  last.value = `${action}: ${member.name}`;
};

const helper = createDataTableColumnHelper<Member>();
const columns = helper.columns([
  helper.accessor("name", { header: "Name" }),
  helper.accessor("email", { header: "Email" }),
  helper.accessor("role", { header: "Role", size: 100 }),
  helper.display({ id: "actions", size: 56, header: "", meta: { align: "end" } }),
]);
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-3">
    <DataTable :data="members" :columns="columns" :get-row-id="(row) => String(row.id)" sortable>
      <template #cell-actions="{ row }">
        <MenuTrigger as-child>
          <Button variant="ghost" color="neutral" size="icon-xs" :aria-label="`Actions for ${row.original.name}`">
            <Ellipsis />
          </Button>
        </MenuTrigger>
        <Menu>
          <MenuItem @select="act('Edit', row.original)">Edit</MenuItem>
          <MenuItem @select="act('Change role', row.original)">Change role</MenuItem>
          <MenuSeparator />
          <MenuItem
            variant="destructive"
            :disabled="row.original.role === 'owner'"
            @select="act('Remove', row.original)"
          >
            Remove
          </MenuItem>
        </Menu>
      </template>
    </DataTable>
    <p class="text-body-sm text-muted-foreground">{{ last || "Open a row's menu." }}</p>
  </div>
</template>
