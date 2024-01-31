import React from 'react'
import ReactCodeMirror from '@uiw/react-codemirror'
import { EditorView } from '@codemirror/view'
import { json } from '@codemirror/lang-json'
import beautify from 'json-beautify-fix'

const JsonEditorWidget = (props) => {
  const placeholder = beautify(JSON.parse(props.placeholder), null, 2)

  return (
    <ReactCodeMirror
      className="max-w-lg"
      value={props.value}
      extensions={[json(), EditorView.lineWrapping]}
      editable
      theme="dark"
      onChange={(val) => {
        try {
          const obj = JSON.parse(val)
          props.onChange(beautify(obj, null, 2))
        } catch {
          props.onChange(val)
        }
      }}
      placeholder={placeholder}
      style={{ height: '100%' }}
    />
  )
}

export default {
  jsoneditor: JsonEditorWidget,
}
