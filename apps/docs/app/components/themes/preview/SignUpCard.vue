<script setup lang="ts">
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/ui/field'
import { Input } from '@/ui/input'
import { Separator } from '@/ui/separator'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Create an account</CardTitle>
      <CardDescription>Enter your email to get started.</CardDescription>
    </CardHeader>
    <CardContent>
      <FieldGroup>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input type="email" placeholder="ada@example.com" />
        </Field>
        <Field>
          <FieldLabel>Password</FieldLabel>
          <Input type="password" default-value="analytical" />
          <FieldDescription>At least 8 characters.</FieldDescription>
        </Field>
        <Button>Create account</Button>
        <Separator label="or continue with" />
        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" color="neutral">GitHub</Button>
          <Button variant="outline" color="neutral">Google</Button>
        </div>
      </FieldGroup>
    </CardContent>
  </Card>
</template>
