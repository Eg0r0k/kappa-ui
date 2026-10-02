<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { useConfirm } from "@/ui/confirm";
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from "@/ui/item";

const { confirm } = useConfirm();
const projects = ref(["Aurora", "Borealis"]);

const remove = async (project: string) => {
  const result = await confirm({
    title: `Delete ${project}?`,
    description: "Its deployments and domains go with it.",
    action: "Delete",
    color: "destructive",
    onConfirm: () => new Promise((resolve) => setTimeout(resolve, 1500)),
  });
  if (result.ok) projects.value = projects.value.filter((name) => name !== project);
};
</script>

<template>
  <ItemGroup v-if="projects.length" class="w-72">
    <Item v-for="project in projects" :key="project" variant="outline" size="xs">
      <ItemContent>
        <ItemTitle>{{ project }}</ItemTitle>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" color="destructive" size="sm" @click="remove(project)">Delete</Button>
      </ItemActions>
    </Item>
  </ItemGroup>
  <p v-else class="text-body-md text-muted-foreground">No projects left.</p>
</template>
