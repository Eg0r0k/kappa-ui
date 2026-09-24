<script setup lang="ts">
import { Button } from "@/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
</script>

<template>
  <Tabs default-value="account" class="w-full max-w-sm">
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
    <TabsContent value="account">
      <FieldGroup>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input default-value="Ada Lovelace" />
        </Field>
        <Field>
          <FieldLabel>Username</FieldLabel>
          <Input default-value="@ada" />
        </Field>
        <Button class="self-start">Save changes</Button>
      </FieldGroup>
    </TabsContent>
    <TabsContent value="password">
      <FieldGroup>
        <Field>
          <FieldLabel>Current password</FieldLabel>
          <Input type="password" />
        </Field>
        <Field>
          <FieldLabel>New password</FieldLabel>
          <Input type="password" />
        </Field>
        <Button class="self-start">Save password</Button>
      </FieldGroup>
    </TabsContent>
  </Tabs>
</template>
