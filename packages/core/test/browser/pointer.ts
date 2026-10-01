export const pointer = (
  type: "pointerdown" | "pointermove" | "pointerup",
  target: Element,
  x: number,
  y: number,
  pointerType: "touch" | "mouse" | "pen" = "touch",
) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      pointerId: 1,
      pointerType,
      isPrimary: true,
      button: 0,
      buttons: type === "pointerup" ? 0 : 1,
      clientX: x,
      clientY: y,
      bubbles: true,
      cancelable: true,
      composed: true,
    }),
  );

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const drag = async (target: Element, from: [number, number], to: [number, number], steps = 4, pause = 40) => {
  pointer("pointerdown", target, from[0], from[1]);
  for (let i = 1; i <= steps; i++) {
    await wait(pause);
    pointer(
      "pointermove",
      target,
      from[0] + ((to[0] - from[0]) * i) / steps,
      from[1] + ((to[1] - from[1]) * i) / steps,
    );
  }
  await wait(pause);
  pointer("pointerup", target, to[0], to[1]);
};

export const flick = async (target: Element, from: [number, number], to: [number, number]) => {
  pointer("pointerdown", target, from[0], from[1]);
  await wait(5);
  pointer("pointermove", target, from[0] + (to[0] - from[0]) * 0.1, from[1] + (to[1] - from[1]) * 0.1);
  await wait(10);
  pointer("pointermove", target, to[0], to[1]);
  await wait(5);
  pointer("pointerup", target, to[0], to[1]);
};
