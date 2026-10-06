<script setup lang="ts">
import { BookOpen, Cog, LayoutDashboard, Users } from "@lucide/vue";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Tree } from "@/ui/tree";

const sections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  {
    id: "guides",
    label: "Guides",
    icon: BookOpen,
    defaultExpanded: true,
    children: [
      { id: "install", label: "Installation" },
      { id: "theming", label: "Theming" },
    ],
  },
  { id: "team", label: "Team", icon: Users },
  { id: "settings", label: "Settings", icon: Cog },
];
</script>

<template>
  <div class="flex flex-wrap items-start gap-6">
    <Card class="w-56" size="sm">
      <CardHeader>
        <CardTitle>Ghost</CardTitle>
      </CardHeader>
      <CardContent>
        <Tree :items="sections" :default-value="sections[0]" aria-label="Sections" />
      </CardContent>
    </Card>
    <Tree
      :items="sections"
      :default-value="sections[0]"
      variant="outline"
      aria-label="Sections, outline"
      class="w-56"
    />
  </div>
</template>
