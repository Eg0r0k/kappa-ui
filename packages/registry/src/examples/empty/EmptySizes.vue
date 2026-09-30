<script setup lang="ts">
import { Bell } from "@lucide/vue";

import { Card, CardContent } from "@/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/ui/empty";

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div class="grid w-full gap-4 md:grid-cols-3">
    <Card v-for="size in sizes" :key="size" variant="subtle" size="sm">
      <CardContent class="flex flex-1">
        <Empty :size="size">
          <EmptyHeader>
            <EmptyMedia>
              <Bell />
            </EmptyMedia>
            <EmptyTitle>Size {{ size }}</EmptyTitle>
            <EmptyDescription>Nothing to show yet.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  </div>
</template>
