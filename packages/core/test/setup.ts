import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach } from "vitest";

let unmountAll = () => {};
enableAutoUnmount((callback) => {
  unmountAll = callback;
});

afterEach(() => {
  unmountAll();
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
});
