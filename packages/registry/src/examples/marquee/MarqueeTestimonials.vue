<script setup lang="ts">
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { Card, CardContent, CardFooter } from "@/ui/card";
import { Marquee } from "@/ui/marquee";

const testimonials = [
  {
    name: "Ada Byron",
    role: "Engineering lead",
    quote: "The parts compose the way our designers draw them. No prop archaeology.",
  },
  {
    name: "Grace Murray",
    role: "Frontend developer",
    quote: "One size scale for every control. Our forms finally line up.",
  },
  {
    name: "Linus Benedict",
    role: "Founder",
    quote: "Copied the source in, changed three classes, shipped. That is the whole story.",
  },
  {
    name: "Margaret Hamilton",
    role: "Design systems",
    quote: "Colour is one axis and it works everywhere. We deleted a theme file.",
  },
  {
    name: "Tim Berners",
    role: "CTO",
    quote: "Swipe views and drawers feel native on a phone. Nothing else we tried did.",
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <Marquee pause-on-hover class="w-full [--marquee-gap:--spacing(4)]">
      <Card
        v-for="testimonial in testimonials"
        :key="testimonial.name"
        variant="subtle"
        size="sm"
        class="w-64 shrink-0"
      >
        <CardContent class="text-body-sm">“{{ testimonial.quote }}”</CardContent>
        <CardFooter class="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>{{ initials(testimonial.name) }}</AvatarFallback>
          </Avatar>
          <div class="flex min-w-0 flex-col">
            <span class="truncate text-label-md">{{ testimonial.name }}</span>
            <span class="truncate text-body-sm text-muted-foreground">{{ testimonial.role }}</span>
          </div>
        </CardFooter>
      </Card>
    </Marquee>
    <Marquee pause-on-hover reverse class="w-full [--marquee-gap:--spacing(4)]">
      <Card
        v-for="testimonial in testimonials"
        :key="testimonial.name"
        variant="subtle"
        size="sm"
        class="w-64 shrink-0"
      >
        <CardContent class="text-body-sm">“{{ testimonial.quote }}”</CardContent>
        <CardFooter class="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>{{ initials(testimonial.name) }}</AvatarFallback>
          </Avatar>
          <div class="flex min-w-0 flex-col">
            <span class="truncate text-label-md">{{ testimonial.name }}</span>
            <span class="truncate text-body-sm text-muted-foreground">{{ testimonial.role }}</span>
          </div>
        </CardFooter>
      </Card>
    </Marquee>
  </div>
</template>
