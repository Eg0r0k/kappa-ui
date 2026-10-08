const milliseconds = (list: string) =>
  list.split(",").map((value) => parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1000));

export const transitionTime = (node: HTMLElement) => {
  const style = getComputedStyle(node);
  const delays = milliseconds(style.transitionDelay);
  return Math.max(
    0,
    ...milliseconds(style.transitionDuration).map((duration, index) => duration + delays[index % delays.length]!),
  );
};
