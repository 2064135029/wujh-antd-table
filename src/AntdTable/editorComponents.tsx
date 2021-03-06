import React from 'react';
import { Input, DatePicker, InputNumber, Checkbox, Select, TimePicker } from 'antd';
import { isBoolean, identity } from 'lodash';
import moment, { isMoment } from 'moment';
import { Form } from 'antd';
// import { text } from 'express';

export const editorComponentConfigs = {
  list: {
    initialValue: '',
    transform: identity,
  },
  text: {
    initialValue: '',
    transform: identity,
  },
  number: {
    initialValue: '',
    transform: identity,
  },
  date: {
    initialValue: null,
    transform(value) {
      if (isMoment(value)) {
        return value.format('YYYY-MM-DD');
      }
      return value;
    },
  },
  datetime: {
    initialValue: null,
    transform(value) {
      if (isMoment(value)) {
        return value.format('YYYY-MM-DD HH:mm:ss');
      }
      return value;
    },
  },
  time: {
    initialValue: null,
    transform(value) {
      if (isMoment(value)) {
        return value.format('HH:mm:ss');
      }
      return value;
    },
  },
  bool: {
    initialValue: false,
    transform: identity,
  },
  boolSelect: {
    initialValue: 0,
    transform: identity,
  },
};
// 内置编辑组件
const editorComponents = {
  list(opt, { editable }) {
    let valueField = editable.valueField || 'key';
    let labelField = editable.labelField || 'label';
    return <Form.Item  {...opt}>
      <Select
        allowClear
        //  getPopupContainer={triggerNode => triggerNode.parentNode}
        key="list"
        style={{ width: '100%' }}
      >
        {editable.data.map(d => (
          <Select.Option key={d.key} value={d[valueField]}>
            {d[labelField]}
          </Select.Option>
        ))}
      </Select>,
   </Form.Item>
  },
  text(opt) {
    return <Form.Item {...opt}><Input key="text" style={{ width: '100%' }} /></Form.Item>
  },
  number(opt) {
    return <Form.Item  {...opt}><InputNumber key="number" style={{ width: '100%' }} /></Form.Item>
  },
  date(opt) {
    // return wrapComponent(
    //   {
    //     getValueProps(value) {
    //       if (value && !isMoment(value)) {
    //         value = moment(value);
    //       }
    //       if (value == '') {
    //         value = null;
    //       }
    //       return {
    //         value: value,
    //       };
    //     },
    //     // normalize(value) {
    //     //   if (value && !isMoment(value)) {
    //     //     return moment(value);
    //     //   }
    //     //   return value;
    //     // }
    //   },
   return <Form.Item  {...opt}> <DatePicker key="date" style={{ width: '100%' }} /></Form.Item>
    // );
  },
  datetime(opt) {
    // return wrapComponent(
    //   {
    //     getValueProps(value) {
    //       if (value && !isMoment(value)) {
    //         value = moment(value);
    //       }
    //       if (value == '') {
    //         value = null;
    //       }
    //       return {
    //         value: value,
    //       };
    //     },
    //     // normalize(value) {
    //     //   if (value && !isMoment(value)) {
    //     //     return moment(value);
    //     //   }
    //     //   return value;
    //     // }
    //   },
     return  <Form.Item  {...opt}>  <DatePicker showTime key="datetime" style={{ width: '100%' }} /></Form.Item>
    // );
  },
  time(opt) {
    // return wrapComponent(
    //   {
    //     getValueProps(value) {
    //       if (value && !isMoment(value)) {
    //         value = moment(value, 'HH:mm:ss');
    //       }
    //       if (value == '') {
    //         value = null;
    //       }
    //       return {
    //         value: value,
    //       };
    //     },
        // normalize(value) {
        //   if (value && !isMoment(value)) {
        //     return moment(value,'HH:mm:ss');
        //   }
        //   return value;
        // }
      // },
     return <Form.Item  {...opt}><TimePicker style={{ width: '100%' }}></TimePicker></Form.Item>
    // );
  },
  bool(opt, props) {
    // return wrapComponent(
    //   {
    //     valuePropName: 'checked',
    //     normalize(value) {
    //       if (isBoolean(value)) {
    //         return value;
    //       }
    //       return false;
    //     },
    //   },
    return  <Form.Item  {...opt}>  <Checkbox key="bool" /></Form.Item>
    // );
  },
  boolSelect(opt, { editable }) {
    // return wrapComponent(
    //   {},
   return <Form.Item  {...opt}>   <Select
        // getPopupContainer={triggerNode => triggerNode.parentNode}
        key="boolSelect"
        style={{ width: '100%' }}
      >
        <Select.Option key={0} value={0}>
          否
        </Select.Option>
        <Select.Option key={1} value={1}>
          是
        </Select.Option>
    </Select>,
    </Form.Item>
    // );
  },
};
export default editorComponents;

export const editorComplieWithTypeConf = {
  0: 'text',
  1: 'text',
  2: 'date',
  3: 'number',
  4: 'boolSelect',
  5: 'text',
  6: 'text',
  7: 'number',
  8: 'text',
  99: 'text',
};
