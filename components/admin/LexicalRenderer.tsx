// components/LexicalRenderer.tsx
"use client"

import React, { useMemo, JSX } from "react"
import type { SerializedEditorState, SerializedLexicalNode } from "lexical"

interface LexicalNode extends SerializedLexicalNode {
  children?: LexicalNode[]
  text?: string
  type: string
  level?: number
  headerState?: string
  style?: Record<string, string>
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

interface LexicalRendererProps {
  editorState: SerializedEditorState
}

export function LexicalRenderer({ editorState }: LexicalRendererProps) {
  const renderedContent = useMemo(() => {
    if (!editorState?.root?.children) return null

    let nodeCounter = 0

    const renderNode = (node: LexicalNode): React.ReactNode => {
      const key = `node-${nodeCounter++}`

      switch (node.type) {
        case "paragraph":
          return (
            <p key={key} className="mb-4 text-slate-700">
              {node.children?.map(renderNode)}
            </p>
          )

        case "heading":
          const level = node.level || 2
          const headingClasses = {
            1: "text-4xl font-bold",
            2: "text-2xl font-bold",
            3: "text-xl font-semibold",
            4: "text-lg font-semibold",
            5: "text-base font-semibold",
            6: "text-sm font-semibold",
          }
          const HeadingElement = `h${level}` as keyof JSX.IntrinsicElements
          return React.createElement(
            HeadingElement,
            {
              key,
              className: `${headingClasses[level as keyof typeof headingClasses]} my-3 text-slate-900`,
            },
            node.children?.map(renderNode)
          )

        case "table":
          return (
            <div key={key} className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-slate-300">
                <tbody>
                  {node.children?.map((row: LexicalNode, idx: number) => (
                    <tr key={`tr-${idx}`}>
                      {row.children?.map((cell: LexicalNode, cellIdx: number) => (
                        <td
                          key={`td-${idx}-${cellIdx}`}
                          className={`border border-slate-300 px-4 py-2 ${
                            cell.headerState ? "bg-slate-100 font-semibold" : ""
                          }`}
                        >
                          {cell.children?.map(renderNode)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )

        case "tablerow":
          // ปกติจะถูกจัดการโดย table
          return null

        case "tablecell":
          // ปกติจะถูกจัดการโดย table
          return null

        case "list":
        case "ul":
        case "ol":
          const ListTag = node.type === "ol" ? "ol" : "ul"
          return (
            <ListTag key={key} className="list-disc list-inside mb-4 ml-4">
              {node.children?.map(renderNode)}
            </ListTag>
          )

        case "listitem":
          return (
            <li key={key} className="text-slate-700">
              {node.children?.map(renderNode)}
            </li>
          )

        case "quote":
        case "blockquote":
          return (
            <blockquote
              key={key}
              className="border-l-4 border-slate-400 pl-4 italic my-4 text-slate-600"
            >
              {node.children?.map(renderNode)}
            </blockquote>
          )

        case "code":
          return (
            <code
              key={key}
              className="bg-slate-100 px-2 py-1 rounded text-sm font-mono"
            >
              {node.children?.map(renderNode)}
            </code>
          )

        case "codeblock":
          const codeContent = node.children?.map((n: LexicalNode) => n.text || "").join("\n")
          return (
            <pre
              key={key}
              className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4"
            >
              <code className="text-sm">{codeContent}</code>
            </pre>
          )

        case "text":
          let text: React.ReactNode = node.text

          if (node.bold) {
            text = <strong>{text}</strong>
          }
          if (node.italic) {
            text = <em>{text}</em>
          }
          if (node.underline) {
            text = <u>{text}</u>
          }
          if (node.strikethrough) {
            text = <s>{text}</s>
          }
          if (node.code) {
            text = <code className="bg-slate-100 px-1 rounded text-sm">{text}</code>
          }

          return (
            <span key={key} style={node.style || {}}>
              {text}
            </span>
          )

        case "root":
          return node.children?.map(renderNode)

        default:
          // Fallback for unknown nodes
          if (node.children) {
            return (
              <div key={key}>
                {node.children.map(renderNode)}
              </div>
            )
          }
          return null
      }
    }

    return renderNode(editorState.root as LexicalNode)
  }, [editorState])

  return <div className="prose prose-sm max-w-none">{renderedContent}</div>
}