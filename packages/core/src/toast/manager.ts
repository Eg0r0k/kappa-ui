import { type App, type ComputedRef, type InjectionKey, computed, inject, provide, shallowRef } from "vue";

export interface ToastLifecycle {
  id?: string;
  group?: string;
  duration?: number;
  loading?: boolean;
  background?: boolean;
  onClose?: () => void;
}

export type ToastOptions<T extends object = object> = T & ToastLifecycle;
export type ToastPatch<T extends object = object> = Omit<ToastOptions<T>, "id">;
export type ToastRecord<T extends object = object> = ToastPatch<T> & { id: string; open: boolean };

export type ToastOutcome<T extends object, V> = ToastPatch<T> | ((value: V) => ToastPatch<T>);

export interface ToastPromiseOptions<T extends object, V> {
  loading: ToastOptions<T>;
  success?: ToastOutcome<T, V>;
  error?: ToastOutcome<T, unknown>;
}

export interface ToasterOptions<T extends object> {
  promise?: { success?: ToastPatch<T>; error?: ToastPatch<T> };
}

export interface ToastManager<T extends object = object> {
  toasts: ComputedRef<readonly ToastRecord<T>[]>;
  add: (options: ToastOptions<T>) => string;
  update: (id: string, patch: ToastPatch<T>) => void;
  remove: (id: string) => void;
  clear: (group?: string) => void;
  promise: <V>(promise: Promise<V>, options: ToastPromiseOptions<T, V>) => string;
  register: (group?: string) => () => void;
  drop: (id: string) => void;
  install: (app: App) => void;
}

const key: InjectionKey<ToastManager> = Symbol("ToastManager");

export const createToaster = <T extends object = object>(options: ToasterOptions<T> = {}): ToastManager<T> => {
  const state = shallowRef<ToastRecord<T>[]>([]);
  const hosts = new Map<string | undefined, number>();
  let count = 0;

  const find = (id: string) => state.value.findIndex((toast) => toast.id === id);

  const replace = (index: number, record: ToastRecord<T>) => {
    const next = state.value.slice();
    next[index] = record;
    state.value = next;
  };

  const discard = (records: ToastRecord<T>[]) => {
    if (!records.length) return;
    state.value = state.value.filter((toast) => !records.includes(toast));
    records.forEach((record) => record.onClose?.());
  };

  const update = (id: string, patch: ToastPatch<T>) => {
    const index = find(id);
    if (index !== -1) replace(index, { ...state.value[index]!, ...patch, id, open: true });
  };

  const add = (toast: ToastOptions<T>) => {
    const { id = `toast-${++count}`, ...patch } = toast;
    if (find(id) === -1) state.value = [...state.value, { ...patch, id, open: true } as ToastRecord<T>];
    else update(id, patch as ToastPatch<T>);
    return id;
  };

  const remove = (id: string) => {
    const index = find(id);
    const record = state.value[index];
    if (!record) return;
    if (!hosts.get(record.group)) discard([record]);
    else if (record.open) replace(index, { ...record, open: false });
  };

  const drop = (id: string) => {
    const record = state.value[find(id)];
    if (record && !record.open) discard([record]);
  };

  const clear = (group?: string) =>
    state.value.filter((toast) => group === undefined || toast.group === group).forEach((toast) => remove(toast.id));

  const register = (group?: string) => {
    hosts.set(group, (hosts.get(group) ?? 0) + 1);
    return () => {
      const left = (hosts.get(group) ?? 1) - 1;
      if (left) {
        hosts.set(group, left);
        return;
      }
      hosts.delete(group);
      discard(state.value.filter((toast) => toast.group === group && !toast.open));
    };
  };

  const settle = <V>(id: string, outcome: ToastOutcome<T, V> | undefined, value: V, defaults?: ToastPatch<T>) => {
    if (!state.value[find(id)]?.open) return;
    if (!outcome) {
      remove(id);
      return;
    }
    const patch = typeof outcome === "function" ? (outcome as (value: V) => ToastPatch<T>)(value) : outcome;
    update(id, { ...defaults, ...patch, loading: false } as ToastPatch<T>);
  };

  const promise = <V>(pending: Promise<V>, { loading, success, error }: ToastPromiseOptions<T, V>) => {
    const id = add({ ...loading, loading: true });
    pending.then(
      (value) => settle(id, success, value, options.promise?.success),
      (reason: unknown) => settle(id, error, reason, options.promise?.error),
    );
    return id;
  };

  const manager: ToastManager<T> = {
    toasts: computed(() => state.value),
    add,
    update,
    remove,
    clear,
    promise,
    register,
    drop,
    install: (app) => {
      app.provide(key, manager as unknown as ToastManager);
    },
  };
  return manager;
};

export const provideToaster = <T extends object>(manager: ToastManager<T>) => {
  provide(key, manager as unknown as ToastManager);
  return manager;
};

export const useToast = <T extends object = object>() => {
  const manager = inject(key, null);
  if (!manager) throw new Error("useToast() found no toaster: install one with app.use(createToaster()).");
  return manager as unknown as ToastManager<T>;
};
