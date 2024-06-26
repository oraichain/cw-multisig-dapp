import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  UiSchema,
} from '@rjsf/utils';

export default class GenericForm<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
> {
  public readonly props: { uiSchema: UiSchema<T, S, F>; schema: RJSFSchema };
  public title: string;
  public constructor(readonly key: string) {
    this.props = {
      uiSchema: {
        title: {
          'ui:autofocus': true,
          'ui:placeholder': 'Proposal title',
        },
        description: {
          'ui:placeholder': 'Proposal description',
          'ui:widget': 'textarea',
        },
      },
      schema: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
            title: 'Title',
          },
          description: {
            type: 'string',
            title: 'Description',
          },
        },
      },
    };
  }

  protected init(
    title = '',
    uiSchema: UiSchema<T, S, F>,
    schema: StrictRJSFSchema
  ) {
    this.title = title;
    Object.assign(this.props.uiSchema, uiSchema);
    if (Array.isArray(schema.required)) {
      this.props.schema.required = [
        ...new Set(this.props.schema.required.concat(schema.required)),
      ];
    }
    if (schema.properties) {
      Object.assign(this.props.schema.properties, schema.properties);
    }
  }

  protected processMessages(data: any) {
    return data;
  }

  public processData({ title, description = '', ...data }) {
    try {
      const msgs = this.processMessages(data);
      return { title, description, msgs };
    } catch (ex) {
      alert(ex.toString());
    }
  }
}
