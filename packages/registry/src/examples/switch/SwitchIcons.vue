<script setup lang="ts">
import { Check, Moon, Sun, X } from "@lucide/vue";

import { Field, FieldLabel } from "@/ui/field";
import { Switch } from "@/ui/switch";
</script>

<template>
  <div class="flex flex-col gap-4">
    <Field orientation="horizontal">
      <Switch size="lg" :default-value="true">
        <template #checked-icon>
          <Check stroke-width="3" />
        </template>
      </Switch>
      <FieldLabel>Checked icon only</FieldLabel>
    </Field>
    <Field orientation="horizontal">
      <Switch size="lg">
        <template #checked-icon>
          <Check stroke-width="3" />
        </template>
        <template #unchecked-icon>
          <X stroke-width="3" />
        </template>
      </Switch>
      <FieldLabel>Both icons</FieldLabel>
    </Field>
    <Field orientation="horizontal">
      <Switch size="lg">
        <template #checked-icon>
          <Moon />
        </template>
        <template #unchecked-icon>
          <Sun stroke-width="2.5" />
        </template>
      </Switch>
      <FieldLabel>Dark theme</FieldLabel>
    </Field>
  </div>
</template>
