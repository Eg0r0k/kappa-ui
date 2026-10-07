import { expect, it, vi } from "vitest";

const table = (rows: number) => {
  const scroller = document.createElement("div");
  scroller.style.cssText = "height: 200px; width: 400px; overflow: auto";
  const el = document.createElement("table");
  el.style.cssText = "width: 100%; border-collapse: separate; border-spacing: 0";
  el.innerHTML = `<thead style="position: sticky; top: 0; background: white"><tr><th style="height: 30px">h</th></tr></thead>`;
  for (let index = 0; index < rows; index++) {
    const body = document.createElement("tbody");
    body.dataset.index = String(index);
    body.innerHTML = `<tr><td style="height: 20px">r${index}</td></tr>`;
    el.append(body);
  }
  scroller.append(el);
  document.body.append(scroller);
  return { scroller, el };
};

it("ResizeObserver reports height changes of a tbody", async () => {
  const { el } = table(5);
  const body = el.querySelectorAll("tbody")[2]!;
  const sizes: number[] = [];
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) sizes.push(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height);
  });
  observer.observe(body);
  await vi.waitFor(() => expect(sizes).toHaveLength(1));
  const base = sizes[0]!;
  expect(base).toBeGreaterThanOrEqual(20);

  const detail = document.createElement("tr");
  detail.innerHTML = `<td style="height: 60px">detail</td>`;
  body.append(detail);
  await vi.waitFor(() => expect(sizes).toHaveLength(2));
  expect(sizes[1]! - base).toBeGreaterThanOrEqual(60);

  detail.remove();
  await vi.waitFor(() => expect(sizes).toEqual([base, sizes[1]!, base]));
  observer.disconnect();
});

it("keeps a sticky thead at the top of the scroller", async () => {
  const { scroller, el } = table(40);
  scroller.scrollTop = 300;
  await vi.waitFor(() => expect(scroller.scrollTop).toBe(300));
  const thead = el.querySelector("thead")!;
  expect(thead.getBoundingClientRect().top).toBe(scroller.getBoundingClientRect().top);
});
