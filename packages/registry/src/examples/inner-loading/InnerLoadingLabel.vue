<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { InnerLoading, InnerLoadingContent, InnerLoadingOverlay } from "@/ui/inner-loading";
import { Spinner } from "@/ui/spinner";

const files = ["quarterly-report.pdf", "team-photo.jpg", "roadmap.key", "budget.xlsx"];
</script>

<template>
  <InnerLoading loading class="w-full max-w-sm">
    <InnerLoadingContent>
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="flex flex-col gap-2 text-body-md">
            <li v-for="file in files" :key="file">{{ file }}</li>
          </ul>
        </CardContent>
      </Card>
    </InnerLoadingContent>
    <InnerLoadingOverlay class="rounded-xl bg-card/70 text-muted-foreground">
      <Spinner class="size-6" />
      Syncing files…
    </InnerLoadingOverlay>
  </InnerLoading>
</template>
