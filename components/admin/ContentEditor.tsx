"use client"

import { useState } from "react"
import { SerializedEditorState } from "lexical"

import { Editor } from "@/components/blocks/editor-x/editor"

interface CommentType {
  id: string
  content: string
  created_at: string
  updated_at: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface ContentEditorProps {
  value?: SerializedEditorState
  onChange?: (value: SerializedEditorState) => void
  placeholder?: string
  guidelineId?: string
  onCommentsChange?: (comments: CommentType[]) => void
}

const initialValue = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState

export function ContentEditor({
  value = initialValue,
  onChange,
  placeholder,
  guidelineId,
  onCommentsChange,
}: ContentEditorProps) {
  const [editorState, setEditorState] =
    useState<SerializedEditorState>(value)

  const handleEditorChange = (newState: SerializedEditorState) => {
    setEditorState(newState)
    onChange?.(newState)
  }

  return (
    <Editor
      editorSerializedState={editorState}
      onSerializedChange={handleEditorChange}
    />
  )
}

export function RichTextEditorDemo() {
  return <ContentEditor />
}
