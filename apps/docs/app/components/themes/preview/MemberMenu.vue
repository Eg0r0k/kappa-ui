<script setup lang="ts">
import { Mail, Trash2, UserCog } from '@lucide/vue'

import {
  Menu,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from '@/ui/menu'

const props = defineProps<{ name: string; roles: readonly string[]; contextMenu?: boolean }>()
const role = defineModel<string>('role', { required: true })
const emit = defineEmits<{ message: []; remove: [] }>()
</script>

<template>
  <Menu :context-menu="props.contextMenu" class="w-56">
    <MenuLabel>{{ props.name }}</MenuLabel>
    <MenuSub>
      <MenuSubTrigger>
        <UserCog />
        Change role
      </MenuSubTrigger>
      <MenuSubContent class="w-40">
        <MenuRadioGroup v-model="role">
          <MenuRadioItem v-for="option in props.roles" :key="option" :value="option">{{ option }}</MenuRadioItem>
        </MenuRadioGroup>
      </MenuSubContent>
    </MenuSub>
    <MenuItem @select="emit('message')">
      <Mail />
      Send message
    </MenuItem>
    <MenuSeparator />
    <MenuItem variant="destructive" @select="emit('remove')">
      <Trash2 />
      Remove from team
    </MenuItem>
  </Menu>
</template>
