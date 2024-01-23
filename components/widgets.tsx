import React from 'react'
import ReactCodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import beautify from 'json-beautify-fix'

const JsonEditorWidget = (props) => {
  const placeholder = beautify(JSON.parse(props.placeholder), null, 2)

  return (
    <ReactCodeMirror
      value={props.value}
      extensions={[json()]}
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
      style={{ border: 'none', height: '100%' }}
    />
  )
}

export default {
  jsoneditor: JsonEditorWidget,
}
