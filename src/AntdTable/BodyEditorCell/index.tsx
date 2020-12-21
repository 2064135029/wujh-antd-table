import React, { useContext, useMemo } from "react";
import GridTableContext from "../context";
import { isBoolean, extend, isFunction, result, isObject, get, has } from "lodash";
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
// import { FormInstance } from 'antd/lib/form';
import editorComponents from "../editorComponents";

const  BodyEditorCell = (props)=> {
  let {
    editable = {},
    dataIndex,
    editing,
    rowKey,
    record,
    children,
    fieldName,
    ...restProps
  } = props;
  let {
    form,
    getFieldName,
    getFormFieldValue
  } = useContext(GridTableContext);
  // let { getFieldDecorator } = form;
  let commonColumnOps = {
    editable,
    dataIndex,
    fieldName,
    record,
    rowKey,
    form,
    getFormFieldValue,
    getFieldName,
    editorComponents
  };
  const wrapComponent = (options = {}, component,columnOps=commonColumnOps) => {
    let {editable,record,dataIndex,form}=columnOps;
  
    // let { getFieldDecorator } = form;
  
    let fieldOps = {};
    if (has(editable, 'options')) {
      fieldOps=isFunction(editable.options) ? editable.options(columnOps) : get(editable, 'options', {});
    }
    console.log(form);
    
    // console.log(getFieldDecorator);
  
    // return extend({
    //   name: fieldName,
    //   initialValue: record[dataIndex]
    // }, options, fieldOps);
    // // (has(editable, 'props') ? React.cloneElement(component, isFunction(editable.props) ? editable.props(columnOps) : editable.props) : component);
  };
  // 渲染编辑单元格
  const renderEditCell = () => {
    let type = editable.type,
      renderComponent,
      editableComponent;
    if (isFunction(editable.render)) {
      renderComponent = editable.render;
    } else {
      renderComponent = editorComponents[type] || editorComponents.text;
    }
    editableComponent = renderComponent({
      name: fieldName,
      initialValue: ''
    });  // renderComponent(wrapComponent, { ...commonColumnOps });
    return editableComponent;
    // return <Form.Item  style={{ margin: 0 }}>{editableComponent}</Form.Item>;
  };

  return <td {...restProps}>{editing ? renderEditCell() : children}</td>;
}

export default BodyEditorCell; 