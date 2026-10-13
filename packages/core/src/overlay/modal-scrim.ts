import {
  type MaybeRefOrGetter,
  computed,
  createCommentVNode,
  defineComponent,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
  toValue,
} from "vue";

export const useModalScrim = (options: {
  open: MaybeRefOrGetter<boolean>;
  modal: MaybeRefOrGetter<boolean>;
  forceMount?: MaybeRefOrGetter<boolean | undefined>;
}) => {
  const layers = ref(0);
  const pressing = ref(false);

  const ModalScrimHold = defineComponent({
    name: "ModalScrimHold",
    setup: () => {
      const instance = getCurrentInstance();
      let counted = false;
      onMounted(() => {
        counted = (instance?.subTree.el as Node | null)?.isConnected ?? false;
        if (counted) layers.value += 1;
      });
      onBeforeUnmount(() => {
        if (counted) layers.value -= 1;
      });
      return () => createCommentVNode("modal-scrim-hold");
    },
  });

  const release = () => {
    window.removeEventListener("pointerup", release, true);
    window.removeEventListener("pointercancel", release, true);
    setTimeout(() => {
      pressing.value = false;
    });
  };

  const onScrimPointerdown = () => {
    pressing.value = true;
    window.addEventListener("pointerup", release, true);
    window.addEventListener("pointercancel", release, true);
  };

  const scrimVisible = computed(
    () =>
      (toValue(options.modal) && layers.value > 0 && (toValue(options.open) || !toValue(options.forceMount))) ||
      pressing.value,
  );

  return { scrimVisible, onScrimPointerdown, ModalScrimHold };
};

export type ModalScrim = ReturnType<typeof useModalScrim>;
