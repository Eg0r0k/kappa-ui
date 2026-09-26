<script setup lang="ts">
import { Button } from "@/ui/button";
import { useToast } from "@/ui/toast";

const toast = useToast();

const upload = () => {
  const id = toast.add({ title: "Uploading report.pdf…", loading: true });
  setTimeout(() => toast.update(id, { title: "Uploaded report.pdf", color: "success", loading: false }), 2000);
};
</script>

<template>
  <Button variant="outline" color="neutral" @click="upload">Upload</Button>
</template>
