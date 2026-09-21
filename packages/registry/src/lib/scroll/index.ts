export type ScrollTarget = Element | Window;

const isWindow = (target: ScrollTarget): target is Window => target === window;

export const getVerticalScrollPosition = (target: ScrollTarget) =>
  isWindow(target) ? target.scrollY : target.scrollTop;

export const getHorizontalScrollPosition = (target: ScrollTarget) =>
  isWindow(target) ? target.scrollX : target.scrollLeft;

const writeVertical = (target: ScrollTarget, offset: number) => {
  if (isWindow(target)) {
    target.scrollTo(target.scrollX, offset);
    return;
  }
  target.scrollTop = offset;
};

const writeHorizontal = (target: ScrollTarget, offset: number) => {
  if (isWindow(target)) {
    target.scrollTo(offset, target.scrollY);
    return;
  }
  target.scrollLeft = offset;
};

const createAnimScrollTo = (
  get: (target: ScrollTarget) => number,
  write: (target: ScrollTarget, offset: number) => void,
): ((target: ScrollTarget, to: number, duration?: number, prevTime?: number) => void) => {
  const anim = (
    target: ScrollTarget,
    to: number,
    duration = 0,
    prevTime?: number,
  ): void => {
    const startTime = prevTime ?? performance.now();
    const position = get(target);

    if (duration <= 0) {
      if (position !== to) write(target, to);
      return;
    }

    requestAnimationFrame((nowTime) => {
      const frameTime = nowTime - startTime;
      const next =
        position + ((to - position) / Math.max(frameTime, duration)) * frameTime;

      write(target, next);
      if (next !== to) anim(target, to, duration - frameTime, nowTime);
    });
  };

  return anim;
};

const createSetScrollPosition = (
  anim: (target: ScrollTarget, to: number, duration?: number, prevTime?: number) => void,
  write: (target: ScrollTarget, offset: number) => void,
): ((target: ScrollTarget, offset: number, duration?: number) => void) => {
  return (target: ScrollTarget, offset: number, duration?: number): void => {
    if (duration) {
      anim(target, offset, duration);
      return;
    }
    write(target, offset);
  };
};

export const animVerticalScrollTo: (
  target: ScrollTarget,
  to: number,
  duration?: number,
  prevTime?: number,
) => void = createAnimScrollTo(getVerticalScrollPosition, writeVertical);

export const animHorizontalScrollTo: (
  target: ScrollTarget,
  to: number,
  duration?: number,
  prevTime?: number,
) => void = createAnimScrollTo(getHorizontalScrollPosition, writeHorizontal);

export const setVerticalScrollPosition: (
  target: ScrollTarget,
  offset: number,
  duration?: number,
) => void = createSetScrollPosition(animVerticalScrollTo, writeVertical);

export const setHorizontalScrollPosition: (
  target: ScrollTarget,
  offset: number,
  duration?: number,
) => void = createSetScrollPosition(animHorizontalScrollTo, writeHorizontal);
