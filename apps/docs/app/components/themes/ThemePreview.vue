<script setup lang="ts">
import { Bell, Bold, ChevronDown, CreditCard, Ellipsis, Italic, LogOut, Search, Settings, Underline, User } from '@lucide/vue'
import { ref } from 'vue'

import { provideOverlayPortalTarget } from '@delta-ui/core/overlay'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/ui/accordion'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { ButtonGroup, ButtonGroupSeparator } from '@/ui/button-group'
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
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/ui/item'
import { Kbd } from '@/ui/kbd'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/ui/pagination'
import { Radio, RadioGroup } from '@/ui/radio-group'
import { ScrollArea } from '@/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Separator } from '@/ui/separator'
import { Skeleton } from '@/ui/skeleton'
import { Slider } from '@/ui/slider'
import { Spinner } from '@/ui/spinner'
import { Switch } from '@/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { Textarea } from '@/ui/textarea'
import { type ToastColor, Toaster, useToast } from '@/ui/toast'

const portalTarget = ref<HTMLElement>()
provideOverlayPortalTarget(portalTarget)

const budget = ref(40)
const plan = ref('pro')

const plans = [
  { value: 'starter', label: 'Starter', description: 'For individuals.' },
  { value: 'pro', label: 'Pro', description: 'For small teams.' },
]

