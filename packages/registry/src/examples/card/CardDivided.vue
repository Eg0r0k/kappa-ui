<script setup lang="ts">
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";

const members = [
  { name: "Ada Lovelace", role: "Owner" },
  { name: "Alan Turing", role: "Editor" },
  { name: "Grace Hopper", role: "Viewer" },
];
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader class="border-b">
      <CardTitle>Team members</CardTitle>
      <CardDescription>Three people can open this project.</CardDescription>
    </CardHeader>
    <CardContent>
      <ul class="grid gap-3">
        <li v-for="member in members" :key="member.name" class="flex items-center justify-between">
          <span class="text-body-md">{{ member.name }}</span>
          <span class="text-label-md text-muted-foreground">{{ member.role }}</span>
        </li>
      </ul>
    </CardContent>
    <CardFooter class="justify-end border-t">
      <Button variant="soft" color="neutral" size="sm">Invite</Button>
    </CardFooter>
  </Card>
</template>
