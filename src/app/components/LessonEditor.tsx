"use client";

import { useCallback, useRef, useState } from "react";
import { saveLessonContent } from "@/app/actions/lesson";
import type { JSONContent } from "@tiptap/react";
import { RichTextEditor, type RichTextEditorRef } from "./RichTextEditor";
import styles from "./LessonEditor.module.css";

interface LessonEditorProps {
  lessonId: string;
  initialContent?: JSONContent | null;
}

export function LessonEditor({ lessonId, initialContent }: LessonEditorProps) {
  const editorRef = useRef<RichTextEditorRef>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = useCallback(async () => {
    const contentJson = editorRef.current?.getJSON();
    if (contentJson == null) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveLessonContent(lessonId, contentJson);
      setMessage({ type: "success", text: "Saved." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save.",
      });
    } finally {
      setSaving(false);
    }
  }, [lessonId]);

  return (
    <div className={styles.wrapper}>
      <RichTextEditor ref={editorRef} initialContent={initialContent} />
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={styles.saveButton}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {message && (
          <span
            className={
              message.type === "success"
                ? styles.messageSuccess
                : styles.messageError
            }
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
