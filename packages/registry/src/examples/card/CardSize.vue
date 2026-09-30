<script setup lang="ts">
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";

const sizes = [
  { card: "xs", button: "xs" },
  { card: "sm", button: "sm" },
  { card: "md", button: "default" },
  { card: "lg", button: "lg" },
  { card: "xl", button: "xl" },
] as const;
</script>

<template>
  <div class="grid w-full max-w-3xl items-start gap-4 sm:grid-cols-2">
    <Card v-for="size in sizes" :key="size.card" :size="size.card">
      <CardHeader>
        <CardTitle>Storage almost full</CardTitle>
        <CardDescription>18.6 GB of 20 GB used.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="h-2 overflow-hidden rounded-full bg-muted">
          <div class="h-full w-[93%] rounded-full bg-warning" />
        </div>
      </CardContent>
      <CardFooter>
        <Button :size="size.button">Upgrade</Button>
      </CardFooter>
    </Card>
  </div>
</template>
