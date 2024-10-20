import React, { useContext } from 'react';
import { Form, FormInstance } from 'antd';

const FormItem = Form.Item;

const EditableContext = React.createContext<FormInstance<any>>(null);

const EditableFormRow = (props: any) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...(props as any)} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = (props: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const form = useContext(EditableContext);
  const { centered, required, editing, editor, dataIndex, title, record, editorValuePropName, ...restProps } = props;

  return (
    <td
      {...restProps}
      className={editing ? `ant-table-cell-editing ${restProps.className}` : restProps.className}
      style={{ textAlign: centered ? 'center' : '', ...restProps.style }}
    >
      {editing && editor ? (
        <FormItem
          name={dataIndex}
          initialValue={record[dataIndex]}
          valuePropName={editorValuePropName || 'value'}
          rules={[
            {
              required: required || false,
              message: `Field '${title}' is required!`
            }
          ]}
          style={{ margin: 0 }}
        >
          {editor(record)}
        </FormItem>
      ) : (
        restProps.children
      )}
    </td>
  );
};

export { EditableFormRow, EditableCell, EditableContext };
