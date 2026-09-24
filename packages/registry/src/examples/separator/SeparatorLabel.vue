<script setup lang="ts">
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-8">
    <div class="flex flex-col gap-4">
      <Button>Sign in with email</Button>
      <Separator label="or continue with" />
      <div class="grid grid-cols-2 gap-2">
        <Button variant="outline" color="neutral">GitHub</Button>
        <Button variant="outline" color="neutral">Google</Button>
      </div>
    </div>
    <div class="flex h-32 items-center justify-center gap-4 text-body-md">
      <span>Monthly</span>
      <Separator orientation="vertical" label="or" />
      <span>Yearly</span>
    </div>
  </div>
</template>
