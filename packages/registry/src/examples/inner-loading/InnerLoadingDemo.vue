<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Field, FieldLabel } from "@/ui/field";
import { InnerLoading, InnerLoadingContent, InnerLoadingOverlay } from "@/ui/inner-loading";
import { Input } from "@/ui/input";

const saving = ref(false);

const save = () => {
  saving.value = true;
  setTimeout(() => {
    saving.value = false;
  }, 2000);
};
</script>

<template>
  <InnerLoading :loading="saving" class="w-full max-w-sm">
    <InnerLoadingContent>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Shown on your public page.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input model-value="Ada Lovelace" autocomplete="name" />
          </Field>
          <Field>
            <FieldLabel>Username</FieldLabel>
            <Input model-value="ada" autocomplete="username" />
          </Field>
        </CardContent>
        <CardFooter>
          <Button @click="save">Save</Button>
        </CardFooter>
      </Card>
    </InnerLoadingContent>
    <InnerLoadingOverlay class="rounded-xl bg-card/70" />
  </InnerLoading>
</template>
