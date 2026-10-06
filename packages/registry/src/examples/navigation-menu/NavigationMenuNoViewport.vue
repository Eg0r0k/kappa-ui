<script setup lang="ts">
import { Search } from "@lucide/vue";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
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
const query = ref("");
const searched = ref("");

const search = () => {
  searched.value = query.value.trim();
  open.value = "";
};
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <NavigationMenu v-model="open" :viewport="false" aria-label="Help centre">
      <NavigationMenuList>
        <NavigationMenuItem value="guides">
          <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul class="grid w-48 gap-1">
              <li><NavigationMenuLink href="#">Getting started</NavigationMenuLink></li>
              <li><NavigationMenuLink href="#">Billing</NavigationMenuLink></li>
              <li><NavigationMenuLink href="#">Security</NavigationMenuLink></li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="search">
          <NavigationMenuTrigger>Search</NavigationMenuTrigger>
          <NavigationMenuContent>
            <form class="flex w-72 flex-col gap-3 p-2" @submit.prevent="search">
              <Field>
                <FieldLabel>Search the help centre</FieldLabel>
                <Input v-model="query" name="q" type="search" placeholder="Two-factor login" />
                <FieldDescription>Spaces and arrow keys work as usual in here.</FieldDescription>
              </Field>
              <Button type="submit" class="self-end"><Search data-icon="inline-start" /> Search</Button>
            </form>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
    <p class="text-body-sm text-muted-foreground">
      {{ searched ? `Results for “${searched}”` : "Nothing searched yet" }}
    </p>
  </div>
</template>
