export type SnapPoint = number | string;

export interface ResolveSnapPointOptions {
  sequential?: boolean;
  dismissible?: boolean;
  active?: number;
}

export const STEP_VELOCITY = 0.4;
export const FLING_VELOCITY = 2;
const EPSILON = 0.5;

export const toPixels = (point: SnapPoint, viewport: number) => {
  if (typeof point === "number") return point > 1 ? point : point * viewport;
  const value = parseFloat(point);
  return Number.isNaN(value) ? 0 : value;
};

const CLOSED = -1;

const nearest = (points: readonly number[], position: number, lowest: number) => {
  const distance = (index: number) => Math.abs((index === CLOSED ? 0 : points[index]!) - position);
  return points.reduce((best, _, index) => (distance(index) <= distance(best) ? index : best), lowest);
};

const aim = (points: readonly number[], position: number, velocity: number, lowest: number, sequential: boolean) => {
  const highest = points.length - 1;
  const speed = Math.abs(velocity);
  if (speed >= FLING_VELOCITY && !sequential) return velocity > 0 ? highest : lowest;
  if (speed < STEP_VELOCITY) return nearest(points, position, lowest);
  if (velocity > 0) {
    const above = points.findIndex((point) => point > position + EPSILON);
    return above === -1 ? highest : above;
  }
  return points.reduce((below, point, index) => (point < position - EPSILON ? index : below), lowest);
};

export const resolveSnapPoint = (
  points: readonly number[],
  position: number,
  velocity: number,
  { sequential = false, dismissible = true, active }: ResolveSnapPointOptions = {},
): number | null => {
  if (points.length === 0) return null;
  const lowest = dismissible ? CLOSED : 0;
  const target = aim(points, position, velocity, lowest, sequential);
  const step = sequential && active !== undefined ? Math.min(active + 1, Math.max(active - 1, target)) : target;
  const index = Math.max(lowest, step);
  return index === CLOSED ? null : index;
};

export const cycleSnapPoint = <T extends SnapPoint>(points: readonly T[], active: SnapPoint | null): T | undefined => {
  if (points.length === 0) return undefined;
  const index = points.indexOf(active as T);
  return points[(index + 1) % points.length];
};
