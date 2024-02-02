import React from 'react'
import ReactCodeMirror from '@uiw/react-codemirror'
import { linter } from '@codemirror/lint'
import { EditorView } from '@codemirror/view'
import beautify from 'json-beautify-fix'
import { json, jsonParseLinter } from '@codemirror/lang-json'

const JsonEditorWidget = (props) => {
  const { onChange, value, placeholder, readonly } = props
  return (
    <ReactCodeMirror
      className="max-w-lg"
      extensions={[json(), linter(jsonParseLinter()), EditorView.lineWrapping]}
      editable
      theme="dark"
      style={{ height: '100%' }}
      value={value}
      placeholder={beautify(JSON.parse(placeholder), null, 2)}
      readOnly={readonly}
      onChange={onChange}
    />
  )
}

export default {
  jsoneditor: JsonEditorWidget,
}
