export const trackTap = (event: PointerEvent, onTap: (up: PointerEvent) => void) => {
  const doc = (event.target as Node).ownerDocument ?? document;
  const { pointerId, clientX, clientY } = event;
  const listeners = new AbortController();
  const { signal } = listeners;
  const end = () => listeners.abort();
  doc.addEventListener(
    "pointermove",
    (move) => {
      if (move.pointerId === pointerId && Math.hypot(move.clientX - clientX, move.clientY - clientY) > 10) end();
    },
    { signal },
  );
  doc.addEventListener(
    "pointercancel",
    (cancel) => {
      if (cancel.pointerId === pointerId) end();
    },
    { signal },
  );
  doc.addEventListener(
    "pointerup",
    (up) => {
      if (up.pointerId !== pointerId) return;
      end();
      onTap(up);
    },
    { signal },
  );
  return end;
};
