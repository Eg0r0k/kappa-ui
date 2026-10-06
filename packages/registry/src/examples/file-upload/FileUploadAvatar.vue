<script setup lang="ts">
import { ref, watch } from "vue";

import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { FileUpload } from "@/ui/file-upload";

// what the server has now; the upload only holds a new pick
const saved = ref<string | null>(
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Ada_Lovelace_portrait.jpg/120px-Ada_Lovelace_portrait.jpg",
);
const photo = ref<File | null>(null);
const preview = ref<string>();

watch(
  photo,
  (file, _, onCleanup) => {
    const url = file ? URL.createObjectURL(file) : undefined;
    preview.value = url;
    onCleanup(() => url && URL.revokeObjectURL(url));
  },
  { immediate: true },
);

const remove = (clear: () => void) => {
  if (photo.value) clear();
  else saved.value = null;
};
</script>

<template>
  <Field class="w-full max-w-sm">
    <FieldLabel>Profile photo</FieldLabel>
    <FileUpload v-model="photo" mode="button" accept="image/*" :max-size="2 * 1024 * 1024" :preview="false">
      <template #default="{ open, clear, dragging, triggerAttrs }">
        <div class="flex items-center gap-4">
          <Avatar size="xl" :class="dragging && 'ring-2 ring-primary'">
            <AvatarImage v-if="preview ?? saved" :src="(preview ?? saved)!" alt="" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <div class="flex gap-2">
            <Button v-bind="triggerAttrs" type="button" variant="outline" color="neutral" size="sm" @click="open">
              Change
            </Button>
            <Button
              type="button"
              variant="ghost"
              color="neutral"
              size="sm"
              :disabled="!preview && !saved"
              @click="remove(clear)"
            >
              Remove
            </Button>
          </div>
        </div>
      </template>
    </FileUpload>
    <FieldDescription>Drop an image on the photo, or press Change. Up to 2 MB.</FieldDescription>
  </Field>
</template>
