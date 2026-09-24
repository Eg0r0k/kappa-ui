<script setup lang="ts">
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
</script>

<template>
  <div class="grid w-full max-w-xs gap-2">
    <Label for="label-demo-email">Email</Label>
    <Input id="label-demo-email" type="email" placeholder="ada@example.com" />
  </div>
</template>
