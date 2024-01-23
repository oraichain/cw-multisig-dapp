import keys from 'components/ProposalForms/keys'

export default class FormFactory {
  static createForm(value) {
    return { ...new value.className(value.key) }
  }

  static Keys = keys
}
