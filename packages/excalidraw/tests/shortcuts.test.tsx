import { vi } from "vitest";
import React from "react";
import { KEYS } from "@excalidraw/common";

import { Excalidraw } from "../index";
import { saveAsJSON } from "../data/json";

import { API } from "./helpers/api";
import { Keyboard } from "./helpers/ui";
import { fireEvent, render, waitFor } from "./test-utils";

vi.mock("../data/json", () => ({
  saveAsJSON: vi.fn(() => Promise.resolve({ fileHandle: {} })),
}));

it("should call saveAsJSON when Ctrl+S is pressed, even inside a text input", async () => {
  const { container } = await render(<Excalidraw handleKeyboardGlobally />);
  const input = container.querySelector("input")!;
  input.focus();

  fireEvent.keyDown(input, { key: "s", ctrlKey: true });

  expect(saveAsJSON).toHaveBeenCalled();
});

it("should prevent browser default behavior when Ctrl+S is pressed", async () => {
  const windowAddEventListenerSpy = vi.spyOn(window, "addEventListener");
  const documentAddEventListenerSpy = vi.spyOn(document, "addEventListener");

  await render(<Excalidraw handleKeyboardGlobally />);

  const keydownHandler =
    windowAddEventListenerSpy.mock.calls.find(([eventName]) => eventName === "keydown")?.[1] ??
    documentAddEventListenerSpy.mock.calls.find(([eventName]) => eventName === "keydown")?.[1];

  expect(keydownHandler).toBeDefined();

  const event = new KeyboardEvent("keydown", {
    key: "s",
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });

  const preventDefaultSpy = vi.spyOn(event, "preventDefault");

  if (keydownHandler) {
    if (typeof keydownHandler === "function") {
      keydownHandler(event);
    } else if (typeof keydownHandler === "object" && "handleEvent" in keydownHandler) {
      keydownHandler.handleEvent(event);
    }
  }

  expect(preventDefaultSpy).toHaveBeenCalled();
});


describe("shortcuts", () => {
  it("Clear canvas shortcut should display confirm dialog", async () => {
    await render(
      <Excalidraw
        initialData={{ elements: [API.createElement({ type: "rectangle" })] }}
        handleKeyboardGlobally
      />,
    );

    expect(window.h.elements.length).toBe(1);

    Keyboard.withModifierKeys({ ctrl: true }, () => {
      Keyboard.keyDown(KEYS.DELETE);
    });

    const confirmDialog = document.querySelector(".confirm-dialog")!;
    expect(confirmDialog).not.toBe(null);

    fireEvent.click(confirmDialog.querySelector('[aria-label="Confirm"]')!);

    await waitFor(() => {
      expect(window.h.elements[0].isDeleted).toBe(true);
    });
  });
});
