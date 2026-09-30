<script setup lang="ts">
import { ChevronRight } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Image, ImageError } from "@/ui/image";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/ui/item";

const base =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Parc_national_de_la_Jacques-Cartier%2C_Quebec%2C_Canada_22.jpg";
const file = "Parc_national_de_la_Jacques-Cartier%2C_Quebec%2C_Canada_22.jpg";

const trails = [
  { name: "Les Loups", description: "11 km, 4 h, steep." },
  { name: "Le Scotora", description: "17 km, 6 h, ridge views." },
  { name: "La Croisée", description: "3 km, 1 h, riverside." },
];
</script>

<template>
  <Card size="sm" class="w-full max-w-sm overflow-hidden pt-0">
    <Image :src="`${base}/500px-${file}`" :width="500" :height="333" alt="A river below a forested mountain">
      <ImageError />
    </Image>
    <CardHeader>
      <CardTitle>Jacques-Cartier</CardTitle>
      <CardDescription>Three trails start at the visitor centre.</CardDescription>
    </CardHeader>
    <CardContent class="px-0">
      <ItemGroup>
        <Item v-for="trail in trails" :key="trail.name" size="sm" as-child class="rounded-none">
          <a href="#">
            <ItemContent>
              <ItemTitle>{{ trail.name }}</ItemTitle>
              <ItemDescription>{{ trail.description }}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRight class="size-4 rtl:rotate-180" />
            </ItemActions>
          </a>
        </Item>
      </ItemGroup>
    </CardContent>
    <CardFooter class="border-t">
      <Button variant="soft" color="neutral" size="sm">All trails</Button>
    </CardFooter>
  </Card>
</template>
