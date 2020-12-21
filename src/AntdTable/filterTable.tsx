import React, {
  forwardRef,
  useRef,
  useMemo,
  useImperativeHandle,
  useCallback,
} from "react";
import { isObjectLike } from "lodash";
import {  Select, Button, Modal } from "antd";
import { CONDITIONS_CATEGORYS } from "./conditions";
import editorComponents, { editorComponentConfigs } from "./editorComponents";
import GridTable from "./table";
import conditions from "./conditions";
import { extend, memoize } from "lodash";
import styles from "./index.module.less";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {FilterTableProps} from './interface'
const { Option } = Select;

const FilterTable = forwardRef(function FilterTable(props: FilterTableProps, ref) {
  let {
    filters,
    columns,
    visible,
    onOk,
    onCancel,
    onRemove,
    onFieldChange,
    onAdd,
    filterModalProps,
    filterTableProps,
  } = props;

  let filterStorage = useRef({
    fieldInfo: {},
  });
  let fields = useMemo(() => {
    return [
      {
        value: "-1",
        text: "请选择字段",
        type: "text",
      },
    ].concat(
      columns
        .filter((c:any) => c.filterable)
        .map((c:any) => {
          filterStorage.current.fieldInfo[c.filterable.name] = c;
          return {
            value: c.filterable.name,
            text: c.title || c.filterable.name,
            type: c.filterable.type,
          };
        })
    );
  }, [columns]);

  const getFieldOptions = (name) => {
    return filterStorage.current.fieldInfo[name];
  };
  const onOkHanlder = () => {
    validateFields((data) => {
      onOk && onOk(data);
    });
  };
  const onCancelHandler = () => {
    onCancel && onCancel();
  };
  const onAddHandler = () => {
    onAdd && onAdd();
  };
  const filterColumns = [
    {
      title: "字段名",
      dataIndex: "fieldName",
      width: 120,
      editable: {
        render(wrapComponent, { record }) {
          return wrapComponent(
            {
              rules: [
                {
                  message: "请选择字段",
                  required: true,
                  transform(v) {
                    return v == "-1" ? "" : v;
                  },
                },
              ],
            },
            <Select
              style={{ width: 120 }}
              onChange={(field) => {
                let item = fields.find((d) => d.value == field);
                let realName = gridTableRef.current.getFormRealFieldName(
                  record,
                  "value"
                );
                gridTableRef.current.form.resetFields([realName]);
                onFieldChange(item, record);
              }}
            >
              {fields.map((d) => (
                <Option key={d.value} value={d.value}>{d.text}</Option>
              ))}
            </Select>
          );
        },
      },
    },
    {
      title: "条件",
      width: 110,
      dataIndex: "condition",
      editable: {
        render(wrapComponent, { record }) {
          let currentCategory =
            CONDITIONS_CATEGORYS[record.type] || CONDITIONS_CATEGORYS.text;
          return wrapComponent(
            {
              rules: [
                {
                  required: true,
                  type: "number",
                  message: "请选择条件",
                  min: 0,
                },
              ],
            },
            <Select style={{ width: 110 }}>
              {conditions
                .filter((d) => {
                  // return d.value & currentCategory;
                  return currentCategory.includes(d.value);
                })
                .map((d) => (
                  <Select.Option value={d.value} key={d.value}>
                    {d.text}
                  </Select.Option>
                ))}
            </Select>
          );
        },
      },
    },
    {
      title: "筛选内容",
      dataIndex: "value",
      width: 200,
      editable: {
        transform(value, name, type, row) {
          let fieldInfo = getFieldOptions(row.fieldName);
          let transform =
            (fieldInfo && fieldInfo.filterable.transform) ||
            (editorComponentConfigs[type] &&
              editorComponentConfigs[type].transform);
          if (transform) {
            value = transform(value, name, type);
          }
          return value;
        },
        render(wrapComponent, props) {
          let fieldInfo = getFieldOptions(props.record.fieldName);
          if (fieldInfo && fieldInfo.filterable.editable) {
            props = extend({}, props, {
              editable: extend(
                {},
                props.editable,
                fieldInfo.filterable.editable
              ),
            });
            return editorComponents[props.record.type]((options, component) => {
              return wrapComponent(
                extend(options, props.editable.options),
                component,
                {
                  ...props,
                  editable: fieldInfo.filterable.editable,
                }
              );
            }, props);
          } else {
            return editorComponents[props.record.type](wrapComponent, props);
          }
        },
      },
    },
    {
      title: "",
      width: 30,
      key: "operation",
      render(c, r, index) {
        return (
          // <Icon
          //   onClick={() => {
          //     onRemove(r, index);
          //   }}
          //   type="delete"
          //   style={{ cursor: "pointer" }}
          // />
          <DeleteOutlined style={{ cursor: "pointer" }} onClick={() => {
            onRemove(r, index);
          }}/>
        );
      },
    },
  ];
  const gridTableRef = useRef<any>();
  const validateFields = (callback) => {
    let current = gridTableRef.current;
    current.validateFields((result) => {
      callback(
        result.map((d) => ({
          ...d,
          available: true,
        }))
      );
    }, "type");
  };

  useImperativeHandle(ref, () => {
    return {
      validateFields: validateFields,
      resetFields(fields) {
        gridTableRef.current.form.resetFields(fields);
      },
      getFormRealFieldName(row, name) {
        return gridTableRef.current.getFormRealFieldName(row, name);
      },
    };
  });
  const onHeaderRow = () => {
    return {
      className: styles.filterTableHeaderRow,
    };
  };
  return (
    <Modal
      width={620}
      title="框架对象筛选"
      cancelText="取消"
      okText="确定"
      {...filterModalProps}
      onCancel={onCancelHandler}
      onOk={onOkHanlder}
      visible={visible}
      wrapClassName={styles.filterTable}
    >
      <GridTable
        tableLayout="fixed"
        style={{ width: "%100" }}
        {...filterTableProps}
        onHeaderRow={onHeaderRow}
        wrappedComponentRef={gridTableRef}
        pagination={false}
        editorRowKey="*"
        rowKey={(d) => d.id}
        columns={filterColumns}
        dataSource={filters}
        footer={() => (
          // <Button
          //   type="primary"
          //   onClick={onAddHandler}
          //   shape="circle"
          //   icon="plus"
          //   size="small"
          // />
          <PlusOutlined type="primary"  shape="circle" onClick={onAddHandler}/>
        )}
        
      />
    </Modal>
  );
});
export default FilterTable;
