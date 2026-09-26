<script setup lang="ts">
import { Bell, CreditCard, Ellipsis, LogOut, Settings, User } from '@lucide/vue'
import { ref } from 'vue'

import { provideOverlayPortalTarget } from '@delta-ui/core/overlay'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/ui/field'
import { Input } from '@/ui/input'
import { Kbd } from '@/ui/kbd'
import { Radio, RadioGroup } from '@/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Separator } from '@/ui/separator'
import { Slider } from '@/ui/slider'
import { Spinner } from '@/ui/spinner'
import { Switch } from '@/ui/switch'
import { Textarea } from '@/ui/textarea'

const portalTarget = ref<HTMLElement>()
provideOverlayPortalTarget(portalTarget)

const budget = ref(40)
const plan = ref('pro')

const plans = [
  { value: 'starter', label: 'Starter', description: 'For individuals.' },
  { value: 'pro', label: 'Pro', description: 'For small teams.' },
]
</script>

<template>
  <div data-theme-preview class="rounded-2xl border bg-background p-4 text-foreground sm:p-6">
    <div class="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-3">
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

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what you hear about.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel>Push notifications</FieldLabel>
                <FieldDescription>Mentions and replies.</FieldDescription>
              </FieldContent>
              <Switch :default-value="true" />
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel>Weekly digest</FieldLabel>
                <FieldDescription>A summary every Monday.</FieldDescription>
              </FieldContent>
              <Switch />
            </Field>
            <Separator />
            <Field orientation="horizontal">
              <Checkbox :default-value="true" />
              <FieldLabel>Email me about security</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox />
              <FieldLabel>Product news</FieldLabel>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>Change it at any time.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <RadioGroup v-model="plan" variant="card" orientation="horizontal">
              <Field v-for="option in plans" :key="option.value" orientation="horizontal">
                <Radio :value="option.value" />
                <FieldContent>
                  <FieldLabel>{{ option.label }}</FieldLabel>
                  <FieldDescription>{{ option.description }}</FieldDescription>
                </FieldContent>
              </Field>
            </RadioGroup>
            <Field>
              <FieldLabel>Monthly budget</FieldLabel>
              <Slider v-model="budget" :max="100" />
              <FieldDescription>${{ budget * 10 }} a month.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Billing country</FieldLabel>
              <Select default-value="fi">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fi">Finland</SelectItem>
                  <SelectItem value="jp">Japan</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter class="justify-end gap-2">
          <Button variant="ghost" color="neutral">Cancel</Button>
          <Button>Save</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Every variant in the brand colour and in neutral.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-3">
          <div class="flex flex-wrap gap-2">
            <Button>Solid</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button color="neutral">Solid</Button>
            <Button variant="soft" color="neutral">Soft</Button>
            <Button variant="outline" color="neutral">Outline</Button>
            <Button variant="ghost" color="neutral">Ghost</Button>
            <Button color="destructive">Delete</Button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <Button disabled>
              <Spinner data-icon="inline-start" />
              Saving
            </Button>
            <Button variant="soft" color="success">Approve</Button>
            <Button variant="soft" color="warning">Review</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
          <CardDescription>Tell us what to improve.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Message</FieldLabel>
              <Textarea autoresize placeholder="The search could…" />
            </Field>
            <p class="text-body-sm text-muted-foreground">
              Press <Kbd>⌘</Kbd> <Kbd>Enter</Kbd> to send.
            </p>
          </FieldGroup>
        </CardContent>
        <CardFooter class="justify-between gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" color="neutral" size="icon" aria-label="Account">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-52">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuItem>
                <User />
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog>
            <DialogTrigger as-child>
              <Button>Send</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send feedback?</DialogTitle>
                <DialogDescription>We read every message and reply within two days.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose as-child>
                  <Button variant="outline" color="neutral">Cancel</Button>
                </DialogClose>
                <DialogClose as-child>
                  <Button>Send</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>The typescale in the chosen font.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-2">
          <p class="text-display-sm">Aa Bb Cc</p>
          <p class="text-headline-sm">The quick brown fox</p>
          <p class="text-title-md">jumps over the lazy dog.</p>
          <p class="text-body-md text-muted-foreground">
            Body text reads at 14px with 20px lines. Numbers: 0123456789.
          </p>
          <p class="text-label-md text-primary">A label in the brand colour</p>
        </CardContent>
      </Card>
    </div>
    <div ref="portalTarget" data-slot="preview-portal" class="contents text-foreground" />
  </div>
</template>
