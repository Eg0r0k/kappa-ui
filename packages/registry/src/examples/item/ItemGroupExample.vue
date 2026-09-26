<script setup lang="ts">
import { Plus } from "@lucide/vue";

import { Button } from "@/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/ui/item";

const people = [
  { name: "Ada Lovelace", email: "ada@example.com" },
  { name: "Grace Hopper", email: "grace@example.com" },
  { name: "Alan Turing", email: "alan@example.com" },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");
</script>

<template>
  <ItemGroup class="w-full max-w-md rounded-xl border">
    <template v-for="(person, index) in people" :key="person.email">
      <ItemSeparator v-if="index > 0" />
      <Item size="sm">
        <ItemMedia>
          <span class="flex size-9 items-center justify-center rounded-full bg-muted text-label-md">
            {{ initials(person.name) }}
          </span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{{ person.name }}</ItemTitle>
          <ItemDescription>{{ person.email }}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" color="neutral" size="icon-sm" :aria-label="`Invite ${person.name}`">
            <Plus />
          </Button>
        </ItemActions>
      </Item>
    </template>
  </ItemGroup>
</template>
