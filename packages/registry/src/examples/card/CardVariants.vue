<script setup lang="ts">
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";

const variants = ["outline", "solid", "soft", "subtle"] as const;
</script>

<template>
  <div class="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
    <Card v-for="variant in variants" :key="variant" :variant="variant" size="sm">
      <CardHeader>
        <CardTitle class="capitalize">{{ variant }}</CardTitle>
        <CardDescription>The same parts on a different surface.</CardDescription>
      </CardHeader>
      <CardContent>
        <p class="text-body-sm text-muted-foreground">Content sits between the header and the footer.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="soft" color="neutral">Open</Button>
      </CardFooter>
    </Card>
  </div>
</template>
