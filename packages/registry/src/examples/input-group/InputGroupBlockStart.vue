<script setup lang="ts">
import { Copy, FileCode } from "@lucide/vue";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "@/ui/input-group";

const code = `const greet = (name: string) => \`Hello, \${name}!\`;\n\nconsole.log(greet("delta-ui"));`;
</script>

<template>
  <InputGroup variant="subtle" class="max-w-md">
    <InputGroupAddon align="block-start" class="border-b border-input">
      <InputGroupText>
        <FileCode />
        greet.ts
      </InputGroupText>
      <InputGroupButton size="icon-xs" class="ms-auto" aria-label="Copy code">
        <Copy />
      </InputGroupButton>
    </InputGroupAddon>
    <InputGroupTextarea :default-value="code" :rows="4" spellcheck="false" class="font-mono" aria-label="Code" />
  </InputGroup>
</template>
