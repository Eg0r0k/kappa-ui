import { readFileSync } from "node:fs";
import * as internal from "reka-ui/internal";
import { afterEach, describe, expect, it, vi } from "vitest";

const peer = (
  JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
    peerDependencies: Record<string, string>;
  }
).peerDependencies["reka-ui"];

afterEach(() => {
  vi.doUnmock("reka-ui/internal");
  vi.resetModules();
});

describe("menu", () => {
  it("re-exports the Menu parts from reka-ui/internal", async () => {
    const menu = await import("../../src/menu/index.ts");
    expect(menu.MenuRoot).toBe(internal.MenuRoot);
    expect(menu.MenuContent).toBe(internal.MenuContent);
  });

  it("names the missing parts and the supported range when reka-ui/internal drops them", async () => {
    vi.doMock("reka-ui/internal", () => ({ MenuRoot: {} }));
    await expect(import("../../src/menu/index.ts")).rejects.toThrow(
      `reka-ui/internal no longer exports MenuAnchor, MenuCheckboxItem, MenuContent`,
    );
    await expect(import("../../src/menu/index.ts")).rejects.toThrow(`Supported: reka-ui ${peer}.`);
  });
});
