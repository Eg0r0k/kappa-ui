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
  { sequential = false, dismissible = true, active }: ResolveSnapPointOptions = {},
): number | null => {
  if (points.length === 0) return null;
  const last = points.length - 1;
  const speed = Math.abs(velocity);
  const opening = velocity > 0;
  let target: number | null;
  if (speed >= FLING_VELOCITY && !sequential) {
    target = opening ? last : dismissible ? null : 0;
  } else if (speed >= STEP_VELOCITY) {
    if (opening) {
      const next = points.findIndex((point) => point > position + EPSILON);
      target = next === -1 ? last : next;
    } else {
      target = dismissible ? null : 0;
      for (let index = last; index >= 0; index--) {
        if (points[index]! < position - EPSILON) {
          target = index;
          break;
        }
      }
    }
  } else {
    target = nearest(points, position, dismissible);
  }
  if (!sequential || active === undefined) return target;
  const limited = Math.max(active - 1, Math.min(active + 1, target ?? -1));
  return limited < 0 ? (dismissible ? null : 0) : limited;
};

export const cycleSnapPoint = <T extends SnapPoint>(points: readonly T[], active: SnapPoint | null): T | undefined => {
  if (points.length === 0) return undefined;
  const index = points.indexOf(active as T);
  return points[(index + 1) % points.length];
};
