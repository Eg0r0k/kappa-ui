<script setup lang="ts">
import { Button } from "@/ui/button";
import { Menu, MenuItem } from "@/ui/menu";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
</script>

<template>
  <div class="flex flex-wrap items-start justify-center gap-3">
    <Button variant="outline" color="neutral" class="w-56">
      Fit to the button
      <Menu fit>
        <MenuItem>Short</MenuItem>
        <MenuItem>Items</MenuItem>
      </Menu>
    </Button>
    <Button variant="outline" color="neutral">
      Max height
      <Menu max-height="12rem">
        <MenuItem v-for="month in months" :key="month">{{ month }}</MenuItem>
      </Menu>
    </Button>
    <Button variant="outline" color="neutral">
      Cover
      <Menu cover>
        <MenuItem>Covers</MenuItem>
        <MenuItem>its target</MenuItem>
      </Menu>
    </Button>
  </div>
</template>
