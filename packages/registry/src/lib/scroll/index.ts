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

export const animVerticalScrollTo = (
  target: ScrollTarget,
  to: number,
  duration = 0,
  prevTime?: number,
) => {
  const startTime = prevTime ?? performance.now();
  const position = getVerticalScrollPosition(target);

  if (duration <= 0) {
    if (position !== to) writeVertical(target, to);
    return;
  }

  requestAnimationFrame((nowTime) => {
    const frameTime = nowTime - startTime;
    const next =
      position + ((to - position) / Math.max(frameTime, duration)) * frameTime;

    writeVertical(target, next);
    if (next !== to) animVerticalScrollTo(target, to, duration - frameTime, nowTime);
  });
};

export const animHorizontalScrollTo = (
  target: ScrollTarget,
  to: number,
  duration = 0,
  prevTime?: number,
) => {
  const startTime = prevTime ?? performance.now();
  const position = getHorizontalScrollPosition(target);

  if (duration <= 0) {
    if (position !== to) writeHorizontal(target, to);
    return;
  }

  requestAnimationFrame((nowTime) => {
    const frameTime = nowTime - startTime;
    const next =
      position + ((to - position) / Math.max(frameTime, duration)) * frameTime;

    writeHorizontal(target, next);
    if (next !== to) animHorizontalScrollTo(target, to, duration - frameTime, nowTime);
  });
};

export const setVerticalScrollPosition = (
  target: ScrollTarget,
  offset: number,
  duration?: number,
) => {
  if (duration) {
    animVerticalScrollTo(target, offset, duration);
    return;
  }
  writeVertical(target, offset);
};

export const setHorizontalScrollPosition = (
  target: ScrollTarget,
  offset: number,
  duration?: number,
) => {
  if (duration) {
    animHorizontalScrollTo(target, offset, duration);
    return;
  }
  writeHorizontal(target, offset);
};