const members = [
  { initials: 'AL', name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner', color: 'primary' },
  { initials: 'GH', name: 'Grace Hopper', email: 'grace@example.com', role: 'Editor', color: 'success' },
  { initials: 'AT', name: 'Alan Turing', email: 'alan@example.com', role: 'Viewer', color: 'neutral' },
] as const

const page = ref(3)
const volume = ref(60)

const statuses = [
  { label: 'Live', color: 'success' },
  { label: 'Review', color: 'warning' },
  { label: 'Failed', color: 'destructive' },
  { label: 'Draft', color: 'neutral' },
] as const

const notifications = [
  'Grace commented on Roadmap',
  'Alan shared Budget.xlsx',
  'Your export is ready',
  'Ada invited you to Design',
  'Build 482 passed',
  'Storage is 92% full',
  'Weekly summary is ready',
  'Alan resolved 3 comments',
]

const toast = useToast()
const group = 'theme-preview'

const notify = (color: ToastColor) =>
  toast.add({
    group,
    color,
    title: color === 'success' ? 'Changes saved' : 'Could not save',
    description: color === 'success' ? 'Everyone sees the new version.' : 'Check your connection and try again.',
  })

const saveLater = () =>
  toast.promise(new Promise<void>((resolve) => setTimeout(resolve, 1500)), {
    loading: { group, title: 'Publishing…' },
    success: () => ({ title: 'Published', description: 'The page is live.' }),
    error: () => ({ title: 'Could not publish' }),
  })
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

      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
          <CardDescription>People with access to this project.</CardDescription>
        </CardHeader>
        <CardContent>
          <ItemGroup class="gap-1">
            <Item v-for="member in members" :key="member.email" size="sm">
              <ItemMedia>
                <span class="flex size-9 items-center justify-center rounded-full bg-muted text-label-md text-muted-foreground">
                  {{ member.initials }}
                </span>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{{ member.name }}</ItemTitle>
                <ItemDescription>{{ member.email }}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge variant="soft" :color="member.color">{{ member.role }}</Badge>
                <Button variant="ghost" color="neutral" size="icon-sm" :aria-label="`Actions for ${member.name}`">
                  <Ellipsis />
                </Button>
              </ItemActions>
            </Item>
          </ItemGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Toolbar</CardTitle>
          <CardDescription>Search, format and page through.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <InputGroup>
            <InputGroupInput placeholder="Search files" aria-label="Search files" />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <Kbd>⌘K</Kbd>
            </InputGroupAddon>
          </InputGroup>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <ButtonGroup aria-label="Formatting">
              <Button variant="outline" color="neutral" size="icon-sm" aria-label="Bold"><Bold /></Button>
              <Button variant="outline" color="neutral" size="icon-sm" aria-label="Italic"><Italic /></Button>
              <Button variant="outline" color="neutral" size="icon-sm" aria-label="Underline"><Underline /></Button>
            </ButtonGroup>
            <ButtonGroup aria-label="Send">
              <Button size="sm">Send</Button>
              <ButtonGroupSeparator />
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button size="icon-sm" aria-label="More send options"><ChevronDown /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" size="sm">
                  <DropdownMenuItem>Schedule send</DropdownMenuItem>
                  <DropdownMenuItem>Send without notification</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ButtonGroup>
          </div>
          <Pagination v-model:page="page" :total="120" :items-per-page="10" :sibling-count="1" show-edges size="sm">
            <PaginationContent v-slot="{ items }">
              <PaginationItem>
                <PaginationPrevious />
              </PaginationItem>
              <PaginationItem v-for="(item, index) in items" :key="index">
                <PaginationLink v-if="item.type === 'page'" :value="item.value" />
                <PaginationEllipsis v-else />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project</CardTitle>
          <CardDescription>Tabs, questions and a loading state.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs default-value="faq">
            <TabsList variant="line" size="sm">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" class="text-body-md text-muted-foreground">
              A shared space for the Q4 launch: roadmap, budget and the design files, with everyone who works on them.
            </TabsContent>
            <TabsContent value="activity" class="flex flex-col gap-3">
              <div v-for="index in 3" :key="index" class="flex items-center gap-3">
                <Skeleton animation="wave" variant="circle" class="size-8" />
                <div class="flex flex-1 flex-col gap-1">
                  <Skeleton animation="wave" variant="text" class="w-2/3 text-body-sm" />
                  <Skeleton animation="wave" variant="text" class="w-1/3 text-body-sm" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="faq">
              <Accordion type="single" default-value="export">
                <AccordionItem value="export">
                  <AccordionTrigger>Can I export my data?</AccordionTrigger>
                  <AccordionContent>Yes. Any project exports to CSV or JSON from its settings.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="seats">
                  <AccordionTrigger>How are seats counted?</AccordionTrigger>
                  <AccordionContent>Everyone who can edit takes a seat; viewers are free.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="cancel">
                  <AccordionTrigger>Can I cancel at any time?</AccordionTrigger>
                  <AccordionContent>Yes, and your data stays readable for 30 days.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>Badges, sliders, notifications and toasts.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-5">
          <div class="flex flex-wrap gap-1.5">
            <Badge v-for="status in statuses" :key="status.label" variant="soft" :color="status.color">{{ status.label }}</Badge>
            <Badge variant="outline" color="neutral"><Spinner />Syncing</Badge>
          </div>
          <Field>
            <div class="flex items-center justify-between">
              <FieldLabel>Volume</FieldLabel>
              <span class="text-label-lg text-muted-foreground tabular-nums">{{ volume }}%</span>
            </div>
            <Slider v-model="volume" variant="inset" :aria-valuetext="`${volume}%`" />
          </Field>
          <Slider variant="inset" :default-value="[20, 70]" aria-label="Price range" />
          <ScrollArea class="scroll-fade-overlay-y h-36 rounded-lg border">
            <ul class="flex flex-col py-1">
              <li v-for="note in notifications" :key="note" class="flex items-center gap-2 px-3 py-2 text-body-md">
                <Bell class="size-4 text-muted-foreground" />
                {{ note }}
              </li>
            </ul>
          </ScrollArea>
          <div class="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" color="neutral" @click="notify('success')">Success toast</Button>
            <Button size="sm" variant="outline" color="neutral" @click="notify('destructive')">Error toast</Button>
            <Button size="sm" variant="outline" color="neutral" @click="saveLater">Promise toast</Button>
          </div>
        </CardContent>
      </Card>
    </div>
    <div ref="portalTarget" data-slot="preview-portal" class="contents text-foreground" />
    <Toaster :group="group" position="bottom-end" />
  </div>
</template>
