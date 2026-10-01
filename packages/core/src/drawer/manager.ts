import type { Component } from "vue";

import {
  type DialogDefinition,
  type DialogHandle,
  type DialogOptions,
  type DialogProps,
  defineDialogWith,
  openDialogWith,
} from "../dialog/manager";
import type { DrawerRootProps } from "./context";
import DrawerRoot from "./DrawerRoot.vue";

export type DrawerOptions = Omit<DrawerRootProps, "open" | "defaultOpen" | "activeSnapPoint" | "unmountOnHide">;

type DrawerArgs<P> = Partial<P> extends P ? [props?: P, options?: DrawerOptions] : [props: P, options?: DrawerOptions];

export const openDrawer = <T = void, C extends Component = Component>(
  component: C,
  ...[props, options]: DrawerArgs<DialogProps<C>>
): DialogHandle<T, DialogProps<C>> =>
  openDialogWith<T, DialogProps<C>>(component, props, { root: DrawerRoot, rootProps: { ...options } });

export const defineDrawer = <C extends Component>(
  component: C,
  { props, keepMounted, ...options }: DialogOptions<C> & DrawerOptions = {},
): DialogDefinition<C> => defineDialogWith(component, { props, keepMounted }, { root: DrawerRoot, rootProps: options });
