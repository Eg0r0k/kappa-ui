import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { h } from "vue";

import { Alert, AlertActions, AlertClose, AlertDescription, AlertTitle } from "@/ui/alert";

const all = { icon: true, title: true, description: true, actions: false, close: false };

const render = (props: Record<string, unknown> = {}, parts = all) => {
  mount(
    {
      render: () =>
        h(
          "div",
          {
            style: "width: 480px; --primary: rgb(1, 2, 3); --primary-foreground: rgb(4, 5, 6); --info: rgb(0, 0, 255)",
          },
          [
            h(Alert, props, () => [
              parts.icon ? h("svg", { viewBox: "0 0 24 24", "data-testid": "icon" }) : null,
              parts.title ? h(AlertTitle, () => "Heads up") : null,
              parts.description ? h(AlertDescription, () => "You can add components with the CLI.") : null,
              parts.actions ? h(AlertActions, () => h("button", { style: "height: 28px" }, "Undo")) : null,
              parts.close ? h(AlertClose) : null,
            ]),
          ],
        ),
    },
    { attachTo: document.body },
  );
  const find = (slot: string) => document.querySelector<HTMLElement>(`[data-slot=${slot}]`)!;
  return {
    alert: find("alert"),
    title: find("alert-title"),
    description: find("alert-description"),
    actions: find("alert-actions"),
    close: find("alert-close"),
    icon: document.querySelector<SVGElement>("[data-testid=icon]")!,
  };
};

const middle = (element: Element) => {
  const { top, height } = element.getBoundingClientRect();
  return top + height / 2;
};

describe("Alert", () => {
  it("is a solid primary md vertical alert by default", () => {
    const { alert } = render();
    expect(alert.tagName).toBe("DIV");
    expect(alert.getAttribute("role")).toBe("alert");
    expect(alert.dataset).toMatchObject({ variant: "solid", color: "primary", size: "md", orientation: "vertical" });
    expect(getComputedStyle(alert).backgroundColor).toBe("rgb(1, 2, 3)");
    expect(getComputedStyle(alert).color).toBe("rgb(4, 5, 6)");
  });

  it("takes the info colour", () => {
    expect(getComputedStyle(render({ color: "info" }).alert).backgroundColor).toBe("rgb(0, 0, 255)");
  });

  it.each([
    ["xs", 10, 14],
    ["sm", 12, 16],
    ["md", 16, 20],
    ["lg", 20, 20],
    ["xl", 24, 24],
  ])("pads %s by %ipx with a %ipx icon", (size, padding, icon) => {
    const parts = render({ size });
    expect(getComputedStyle(parts.alert).paddingTop).toBe(`${padding}px`);
    expect(parts.icon.getBoundingClientRect().width).toBe(icon);
  });

  it("puts the icon beside the title, centred on its first line", () => {
    const { alert, title, icon } = render();
    expect(icon.getBoundingClientRect().left).toBe(alert.getBoundingClientRect().left + 16);
    expect(title.getBoundingClientRect().left).toBe(icon.getBoundingClientRect().right + 10);
    expect(middle(icon)).toBe(middle(title));
  });

  it("starts the text at the padding without an icon", () => {
    const { alert, title } = render({}, { ...all, icon: false });
    expect(title.getBoundingClientRect().left).toBe(alert.getBoundingClientRect().left + 16);
  });

  it("stacks the actions under the description when vertical", () => {
    const { description, actions } = render({}, { ...all, actions: true });
    expect(actions.getBoundingClientRect().top).toBe(description.getBoundingClientRect().bottom + 10);
    expect(actions.getBoundingClientRect().left).toBe(description.getBoundingClientRect().left);
  });

  it("puts the actions at the end and centres everything when horizontal", () => {
    const { alert, title, actions, icon } = render(
      { orientation: "horizontal" },
      { ...all, description: false, actions: true },
    );
    const box = alert.getBoundingClientRect();
    expect(actions.getBoundingClientRect().right).toBe(box.right - 16);
    expect(actions.getBoundingClientRect().left).toBeGreaterThan(title.getBoundingClientRect().right);
    expect(middle(actions)).toBeCloseTo(middle(alert), 0);
    expect(middle(title)).toBeCloseTo(middle(alert), 0);
    expect(middle(icon)).toBeCloseTo(middle(alert), 0);
  });

  it("centres a tall text block against the actions when horizontal", () => {
    const { alert, title, description, actions } = render({ orientation: "horizontal" }, { ...all, actions: true });
    const text = (title.getBoundingClientRect().top + description.getBoundingClientRect().bottom) / 2;
    expect(text).toBeCloseTo(middle(alert), 0);
    expect(middle(actions)).toBeCloseTo(middle(alert), 0);
  });

  it("closes from AlertClose and reports it", async () => {
    const updates: unknown[] = [];
    const { close } = render({ "onUpdate:open": (value: unknown) => updates.push(value) }, { ...all, close: true });
    expect(close.tagName).toBe("BUTTON");
    expect(close.getAttribute("aria-label")).toBe("Close");
    await userEvent.click(close);
    expect(updates).toEqual([false]);
    expect(document.querySelector("[data-slot=alert]")).toBeNull();
  });

  it("puts the close button on the title's line at the end, clear of the text", () => {
    const { alert, title, description, close } = render({}, { ...all, close: true });
    expect(middle(close)).toBeCloseTo(middle(title), 0);
    expect(close.getBoundingClientRect().right).toBe(alert.getBoundingClientRect().right - 8);
    expect(description.getBoundingClientRect().right).toBeLessThanOrEqual(close.getBoundingClientRect().left);
    expect(getComputedStyle(close).color).toBe(getComputedStyle(alert).color);
  });

  it.each([
    ["4px", ""],
    ["16px", "mt-4"],
    ["0px", "mt-0"],
  ])("spaces the description %s under the title with class '%s'", (margin, className) => {
    mount(
      {
        render: () =>
          h(Alert, null, () => [h(AlertTitle, () => "Title"), h(AlertDescription, { class: className }, () => "Text")]),
      },
      { attachTo: document.body },
    );
    expect(getComputedStyle(document.querySelector("[data-slot=alert-description]")!).marginTop).toBe(margin);
  });

  it("leaves Enter in a form to the form's own submit button", async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    mount(
      {
        render: () =>
          h("form", { onSubmit }, [
            h(Alert, null, () => [h(AlertTitle, () => "Fix 2 fields"), h(AlertClose)]),
            h("input", { "data-testid": "field" }),
            h("button", { type: "submit" }, "Save"),
          ]),
      },
      { attachTo: document.body },
    );
    expect(document.querySelector("[data-slot=alert-close]")!.getAttribute("type")).toBe("button");
    document.querySelector<HTMLInputElement>("[data-testid=field]")!.focus();
    await userEvent.keyboard("{Enter}");
    expect(document.querySelector("[data-slot=alert]")).not.toBeNull();
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it.each([
    ["xs", 28],
    ["md", 32],
    ["xl", 36],
  ])("sizes the close button of a %s alert to %ipx", (size, width) => {
    const { close } = render({ size }, { ...all, close: true });
    expect(close.getBoundingClientRect().width).toBe(width);
  });
});
