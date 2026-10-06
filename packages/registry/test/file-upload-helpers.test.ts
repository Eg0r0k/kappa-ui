import { describe, expect, it } from "vitest";

import { acceptsFile, formatFileSize, gateFiles } from "@/ui/file-upload";

const file = (name: string, type = "", size = 1, lastModified = 1) =>
  new File([new Uint8Array(size)], name, { type, lastModified });

describe("acceptsFile", () => {
  it.each([
    ["image/*", file("a.png", "image/png"), true],
    ["image/*", file("a.pdf", "application/pdf"), false],
    ["image/png", file("a.png", "image/png"), true],
    ["image/png", file("a.jpg", "image/jpeg"), false],
    [".pdf", file("a.PDF", "application/pdf"), true],
    [".PDF", file("a.pdf", "application/pdf"), true],
    [".pdf", file("a.png", "image/png"), false],
    ["image/*,.pdf", file("a.pdf", "application/pdf"), true],
    ["image/*,.pdf", file("a.webp", "image/webp"), true],
    ["image/*,.pdf", file("a.zip", "application/zip"), false],
    [" image/png , .md ", file("notes.md"), true],
    ["image/*", file("photo"), false],
    ["text/markdown", file("notes.md"), false],
    [".md", file("notes.md"), true],
    ["*", file("a.exe", "application/octet-stream"), true],
    ["", file("a.exe", "application/octet-stream"), true],
    [undefined, file("a.exe"), true],
  ] as const)("accept %j and %o gives %s", (accept, candidate, expected) => {
    expect(acceptsFile(candidate, accept)).toBe(expected);
  });
});

describe("formatFileSize", () => {
  it.each([
    [0, "0 B"],
    [980, "980 B"],
    [1024, "1 KB"],
    [1536, "1.5 KB"],
    [12 * 1024 * 1024, "12 MB"],
    [2.25 * 1024 ** 3, "2.3 GB"],
    [1024 * 1024 - 1, "1 MB"],
    [1023, "1023 B"],
    [-5, "0 B"],
  ])("formats %d as %s", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});

describe("gateFiles", () => {
  it("checks in order: directory, type, size, duplicate, then count", () => {
    const existing = file("kept.png", "image/png", 10);
    const folder = file("photos", "", 0);
    const huge = file("huge.png", "image/png", 100);
    const pdf = file("doc.pdf", "application/pdf", 10);
    const again = file("kept.png", "image/png", 10);
    const fresh = [file("a.png", "image/png", 10), file("b.png", "image/png", 10)];

    const result = gateFiles(
      [
        { file: folder, directory: true },
        { file: pdf },
        { file: huge },
        { file: again },
        ...fresh.map((f) => ({ file: f })),
      ],
      [existing],
      { multiple: true, accept: "image/*", maxSize: 50, maxFiles: 2 },
    );

    expect(result.accepted).toEqual([fresh[0]]);
    expect(result.files).toEqual([existing, fresh[0]]);
    expect(result.rejections.map(({ file, reason }) => [file.name, reason])).toEqual([
      ["photos", "directory"],
      ["doc.pdf", "type"],
      ["huge.png", "size"],
      ["kept.png", "duplicate"],
      ["b.png", "count"],
    ]);
  });

  it("keeps the first good file in single mode and rejects the rest as count", () => {
    const files = [file("a.txt", "text/plain"), file("b.png", "image/png"), file("c.png", "image/png")];
    const result = gateFiles(
      files.map((f) => ({ file: f })),
      [file("old.png", "image/png")],
      { multiple: false, accept: "image/*" },
    );
    expect(result.files).toEqual([files[1]]);
    expect(result.rejections.map(({ file, reason }) => [file.name, reason])).toEqual([
      ["a.txt", "type"],
      ["c.png", "count"],
    ]);
  });

  it("keeps the current file in single mode when nothing passes", () => {
    const current = file("old.png", "image/png");
    const result = gateFiles([{ file: file("a.txt", "text/plain") }], [current], {
      multiple: false,
      accept: "image/*",
    });
    expect(result.files).toEqual([current]);
    expect(result.accepted).toEqual([]);
  });

  it("does not treat a replacement as a duplicate in single mode", () => {
    const current = file("same.png", "image/png");
    const result = gateFiles([{ file: file("same.png", "image/png") }], [current], { multiple: false });
    expect(result.rejections).toEqual([]);
    expect(result.accepted).toHaveLength(1);
  });

  it("catches duplicates inside one batch", () => {
    const result = gateFiles([{ file: file("a.png") }, { file: file("a.png") }], [], { multiple: true });
    expect(result.rejections.map(({ reason }) => reason)).toEqual(["duplicate"]);
  });

  it("rejects everything as count once maxFiles is reached", () => {
    const result = gateFiles([{ file: file("c.png") }], [file("a.png"), file("b.png")], {
      multiple: true,
      maxFiles: 2,
    });
    expect(result.files).toHaveLength(2);
    expect(result.rejections.map(({ reason }) => reason)).toEqual(["count"]);
  });
});
