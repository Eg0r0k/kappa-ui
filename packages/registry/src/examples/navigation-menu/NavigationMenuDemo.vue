<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/navigation-menu";

const guides = [
  { title: "Introduction", href: "#", description: "What kappa-ui is, and what it isn't." },
  { title: "Installation", href: "#", description: "Add the tokens and your first component." },
  { title: "Theming", href: "#", description: "Colours, radius and type, from one stylesheet." },
];

const components = [
  { title: "Button", href: "#", description: "Five variants, five sizes and a colour for each mood." },
  { title: "Dialog", href: "#", description: "A modal window that keeps focus where it belongs." },
  { title: "Menu", href: "#", description: "Opens on click or right-click, wherever you put it." },
  { title: "Select", href: "#", description: "Pick one option from a list that fits the trigger." },
  { title: "Tabs", href: "#", description: "Panels switched by a row of tabs." },
  { title: "Toast", href: "#", description: "Short messages that stack and get out of the way." },
];
</script>

<template>
  <NavigationMenu aria-label="Main">
    <NavigationMenuList>
      <NavigationMenuItem value="getting-started">
        <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid w-96 grid-cols-[10rem_1fr] gap-1">
            <li class="row-span-3">
              <NavigationMenuLink href="#" class="h-full justify-end rounded-lg bg-muted p-4">
                <span class="text-title-md">kappa-ui</span>
                <span class="text-body-sm text-muted-foreground">Components you copy, built on Reka UI.</span>
              </NavigationMenuLink>
            </li>
            <li v-for="guide in guides" :key="guide.title">
              <NavigationMenuLink :href="guide.href">
                <span>{{ guide.title }}</span>
                <span class="line-clamp-2 text-body-sm text-muted-foreground">{{ guide.description }}</span>
              </NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem value="components">
        <NavigationMenuTrigger>Components</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid w-[30rem] grid-cols-2 gap-1">
            <li v-for="component in components" :key="component.title">
              <NavigationMenuLink :href="component.href">
                <span>{{ component.title }}</span>
                <span class="line-clamp-2 text-body-sm text-muted-foreground">{{ component.description }}</span>
              </NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink href="#">Docs</NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>
