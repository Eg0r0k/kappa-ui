<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/navigation-menu";

const open = ref("");
const email = ref("");
const subscribed = ref(false);

const subscribe = () => {
  subscribed.value = true;
  open.value = "";
};
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <NavigationMenu v-model="open" aria-label="Newsroom">
      <NavigationMenuList>
        <NavigationMenuItem value="stories">
          <NavigationMenuTrigger>Stories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul class="grid w-52 gap-1">
              <li><NavigationMenuLink href="#">Product updates</NavigationMenuLink></li>
              <li><NavigationMenuLink href="#">Engineering</NavigationMenuLink></li>
              <li><NavigationMenuLink href="#">Customer stories</NavigationMenuLink></li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="newsletter">
          <NavigationMenuTrigger>Newsletter</NavigationMenuTrigger>
          <NavigationMenuContent>
            <form class="flex w-72 flex-col gap-3 p-2" @submit.prevent="subscribe">
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input v-model="email" name="email" type="email" required placeholder="ada@example.com" />
              </Field>
              <Button type="submit" class="self-end">Subscribe</Button>
            </form>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
    <div class="flex items-center gap-3 text-body-sm text-muted-foreground">
      <span>Open: {{ open || "none" }}</span>
      <Button size="sm" variant="outline" color="neutral" @click="open = 'newsletter'">Open newsletter</Button>
      <Button size="sm" variant="ghost" color="neutral" :disabled="!open" @click="open = ''">Close</Button>
    </div>
    <p v-if="subscribed" class="text-body-sm">Subscribed {{ email }}.</p>
  </div>
</template>
