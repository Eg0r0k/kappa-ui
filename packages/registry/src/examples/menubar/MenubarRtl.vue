<script setup lang="ts">
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/ui/menubar";
</script>

<template>
  <div dir="rtl">
    <Menubar dir="rtl" aria-label="التطبيق">
      <MenubarMenu>
        <MenubarTrigger>ملف</MenubarTrigger>
        <MenubarContent class="w-52">
          <MenubarItem>
            جديد
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            فتح…
            <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>مشاركة</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>البريد الإلكتروني</MenubarItem>
              <MenubarItem>الرسائل</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>تحرير</MenubarTrigger>
        <MenubarContent class="w-52">
          <MenubarItem>
            تراجع
            <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            إعادة
            <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>عرض</MenubarTrigger>
        <MenubarContent class="w-52">
          <MenubarItem>تكبير</MenubarItem>
          <MenubarItem>تصغير</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  </div>
</template>
