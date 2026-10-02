<script setup lang="ts">
import { Button } from "@/ui/button";
import { useConfirm } from "@/ui/confirm";

const { alert } = useConfirm();

const showLimit = () =>
  alert({
    title: "Storage is full",
    description: "Delete some files or upgrade your plan to upload more.",
    action: "Got it",
  });
</script>

<template>
  <Button variant="outline" color="neutral" @click="showLimit">Upload a file</Button>
</template>
