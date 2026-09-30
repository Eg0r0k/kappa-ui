<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/ui/avatar";
import { Card, CardContent } from "@/ui/card";

const commons = "https://upload.wikimedia.org/wikipedia/commons/thumb";
const people = [
  {
    name: "Ada Lovelace",
    initials: "AL",
    src: `${commons}/a/a4/Ada_Lovelace_portrait.jpg/120px-Ada_Lovelace_portrait.jpg`,
  },
  { name: "Marie Curie", initials: "MC", src: `${commons}/7/7e/Marie_Curie_c1920.jpg/120px-Marie_Curie_c1920.jpg` },
  { name: "Grace Hopper", initials: "GH", src: `${commons}/5/55/Grace_Hopper.jpg/120px-Grace_Hopper.jpg` },
  {
    name: "Albert Einstein",
    initials: "AE",
    src: `${commons}/d/d3/Albert_Einstein_Head.jpg/120px-Albert_Einstein_Head.jpg`,
  },
];
</script>

<template>
  <div class="flex flex-col items-start gap-6">
    <AvatarGroup>
      <Avatar v-for="person in people" :key="person.name" size="sm">
        <AvatarImage :src="person.src" :alt="person.name" />
        <AvatarFallback>{{ person.initials }}</AvatarFallback>
      </Avatar>
      <AvatarGroupCount size="sm">+3</AvatarGroupCount>
    </AvatarGroup>
    <Card size="sm">
      <CardContent>
        <AvatarGroup class="[--avatar-ring:--theme(--color-card)]">
          <Avatar v-for="person in people" :key="person.name" size="sm">
            <AvatarImage :src="person.src" :alt="person.name" />
            <AvatarFallback>{{ person.initials }}</AvatarFallback>
          </Avatar>
          <AvatarGroupCount size="sm">+3</AvatarGroupCount>
        </AvatarGroup>
      </CardContent>
    </Card>
  </div>
</template>
