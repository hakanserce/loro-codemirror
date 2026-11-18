import { afterEach, describe, expect, it } from "vitest";
import type { EditorView } from "@codemirror/view";
import { getTextFromDoc, LoroSyncPlugin } from "../src/index.ts";
import { docWithText, editorOn, settle, typeAtEnd } from "./editor.ts";

// Regression tests for loro-dev/loro-codemirror#22, fixed in #23: when the
// editor already matched the Loro text, the plugin swallowed the user's first
// edit, and the next one broke the sync.
describe("LoroSyncPlugin", () => {
    let view: EditorView | undefined;
    afterEach(() => view?.destroy());

    it("keeps the first edit when the editor starts with the Loro text", async () => {
        const doc = docWithText("hello");
        view = editorOn("hello", LoroSyncPlugin(doc));
        await settle();

        typeAtEnd(view, "!");
        expect(getTextFromDoc(doc).toString()).toBe("hello!");

        typeAtEnd(view, "?");
        expect(getTextFromDoc(doc).toString()).toBe("hello!?");
    });

    it("keeps the first edit when the editor and the Loro text are both empty", async () => {
        const doc = docWithText("");
        view = editorOn("", LoroSyncPlugin(doc));
        await settle();

        typeAtEnd(view, "a");
        typeAtEnd(view, "b");
        expect(getTextFromDoc(doc).toString()).toBe("ab");
    });

    it("seeds an editor that differs from the Loro text once, then syncs its edits", async () => {
        const doc = docWithText("hello");
        view = editorOn("", LoroSyncPlugin(doc));
        await settle();

        expect(view.state.doc.toString()).toBe("hello");
        expect(getTextFromDoc(doc).toString()).toBe("hello");

        typeAtEnd(view, "!");
        expect(getTextFromDoc(doc).toString()).toBe("hello!");
    });
});
