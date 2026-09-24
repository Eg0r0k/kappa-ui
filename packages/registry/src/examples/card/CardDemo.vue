<script setup lang="ts">
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle>Upgrade to Pro</CardTitle>
      <CardDescription>Unlimited projects and priority support for your whole team.</CardDescription>
    </CardHeader>
    <CardContent>
      <p class="text-display-sm">$12</p>
      <p class="text-body-sm text-muted-foreground">per member, per month</p>
    </CardContent>
    <CardFooter>
      <Button class="flex-1">Upgrade</Button>
      <Button variant="ghost" color="neutral">Later</Button>
    </CardFooter>
  </Card>
</template>
