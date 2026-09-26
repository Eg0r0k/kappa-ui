<script setup lang="ts">
import { Button } from "@/ui/button";
import { Toaster, useToast } from "@/ui/toast";

const toast = useToast();

const upload = () => {
  const id = toast.add({ group: "uploads", title: "Uploading photos…", loading: true });
  setTimeout(() => toast.update(id, { title: "12 photos uploaded", color: "success", loading: false }), 2000);
};
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2">
    <Button variant="outline" color="neutral" @click="toast.add({ title: 'Settings saved' })">Save settings</Button>
    <Button variant="outline" color="neutral" @click="upload">Upload photos</Button>
  </div>
  <Toaster group="uploads" position="top-center" />
</template>
