import { MsgFundCommunityPool } from 'cosmjs-types/cosmos/distribution/v1beta1/tx'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'

const defaultColors = {
  keyColor: 'var(--primary-color)',
  numberColor: 'lightskyblue',
  stringColor: 'lightcoral',
  trueColor: 'lightseagreen',
  falseColor: '#f66578',
  nullColor: 'cornflowerblue',
}

const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

function escapeHtml(html) {
  return String(html).replace(/[&<>"'`=]/g, function (s) {
    return entityMap[s]
  })
}

function parseStargateMsg(msg) {
  switch (msg.type_url) {
    case '/cosmos.distribution.v1beta1.MsgFundCommunityPool':
      return MsgFundCommunityPool.decode(Buffer.from(msg.value, 'base64'))
    case '/cosmos.bank.v1beta1.MsgSend':
      return MsgSend.decode(Buffer.from(msg.value, 'base64'))
    default:
      return msg
  }
}

export default function ({ data, className, colorOptions = {}, ...props }) {
  let json: string
  const valueType = typeof data
  if (valueType !== 'string') {
    json = JSON.stringify(data, null, 2) || valueType
  } else {
    json = data
  }
  const jsonObj = JSON.parse(json)
  if (
    jsonObj &&
    jsonObj.length &&
    jsonObj.length > 0 &&
    jsonObj.find((msg: any) => msg.stargate)
  ) {
    const stargateMsgs = jsonObj.map((message: any) => ({
      stargate: {
        ...message.stargate,
        value: parseStargateMsg(message.stargate),
      },
    }))
    json = JSON.stringify(stargateMsgs, null, 2)
  }
  let colors = Object.assign({}, defaultColors, colorOptions)
  json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
  json = json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+]?\d+)?)/g,
    (match) => {
      let color = colors.numberColor
      let style = ''
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          color = colors.keyColor
        } else {
          color = colors.stringColor
          match = '"' + escapeHtml(match.substr(1, match.length - 2)) + '"'
          style = 'word-wrap:break-word;white-space:pre-wrap;'
        }
      } else {
        color = /true/.test(match)
          ? colors.trueColor
          : /false/.test(match)
          ? colors.falseColor
          : /null/.test(match)
          ? colors.nullColor
          : color
      }
      return `<span style="${style}color:${color}">${match}</span>`
    }
  )

  return (
    <pre
      className={className}
      dangerouslySetInnerHTML={{ __html: json }}
      {...props}
    />
  )
}
