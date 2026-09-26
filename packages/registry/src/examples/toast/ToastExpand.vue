<script setup lang="ts">
import { Button } from "@/ui/button";
import { Toaster, useToast } from "@/ui/toast";

const toast = useToast();

let count = 0;

const show = () => {
  count++;
  toast.add({ group: "reminders", title: `Reminder ${count}`, description: "Stand-up starts in 10 minutes." });
};
</script>

<template>
  <Button variant="outline" color="neutral" @click="show">Add reminder</Button>
  <Toaster group="reminders" position="top-end" expand progress :duration="8000" />
</template>
