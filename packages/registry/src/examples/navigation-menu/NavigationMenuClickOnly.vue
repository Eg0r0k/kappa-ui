<script setup lang="ts">
import { FileText, FolderOpen, Settings, Users } from "@lucide/vue";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/navigation-menu";
</script>

<template>
  <NavigationMenu disable-hover-trigger disable-pointer-leave-close size="sm" aria-label="Workspace">
    <NavigationMenuList>
      <NavigationMenuItem value="workspace">
        <NavigationMenuTrigger><FolderOpen /> Workspace</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid w-52 gap-1">
            <li>
              <NavigationMenuLink href="#"> <FileText /> Documents </NavigationMenuLink>
            </li>
            <li>
              <NavigationMenuLink href="#"> <Users /> Members </NavigationMenuLink>
            </li>
            <li>
              <NavigationMenuLink href="#"> <Settings /> Settings </NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem value="help">
        <NavigationMenuTrigger>Help</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid w-44 gap-1">
            <li><NavigationMenuLink href="#">Shortcuts</NavigationMenuLink></li>
            <li><NavigationMenuLink href="#">Contact support</NavigationMenuLink></li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>
