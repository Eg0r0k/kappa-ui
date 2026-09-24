<script setup lang="ts">
import { Bell, Settings, User } from "@lucide/vue";

import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <Tabs default-value="profile">
      <TabsList>
        <TabsTrigger value="profile"><User />Profile</TabsTrigger>
        <TabsTrigger value="alerts"><Bell />Alerts</TabsTrigger>
        <TabsTrigger value="settings"><Settings />Settings</TabsTrigger>
      </TabsList>
    </Tabs>
    <Tabs default-value="profile">
      <TabsList variant="line" size="lg">
        <TabsTrigger value="profile"><User />Profile</TabsTrigger>
        <TabsTrigger value="alerts"><Bell />Alerts</TabsTrigger>
        <TabsTrigger value="settings"><Settings />Settings</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
</template>
