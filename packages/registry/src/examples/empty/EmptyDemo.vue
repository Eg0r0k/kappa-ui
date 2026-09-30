<script setup lang="ts">
import { ArrowUpRight, FolderOpen } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/ui/empty";
</script>

<template>
  <Empty class="w-full max-w-xl">
    <EmptyHeader>
      <EmptyMedia>
        <FolderOpen />
      </EmptyMedia>
      <EmptyTitle>No projects yet</EmptyTitle>
      <EmptyDescription>Create a project to start tracking work, or import one from another tool.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <div class="flex flex-wrap justify-center gap-2">
        <Button>Create project</Button>
        <Button variant="outline" color="neutral">Import</Button>
      </div>
    </EmptyContent>
    <Button variant="link" color="neutral" size="sm" as-child>
      <a href="#">Learn more <ArrowUpRight data-icon="inline-end" /></a>
    </Button>
  </Empty>
</template>
