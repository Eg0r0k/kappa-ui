export type SnapPoint = number | string;

export interface ResolveSnapPointOptions {
  sequential?: boolean;
  dismissible?: boolean;
}

export const STEP_VELOCITY = 0.4;
export const FLING_VELOCITY = 2;
const EPSILON = 0.5;

export const toPixels = (point: SnapPoint, viewport: number) => {
  if (typeof point === "number") return point > 1 ? point : point * viewport;
  const value = parseFloat(point);
  return Number.isNaN(value) ? 0 : value;
};

const nearest = (points: readonly number[], position: number, dismissible: boolean) => {
  let best: number | null = dismissible ? null : 0;
  let distance = Math.abs((best === null ? 0 : points[0]!) - position);
  points.forEach((point, index) => {
    const gap = Math.abs(point - position);
    if (gap <= distance) {
      best = index;
      distance = gap;
    }
  });
  return best;
};

export const resolveSnapPoint = (
  points: readonly number[],
  position: number,
  velocity: number,
  { sequential = false, dismissible = true }: ResolveSnapPointOptions = {},
): number | null => {
  if (points.length === 0) return null;
  const last = points.length - 1;
  const speed = Math.abs(velocity);
  const opening = velocity > 0;
  if (speed >= FLING_VELOCITY && !sequential) {
    if (opening) return last;
    return dismissible ? null : 0;
  }
  if (speed >= STEP_VELOCITY) {
    if (opening) {
      const next = points.findIndex((point) => point > position + EPSILON);
      return next === -1 ? last : next;
    }
    for (let index = last; index >= 0; index--) if (points[index]! < position - EPSILON) return index;
    return dismissible ? null : 0;
  }
  return nearest(points, position, dismissible);
};

export const cycleSnapPoint = <T extends SnapPoint>(points: readonly T[], active: SnapPoint | null): T | undefined => {
  if (points.length === 0) return undefined;
  const index = points.indexOf(active as T);
  return points[(index + 1) % points.length];
};
