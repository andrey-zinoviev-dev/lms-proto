"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UniqueID from "@tiptap/extension-unique-id";
import { forwardRef, useImperativeHandle } from "react";
import type { JSONContent } from "@tiptap/react";
import styles from "./RichTextEditor.module.css";

export interface RichTextEditorRef {
  getJSON: () => JSONContent | null;
}

interface RichTextEditorProps {
  initialContent?: JSONContent | null;
  /** Optional class name for the editable area (e.g. from parent's CSS module). */
  className?: string;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  function RichTextEditor({ initialContent, className }, ref) {
    const editor = useEditor({
      extensions: [
        StarterKit,
        UniqueID.configure({
          types: ["paragraph", "heading"],
        }),
      ],
      content: initialContent ?? undefined,
      editorProps: {
        attributes: {
          class: [styles.editorContent, className].filter(Boolean).join(" "),
        },
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        getJSON: () => (editor ? editor.getJSON() : null),
      }),
      [editor]
    );

    if (!editor) return null;

    return <EditorContent editor={editor} />;
  }
);
