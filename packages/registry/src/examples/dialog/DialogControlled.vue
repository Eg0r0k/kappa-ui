<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
import { Field, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Menu, MenuItem } from "@/ui/menu";

const open = ref(false);
const name = ref("quarterly-report.pdf");
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Button variant="outline" color="neutral">
      File actions
      <Menu>
        <MenuItem @select="open = true">Rename…</MenuItem>
        <MenuItem>Duplicate</MenuItem>
      </Menu>
    </Button>
    <p class="text-body-sm text-muted-foreground">{{ name }}</p>

    <Dialog v-model:open="open" title="Rename file">
      <template #body>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input v-model="name" />
        </Field>
      </template>
      <template #footer="{ close }">
        <Button @click="close">Save</Button>
      </template>
    </Dialog>
  </div>
</template>
