import {
  type App,
  type Component,
  type ComputedRef,
  type InjectionKey,
  type Ref,
  computed,
  hasInjectionContext,
  inject,
  shallowReactive,
  shallowRef,
} from "vue";

export type DismissReason =
  "escape" | "outside" | "close-button" | "programmatic" | "close-all" | "unmount" | "no-host" | "error";

export type DialogResult<T> = { ok: true; value: T } | { ok: false; reason: DismissReason };

type Props = Record<string, unknown>;

export type DialogProps<C> = C extends new (...args: never[]) => { $props: infer P }
  ? P
  : C extends (props: infer P, ...args: never[]) => unknown
    ? P
    : Props;

type PropsArgs<P> = Partial<P> extends P ? [props?: P] : [props: P];

export interface DialogHandle<T = void, P = Props> extends Promise<DialogResult<T>> {
  readonly isOpen: Readonly<Ref<boolean>>;
  close: (value: T) => void;
  dismiss: () => void;
  patch: (props: Partial<P>) => void;
}

export interface DialogOptions<C> {
  props?: Partial<DialogProps<C>>;
  keepMounted?: boolean;
}

export interface DialogDefinition<C> {
  open: <T = void>(props?: Partial<DialogProps<C>>) => DialogHandle<T, DialogProps<C>>;
  dismiss: () => void;
  readonly isOpen: Readonly<Ref<boolean>>;
}

export interface DialogEntry {
  readonly id: symbol;
  readonly definition?: symbol;
  readonly component: Component;
  readonly defaults: Props;
  readonly keepMounted: boolean;
  props: Props;
  isOpen: boolean;
  loading: boolean;
  contents: number;
  reason?: "escape" | "outside";
  settle?: (result: DialogResult<unknown>) => void;
  handle?: DialogHandle<unknown>;
}

export type DialogRecord = Readonly<Pick<DialogEntry, "component" | "props" | "isOpen" | "loading">>;

export interface DialogManager {
  stack: ComputedRef<readonly DialogRecord[]>;
  install: (app: App) => void;
}

interface OpenOptions {
  definition?: symbol;
  defaults?: Props;
  keepMounted?: boolean;
}

export interface DialogStore extends DialogManager {
  entries: readonly DialogEntry[];
  open: (component: Component, props: Props, options?: OpenOptions) => DialogHandle<unknown>;
  close: (entry: DialogEntry, value: unknown) => void;
  dismiss: (entry: DialogEntry, reason: DismissReason) => void;
  requestClose: (entry: DialogEntry) => void;
  afterLeave: (entry: DialogEntry) => void;
  mountContent: (entry: DialogEntry) => void;
  unmountContent: (entry: DialogEntry) => void;
  fail: (entry: DialogEntry) => void;
  closeAll: () => void;
  register: (host: symbol) => void;
  unregister: (host: symbol) => void;
  renders: (host: symbol) => boolean;
}

const key: InjectionKey<DialogStore> = Symbol("DialogManager");
let active: DialogStore | undefined;

const noop = () => {};

const settled = (reason: DismissReason): DialogHandle<unknown> =>
  Object.assign(Promise.resolve<DialogResult<unknown>>({ ok: false, reason }), {
    isOpen: computed(() => false),
    close: noop,
    dismiss: noop,
    patch: noop,
  });

const toProps = (props: unknown) => (props ?? {}) as Props;

