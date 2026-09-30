<script setup lang="ts">
import { Inbox, RefreshCw } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/ui/empty";
</script>

<template>
  <Card class="w-full max-w-md">
    <CardContent>
      <Empty size="sm">
        <EmptyHeader>
          <EmptyMedia>
            <Inbox />
          </EmptyMedia>
          <EmptyTitle>Inbox zero</EmptyTitle>
          <EmptyDescription>New messages will show up here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" color="neutral" size="sm">
            <RefreshCw data-icon="inline-start" />
            Refresh
          </Button>
        </EmptyContent>
      </Empty>
    </CardContent>
  </Card>
</template>
