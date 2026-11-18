import { EditorState, type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { LoroDoc } from "loro-crdt";
import { getTextFromDoc } from "../src/index.ts";

/** A Loro document whose text is `text`. */
export function docWithText(text: string): LoroDoc {
    const doc = new LoroDoc();
    getTextFromDoc(doc).insert(0, text);
    doc.commit();
    return doc;
}

/** A real editor view on `text`, with the given extensions, in the DOM. */
export function editorOn(text: string, extensions: Extension): EditorView {
    return new EditorView({
        state: EditorState.create({ doc: text, extensions }),
        parent: document.body,
    });
}

/** Types `text` at the end of the editor, as a user would. */
export function typeAtEnd(view: EditorView, text: string): void {
    const end = view.state.doc.length;
    view.dispatch({
        changes: { from: end, insert: text },
        selection: { anchor: end + text.length },
        userEvent: "input.type",
    });
}

/** Lets the plugins' queued work run: microtasks and zero-delay timers. */
export function settle(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
}
