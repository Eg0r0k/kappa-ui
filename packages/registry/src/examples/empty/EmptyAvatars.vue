<script setup lang="ts">
import { UserPlus } from "@lucide/vue";

import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/ui/empty";

const commons = "https://upload.wikimedia.org/wikipedia/commons/thumb";
const people = [
  {
    name: "Ada Lovelace",
    initials: "AL",
    src: `${commons}/a/a4/Ada_Lovelace_portrait.jpg/120px-Ada_Lovelace_portrait.jpg`,
  },
  { name: "Marie Curie", initials: "MC", src: `${commons}/7/7e/Marie_Curie_c1920.jpg/120px-Marie_Curie_c1920.jpg` },
  { name: "Grace Hopper", initials: "GH", src: `${commons}/5/55/Grace_Hopper.jpg/120px-Grace_Hopper.jpg` },
];
</script>

<template>
  <Empty class="w-full max-w-xl">
    <EmptyHeader>
      <EmptyMedia>
        <AvatarGroup>
          <Avatar v-for="person in people" :key="person.name" size="lg">
            <AvatarImage :src="person.src" :alt="person.name" />
            <AvatarFallback>{{ person.initials }}</AvatarFallback>
          </Avatar>
        </AvatarGroup>
      </EmptyMedia>
      <EmptyTitle>No team members</EmptyTitle>
      <EmptyDescription>Invite your team to work on this project together.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button size="sm">
        <UserPlus data-icon="inline-start" />
        Invite members
      </Button>
    </EmptyContent>
  </Empty>
</template>
