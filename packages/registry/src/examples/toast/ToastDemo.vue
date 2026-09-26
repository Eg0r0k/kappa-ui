<script setup lang="ts">
import { Button } from "@/ui/button";
import { useToast } from "@/ui/toast";

const toast = useToast();

const show = () =>
  toast.add({
    title: "Event created",
    description: "Sunday, 3 December at 9:00",
    actions: [{ label: "Undo" }],
  });
</script>

<template>
  <Button variant="outline" color="neutral" @click="show">Show toast</Button>
</template>
