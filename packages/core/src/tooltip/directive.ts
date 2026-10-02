import type { TooltipContentProps } from "reka-ui";
import {
  type Component,
  type ComponentInternalInstance,
  type Directive,
  type DirectiveBinding,
  type VNode,
  h,
  isVNode,
  render,
} from "vue";

import type { TooltipRootProps } from "./context";
import TooltipElementTrigger from "./TooltipElementTrigger.vue";
import TooltipRoot from "./TooltipRoot.vue";

export type TooltipDirectiveOptions = Omit<TooltipRootProps, "open" | "defaultOpen"> &
  Pick<
    TooltipContentProps,
    | "side"
    | "sideOffset"
    | "align"
    | "alignOffset"
    | "avoidCollisions"
    | "collisionPadding"
    | "sticky"
    | "hideWhenDetached"
  > & { content: string };

export type TooltipDirectiveValue = string | TooltipDirectiveOptions | false | null | undefined;

type Side = NonNullable<TooltipContentProps["side"]>;
type Provides = Record<PropertyKey, unknown>;
type Instance = ComponentInternalInstance & { provides: Provides };
type Host = HTMLElement & { _kappaTooltip?: { container: HTMLElement; provides?: Provides; signature?: string } };

const sides: string[] = ["top", "right", "bottom", "left"];

const defined = <T extends object>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as Partial<T>;

const resolve = ({ value, arg, modifiers }: DirectiveBinding<TooltipDirectiveValue>) => {
  const options: TooltipDirectiveOptions =
    typeof value === "object" && value !== null ? value : { content: value || "" };
  const {
    content,
    side,
    sideOffset,
    align,
    alignOffset,
    avoidCollisions,
    collisionPadding,
    sticky,
    hideWhenDetached,
    ...root
  } = options;
  return {
    text: content,
    root: defined({ ...root, role: modifiers.label ? ("label" as const) : root.role }),
    content: defined({
      side: side ?? (arg && sides.includes(arg) ? (arg as Side) : undefined),
      sideOffset,
      align,
      alignOffset,
      avoidCollisions,
      collisionPadding,
      sticky,
      hideWhenDetached,
    }),
  };
};

const deepestComponent = (root: Instance, target: VNode) => {
  const search = (node: VNode, owner: Instance | undefined): Instance | null | undefined => {
    if (node === target || (node.el !== null && node.el === target.el)) return owner ?? null;
    if (node.component) return search(node.component.subTree, node.component as Instance);
    if (!Array.isArray(node.children)) return undefined;
    for (const child of node.children) {
      if (!isVNode(child)) continue;
      const found = search(child, owner);
      if (found !== undefined) return found;
    }
    return undefined;
  };
  return search(root.subTree, undefined) ?? undefined;
};

// Vue gives a component rendered with render() only its appContext's provides, so the directive
// hands it the provides in scope at the element, as Vuetify's useDirectiveComponent does.
const providesAt = (instance: Instance | undefined, vnode: VNode) => {
  if (!instance) return undefined;
  const owner = (vnode as VNode & { ctx?: Instance | null }).ctx;
  if (owner && owner !== instance) return owner.provides;
  return (deepestComponent(instance, vnode) ?? instance).provides;
};

export const createTooltipDirective = (content: Component): Directive<HTMLElement, TooltipDirectiveValue> => {
  const hide = (el: Host) => {
    if (!el._kappaTooltip) return;
    render(null, el._kappaTooltip.container);
    delete el._kappaTooltip;
  };

  const show = (el: Host, binding: DirectiveBinding<TooltipDirectiveValue>, vnode: VNode) => {
    const options = resolve(binding);
    const { text, root, content: contentProps } = options;
    if (!text) {
      hide(el);
      return;
    }
    const signature = JSON.stringify(options);
    if (el._kappaTooltip?.signature === signature) return;
    const instance = binding.instance?.$ as Instance | undefined;
    el._kappaTooltip ??= { container: document.createElement("div"), provides: providesAt(instance, vnode) };
    el._kappaTooltip.signature = signature;
    const node = h(TooltipRoot, root, () => [
      h(TooltipElementTrigger, { element: el, label: root.role === "label" ? text : undefined }),
      h(content, contentProps, () => text),
    ]);
    if (instance) node.appContext = { ...instance.appContext, provides: el._kappaTooltip.provides ?? {} };
    render(node, el._kappaTooltip.container);
  };

  return { mounted: show, updated: show, beforeUnmount: hide };
};
