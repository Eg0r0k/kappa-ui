<script setup lang="ts">
import { Button } from "@/ui/button";
import { useToast } from "@/ui/toast";

const toast = useToast();

const request = (succeed: boolean) =>
  new Promise<string>((resolve, reject) =>
    setTimeout(() => (succeed ? resolve("Ada Lovelace") : reject(new Error("The server did not answer."))), 1500),
  );

const save = (succeed: boolean) =>
  toast.promise(request(succeed), {
    loading: { title: "Saving profile…" },
    success: (name) => ({ title: "Profile saved", description: `${name} is up to date.` }),
    error: (reason) => ({ title: "Could not save", description: (reason as Error).message }),
  });
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2">
    <Button variant="outline" color="neutral" @click="save(true)">Save</Button>
    <Button variant="outline" color="neutral" @click="save(false)">Save and fail</Button>
  </div>
</template>
