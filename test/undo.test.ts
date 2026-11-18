import { afterEach, describe, expect, it } from "vitest";
import type { EditorView } from "@codemirror/view";
import { UndoManager } from "loro-crdt";
import {
    getTextFromDoc,
    LoroSyncPlugin,
    LoroUndoPlugin,
    redo,
    undo,
} from "../src/index.ts";
import { docWithText, editorOn, settle, typeAtEnd } from "./editor.ts";

// Regression tests for #19: undo and redo ran Loro's undo inside a CodeMirror
// transaction, whose change event dispatched again while the view was still
// updating.
describe("LoroUndoPlugin", () => {
    let view: EditorView | undefined;
    afterEach(() => view?.destroy());

    async function editedOnce() {
        const doc = docWithText("hello");
        const undoManager = new UndoManager(doc, { mergeInterval: 0 });
        view = editorOn("hello", [
            LoroSyncPlugin(doc),
            LoroUndoPlugin(doc, undoManager),
        ]);
        await settle();
        typeAtEnd(view, " world");
        return { doc, view };
    }

    it("undoes an edit in the editor and the Loro text alike", async () => {
        const { doc, view } = await editedOnce();

        expect(() => undo(view)).not.toThrow();
        await settle();

        expect(view.state.doc.toString()).toBe("hello");
        expect(getTextFromDoc(doc).toString()).toBe("hello");
    });

    it("redoes an undone edit in the editor and the Loro text alike", async () => {
        const { doc, view } = await editedOnce();
        undo(view);
        await settle();

        expect(() => redo(view)).not.toThrow();
        await settle();

        expect(view.state.doc.toString()).toBe("hello world");
        expect(getTextFromDoc(doc).toString()).toBe("hello world");
    });
});
