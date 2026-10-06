<script setup lang="ts">
import { BarChart3, Inbox, LayoutDashboard, Settings } from "@lucide/vue";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/navigation-menu";

const reports = [
  { title: "Revenue", description: "Monthly recurring and one-off." },
  { title: "Retention", description: "Who stayed, who left, and when." },
  { title: "Funnels", description: "Where sign-ups drop off." },
];
</script>

<template>
  <div class="flex h-72 w-full max-w-md">
    <NavigationMenu orientation="vertical" align="start" class="w-48" aria-label="Sidebar">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" active><LayoutDashboard /> Overview</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#"><Inbox /> Inbox</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="reports">
          <NavigationMenuTrigger><BarChart3 /> Reports</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul class="grid w-60 gap-1">
              <li v-for="report in reports" :key="report.title">
                <NavigationMenuLink href="#">
                  <span>{{ report.title }}</span>
                  <span class="text-body-sm text-muted-foreground">{{ report.description }}</span>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="settings">
          <NavigationMenuTrigger><Settings /> Settings</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul class="grid w-44 gap-1">
              <li><NavigationMenuLink href="#">Profile</NavigationMenuLink></li>
              <li><NavigationMenuLink href="#">Billing</NavigationMenuLink></li>
              <li><NavigationMenuLink href="#">Notifications</NavigationMenuLink></li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
</template>
