export default class GenericForm {
  constructor(key) {
    this.key = key;
    this.title = '';
    this.schema = {};
    this.processData = () => {};
  }
}