export const createDialogs = (): DialogManager => {
  const entries = shallowReactive<DialogEntry[]>([]);
  const hosts = shallowReactive<symbol[]>([]);
  let closingAll = false;

  const remove = (entry: DialogEntry) => {
    const index = entries.indexOf(entry);
    if (index !== -1) entries.splice(index, 1);
  };

  const settle = (entry: DialogEntry, result: DialogResult<unknown>) => {
    const resolve = entry.settle;
    if (!resolve) return false;
    entry.settle = undefined;
    resolve(result);
    return true;
  };

  const finish = (entry: DialogEntry, result: DialogResult<unknown>) => {
    if (!settle(entry, result)) return;
    entry.isOpen = false;
    entry.loading = false;
    entry.reason = undefined;
    if (!entry.contents && !entry.keepMounted) remove(entry);
  };

  const store: DialogStore = {
    stack: computed(() => [...entries]),
    entries,
    install: (app) => {
      app.provide(key, store);
      active = store;
      app.onUnmount(() => {
        if (active === store) active = undefined;
      });
    },
    open: (component, props, { definition, defaults = {}, keepMounted = false } = {}) => {
      const existing = definition ? entries.find((entry) => entry.definition === definition) : undefined;
      if (existing?.isOpen && existing.handle) return existing.handle;
      if (!hosts.length) {
        console.warn("openDialog() found no mounted DialogHost: put one <DialogHost /> in the root component.");
        return settled("no-host");
      }
      const entry =
        existing ??
        shallowReactive<DialogEntry>({
          id: Symbol("dialog"),
          definition,
          component,
          defaults,
          keepMounted,
          props: {},
          isOpen: false,
          loading: false,
          contents: 0,
        });
      const owns = () => entry.handle === handle;
      const handle: DialogHandle<unknown> = Object.assign(
        new Promise<DialogResult<unknown>>((resolve) => {
          entry.settle = resolve;
        }),
        {
          isOpen: computed(() => owns() && entry.isOpen),
          close: (value: unknown) => {
            if (owns()) finish(entry, { ok: true, value });
          },
          dismiss: () => {
            if (owns()) finish(entry, { ok: false, reason: "programmatic" });
          },
          patch: (next: Partial<Props>) => {
            if (owns() && entry.isOpen) Object.assign(entry.props, next);
            else console.warn("patch() does nothing on a closed dialog.");
          },
        },
      );
      entry.props = shallowReactive({ ...entry.defaults, ...props });
      entry.handle = handle;
      entry.isOpen = true;
      if (!existing) entries.push(entry);
      return handle;
    },
    close: (entry, value) => finish(entry, { ok: true, value }),
    dismiss: (entry, reason) => finish(entry, { ok: false, reason }),
    requestClose: (entry) => {
      if (!entry.loading) finish(entry, { ok: false, reason: entry.reason ?? "close-button" });
    },
    afterLeave: (entry) => {
      if (!entry.isOpen && !entry.keepMounted) remove(entry);
    },
    mountContent: (entry) => {
      entry.contents += 1;
    },
    unmountContent: (entry) => {
      entry.contents -= 1;
      if (!entry.isOpen && !entry.keepMounted) remove(entry);
    },
    fail: (entry) => {
      if (entry.contents) return;
      settle(entry, { ok: false, reason: "error" });
      entry.isOpen = false;
      remove(entry);
    },
    closeAll: () => {
      if (closingAll) return;
      closingAll = true;
      try {
        entries.filter((entry) => entry.isOpen).forEach((entry) => finish(entry, { ok: false, reason: "close-all" }));
      } finally {
        closingAll = false;
      }
    },
    register: (host) => {
      hosts.push(host);
      if (hosts.length > 1) console.warn("A second DialogHost renders nothing: dialogs show in the first one mounted.");
    },
    unregister: (host) => {
      const rendering = hosts[0] === host;
      hosts.splice(hosts.indexOf(host), 1);
      if (!rendering) return;
      entries.forEach((entry) => {
        settle(entry, { ok: false, reason: "unmount" });
        entry.isOpen = false;
      });
      entries.splice(0);
    },
    renders: (host) => hosts[0] === host,
  };
  return store;
};

const current = () => (hasInjectionContext() ? inject(key, null) : null) ?? active;

const openIn = <T, P>(store: DialogStore | undefined, component: Component, props: Props, options?: OpenOptions) => {
  if (store) return store.open(component, props, options) as unknown as DialogHandle<T, P>;
  console.warn("openDialog() found no dialog manager: install one with app.use(createDialogs()).");
  return settled("no-host") as unknown as DialogHandle<T, P>;
};

export const useDialogStore = () => {
  const store = inject(key, null);
  if (!store) throw new Error("DialogHost found no dialog manager: install one with app.use(createDialogs()).");
  return store;
};

export const openDialog = <T = void, C extends Component = Component>(
  component: C,
  ...[props]: PropsArgs<DialogProps<C>>
): DialogHandle<T, DialogProps<C>> => openIn(current(), component, toProps(props));

export const defineDialog = <C extends Component>(
  component: C,
  options: DialogOptions<C> = {},
): DialogDefinition<C> => {
  const definition = Symbol("definition");
  const owner = shallowRef<DialogStore>();
  const entry = () => owner.value?.entries.find((item) => item.definition === definition);
  return {
    open: <T = void>(props?: Partial<DialogProps<C>>) => {
      owner.value = current();
      return openIn<T, DialogProps<C>>(owner.value, component, toProps(props), {
        definition,
        defaults: toProps(options.props),
        keepMounted: options.keepMounted,
      });
    },
    dismiss: () => {
      const item = entry();
      if (item) owner.value?.dismiss(item, "programmatic");
    },
    isOpen: computed(() => entry()?.isOpen ?? false),
  };
};

export const closeAllDialogs = () => {
  current()?.closeAll();
};
