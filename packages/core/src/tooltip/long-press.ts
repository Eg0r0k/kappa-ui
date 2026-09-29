export const isTouchLike = (event: PointerEvent) =>
  event.pointerType === "touch" || (event.pointerType === "pen" && event.buttons !== 0);
