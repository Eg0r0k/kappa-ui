import { createContext } from "reka-ui";
import { type Component, type ComputedRef, type Ref, type ShallowRef, computed } from "vue";

export { default as ChartContainer } from "./ChartContainer.vue";
export { default as ChartCrosshair } from "./ChartCrosshair.vue";
export { default as ChartLegend } from "./ChartLegend.vue";
export { default as ChartTooltip } from "./ChartTooltip.vue";
export { default as ChartTooltipContent } from "./ChartTooltipContent.vue";

export type ChartItemConfig = {
  label?: string | Component;
  icon?: Component;
  color?: string;
  theme?: { light: string; dark: string };
};

export type ChartTooltipRow = {
  key: string;
  name: string;
  label: string | Component;
  value: unknown;
  color?: string;
  icon?: Component;
};

export type ChartConfig = Record<string, ChartItemConfig>;

export type ChartDatum = Record<string, unknown>;

export type ChartActive = { datum: ChartDatum; index?: number; x?: number | Date };

export type ChartPointer = { x: number; y: number; type: string; down: boolean };

type ChartEventHandler = (datum: unknown, event: PointerEvent, index: number) => void;

export type ChartEvents = Record<
  string,
  { pointermove: ChartEventHandler; pointerdown: ChartEventHandler; pointerout: () => void }
>;

export type ChartContext = {
  id: string;
  config: Ref<ChartConfig>;
  hidden: Ref<string[]>;
  toggle: (key: string) => void;
  isHidden: (key: string) => boolean;
  pointer: ShallowRef<ChartPointer | undefined>;
  size: ShallowRef<{ width: number; height: number }>;
  active: ShallowRef<ChartActive | undefined>;
  setActive: (active: ChartActive) => void;
  clearActive: () => void;
  events: (selector: string) => ChartEvents;
};

export const [useChart, provideChartContext] = createContext<ChartContext>("Chart");

export const chartItemColor = (item?: ChartItemConfig) =>
  item?.color ?? (item?.theme ? `light-dark(${item.theme.light}, ${item.theme.dark})` : undefined);

export const chartColors =
  (keys: readonly string[]) =>
  (_datum: unknown, index: number): string =>
    `var(--color-${keys[index]})`;

export type ChartSeries<Datum> = {
  y: ComputedRef<((datum: Datum) => number | null)[]>;
  color: (datum: unknown, index: number) => string;
  visible: ComputedRef<string[]>;
};

export const useChartSeries = <Datum extends ChartDatum>(keys: readonly string[]): ChartSeries<Datum> => {
  const { hidden } = useChart();
  const visible = computed(() => keys.filter((key) => !hidden.value.includes(key)));
  const y = computed(() =>
    keys.map((key) => (hidden.value.includes(key) ? () => null : (datum: Datum) => datum[key] as number)),
  );
  return { y, color: chartColors(keys), visible };
};
