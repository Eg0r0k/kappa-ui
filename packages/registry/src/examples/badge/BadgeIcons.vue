<script setup lang="ts">
import { ArrowRight, Check } from "@lucide/vue";

import { Badge } from "@/ui/badge";
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Badge variant="soft" color="neutral">Label only</Badge>
    <Badge variant="soft" color="success">
      <Check data-icon="inline-start" />
      Verified
    </Badge>
    <Badge variant="soft" color="neutral">
      Next
      <ArrowRight data-icon="inline-end" class="rtl:rotate-180" />
    </Badge>
  </div>
</template>
