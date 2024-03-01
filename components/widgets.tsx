import React from 'react'
import ReactCodeMirror from '@uiw/react-codemirror'
import { linter } from '@codemirror/lint'
import { EditorView } from '@codemirror/view'
import { json, jsonParseLinter } from '@codemirror/lang-json'

const JsonEditorWidget = (props) => {
  const { onChange, value, readonly, style, required } = props

  let placeholder = {}
  try {
    placeholder = JSON.parse(props.placeholder)
  } catch {}

  return (
    <ReactCodeMirror
      className="max-w-lg"
      extensions={[
        json(),
        required && linter(jsonParseLinter()),
        EditorView.lineWrapping,
      ].filter(Boolean)}
      editable
      theme="dark"
      style={{ height: '100%', width: '100%', ...style }}
      value={value}
      placeholder={JSON.stringify(placeholder, null, 2)}
      readOnly={readonly}
      onChange={onChange}
    />
  )
}

export default {
  jsoneditor: JsonEditorWidget,
}
