import React, {
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  useImperativeHandle,
  useState,
  useMemo,
} from "react";
import ReactDOM, { createPortal } from "react-dom";
import classNames from "classnames";
// import { Form } from '@ant-design/compatible';
// import '@ant-design/compatible/assets/index.css';
import { Table, Modal, Tooltip, Form} from "antd";
import {
  isUndefined,
  find,
  has,
  uniqueId,
  isArray,
  some,
  merge,
  findIndex,
  isObjectLike,
  isBoolean,
  extend,
  cond,
  constant,
  partial,
  endsWith,
  eq,
} from "lodash";
import GridTableContext from "./context";
import HeadFilterCell from "./HeadFilterCell";
import BodyEditorCell from "./BodyEditorCell";
import FilterTable from "./filterTable";
import { editorComponentConfigs } from "./editorComponents";
import {
  getFieldName,
  GridPagination,
  getOffset,
  getPosition as getElelementPosition,
  closest,
} from "./util";
import * as conditions from "./conditions";
import styles from "./index.module.less";
import { FormInstance } from 'antd/lib/form';

import { GridTableProps, TablePagination } from "./interface";

function OverlayLayer(props) {
  let {
    visible,
    width,
    onCancel,
    height,
    render: renderChildren,
    record,
  } = props;
  const onCloseHandle = () => {
    if (onCancel) {
      onCancel();
    }
  };
  const renderChildrenOverLayer = () => {
    if (!record) {
      return;
    }
    return renderChildren(record);
  };
  return (
    <Modal
      footer={null}
      onCancel={onCloseHandle}
      width={width}
      visible={visible}
    >
      {renderChildrenOverLayer()}
    </Modal>
  );
}
function OverlayLayer2(props) {
  let {
    style = {},
    visible,
    onCancel,
    width,
    height,
    className,
    record,
    render: renderChildren,
    event,
    getPosition,
    container: rootContainer,
    closeFilterHandler,
    ...restProps
  } = props;

  let contentStyle = {};
  let [elPsition, setElPosition] = useState({
    left: 0,
    top: 0,
  });
  let wrapper = useRef();
  let container = useRef<any>();

  useEffect(() => {
    const hideModel = (e) => {
      if (closeFilterHandler(e) === false) {
        return;
      }
      onCancel && onCancel();
    };
    document.addEventListener("click", hideModel, false);
    return function () {
      document.removeEventListener("click", hideModel, false);
    };
  }, []);

  let newStyle = useMemo(() => {
    return extend(
      {
        width: width,
        zIndex: 1000,
        display: visible === true ? "block" : "none",
      },
      style,
      elPsition
    );
  }, [visible, style, elPsition]);

  const renderChildrenOverLayer = () => {
    if (!record) {
      return;
    }
    return renderChildren(record);
  };
  useLayoutEffect(() => {
    if (!container.current) {
      return;
    }
    // container.current.style.display="block";
    let position = getPosition(event, container.current);
    let ovOffset = getOffset(container.current);
    let ovposition = getElelementPosition(container.current);
    let clientHeight = container.current.clientHeight;
    if (clientHeight + position.top > window.innerHeight) {
      position.top =
        window.innerHeight - Math.min(clientHeight, window.innerHeight);
    }
    position.top = position.top - ovOffset.top + ovposition.top;
    position.left = position.left - ovOffset.left + ovposition.left;
    setElPosition({
      left: position.left,
      top: position.top,
    });
  }, [renderChildrenOverLayer]);

  if (!rootContainer) {
    return <div></div>;
  }
  let contaienrCls = classNames(styles.overlayLayer, className);
  return createPortal(
    // <div ref={wrapper} className={styles.overlayLayerWrapper}>
    <div ref={container} style={newStyle} className={contaienrCls}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (e.nativeEvent.stopImmediatePropagation) {
            e.nativeEvent.stopImmediatePropagation();
          }
        }}
        className={styles.overlayLayerContent}
      >
        {renderChildrenOverLayer()}
      </div>
    </div>,
    // </div>
    rootContainer
  );
}

// function OverlayLayer2(props) {
//   let { visible, target, onCancel } = props;
//   let top = 0;
//   if (target) {
//     let offset = getOffset(target);
//     top = offset.top + offset.height + 5;
//   }
//   return (
//     <Modal
//       wrapClassName="overlay"
//       style={{
//         top: top
//       }}
//       width="auto"
//       mask={false}
//       visible={visible}
//       onCancel={() => {
//         onCancel();
//       }}
//       footer={null}
//       maskClosable={true}
//       closable={false}
//     >
//       {props.children}
//     </Modal>
//   );
// }

let GridTable = React.forwardRef<HTMLDivElement, GridTableProps>((props: GridTableProps, ref)=> {
  let {
    columns,
    editorRowKey,
    components,
    rowClassName,
    rowKey,
    dataSource,
    pagination,
    onChange,
    filterModalProps,
    filterTableProps,
    transformFilterData,
    overlayLayer,
    onRow,
    ...restProps
  } = props;
  let contextValue = useRef(null);
  let [filters, setFilters] = useState([]); //过滤列表
  let [currentFilterKey, setCurrentFilterKey] = useState(""); //当前触发的过滤列
  let [filterModalVisible, setFilterModalVisible] = useState(false); //过滤弹出窗显示状态
  let [currentEditorRowKey, setEditorRowKey] = useState([]);
  let curentContainerRef = useRef(null);
/**table */
  
  // console.log(columns);
  const [form] = Form.useForm();
  
//   const formRef = React.createRef<FormInstance>();
  
// console.log(formRef);
  const getRowKey: any = useMemo(() => {
    if (typeof rowKey === "function") {
      return rowKey;
    } else if (typeof rowKey === "string") {
      return (recore, index) => {
        return recore[rowKey];
      };
    } else {
      console.warn("请设置rowKey");
      return '';
    }
  }, [rowKey]);

  const hasPagination = useMemo(() => {
    return !!pagination && pagination.hideOnSinglePage;
  }, [pagination]);
  // let paginationNotBool=isObjectLike(pagination);
  // if(paginationNotBool&&dataSource&&pagination.current==1&&dataSource.length<=0){
  //   pagination.total=0;
  // }else if(paginationNotBool&&dataSource&&dataSource.length<pagination.pageSize){
  //   pagination.total=pagination.pageSize*pagination.current;
  // }else if(paginationNotBool&&dataSource&&dataSource.length>=pagination.pageSize){
  //   pagination.total=Number.MAX_SAFE_INTEGER;
  // }
  const hasGridPagination = useMemo(() => {
    return pagination instanceof GridPagination;
  }, [pagination]);
  const getDefaultPagination = useCallback((propPagination) => {
    const pagination = typeof propPagination === "object" ? propPagination : {};
    let current;
    if ("current" in pagination) {
      current = pagination.current;
    } else if ("defaultCurrent" in pagination) {
      current = pagination.defaultCurrent;
    }
    let pageSize;
    if ("pageSize" in pagination) {
      pageSize = pagination.pageSize;
    } else if ("defaultPageSize" in pagination) {
      pageSize = pagination.defaultPageSize;
    }
    return hasPagination
      ? {
          current: current || 1,
          pageSize: pageSize || 10,
        }
      : {};
  }, []);

  const onChangeHandler = (pagination?: TablePagination, _filters?: any, sorter?:any, extra?:any) => {
    if (isCanFilter) {
      let table = contextValue.current.table;
      if (!pagination) {
        pagination = table.pagination;
      }
      if (!sorter) {
        sorter = table.sorter;
      }
      if (!extra) {
        extra = table.extra;
      }

      // table.pagination = pagination;
      table.sorter = sorter;
      table.extra = extra;
      _filters = [...filters];
      if (typeof transformFilterData === "function") {
        _filters = transformFilterData(_filters);
      }
    }
    if (hasGridPagination) {
      pagination.read({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ..._filters,
      });
    }
    if (onChange) {
      onChange(pagination, _filters, sorter, extra);
    }
  };
  const getFormFieldValue = (r, name, editable) => {
    if (!editable) {
      editable = find(currentEditorFileds, { name: name }) || {
        type: "string",
      };
    }
    let rowKey =
      typeof r === "string" || typeof r === "number" ? r : getRowKey(r);
    let { transform, type } = editable;
    let fieldName = getFieldName(rowKey, name);
    let value = form.getFieldValue(fieldName);
    transform =
      transform ||
      (editorComponentConfigs[type] && editorComponentConfigs[type].transform);
    if (transform) {
      value = transform(value, name, type, r);
    }
    return value;
  };
  const getFormRowData = (r: Object, custType?: any) => {
    let rowKey = getRowKey(r);
    return currentEditorFileds.reduce((acc, { name, editable }) => {
      let { transform, type } = editable;
      let value = getFormFieldValue(rowKey, name, {
        transform,
        type: custType || type,
      });
      acc[name] = value;
      return acc;
    }, {});
  };
  const getFormAllData = () => {
    return dataSource.map(getFormRowData);
  };
  const getFormRealFieldName = (r, name) => {
    let rowKey = getRowKey(r);
    return getFieldName(rowKey, name);
  };
  const getRowFormRealFields = (r) => {
    return currentEditorFileds.map((d) => {
      return {
        realName: getFormRealFieldName(r, d.name),
        ...d,
      };
    });
  };
  const removeEditorRowKey = (key) => {
    let index = currentEditorRowKey.indexOf(key);
    if (index !== -1) {
      let newRowKeys = [...currentEditorRowKey];
      newRowKeys.splice(index, 1);
      setEditorRowKey(newRowKeys);
    }
  };
  const addEditorRowKey = (key, isOnly = false) => {
    let index = currentEditorRowKey.indexOf(key);
    if (index === -1) {
      if (isOnly) {
        setEditorRowKey([key]);
        return;
      }
      setEditorRowKey([...currentEditorRowKey, key]);
    }
  };

  /**table */
  /**filter 操作* */
  const filterTableRef = useRef();

  const onFilterClick = (filterable) => {
    newAddFilter(filterable.name, filterable.name, filterable.type);
  };
  const onAddFilterRow = () => {
    let newFilters = [...filters];
    newFilters.push(createFilterItem(uniqueId("fieldName"), "", "text"));
    setFilters(newFilters);
  };
  const createFilterItem = (id, fieldName, type) => {
    let config = editorComponentConfigs[type] || { initialValue: "" };
    return {
      id: id,
      fieldName: fieldName,
      condition: 1,
      type: type,
      value: config.initialValue,
      available: false,
    };
  };
  const newAddFilter = (key, fieldName, type) => {
    let newFilters = [...filters];
    let index = findIndex(newFilters, { id: key });
    if (index === -1) {
      newFilters.push(createFilterItem(key, fieldName, type));
      setFilters(newFilters);
    }
    setFilterModalVisible(true);
    setCurrentFilterKey(key);
  };
  const onCloseFilterModel = () => {
    filters = filters.filter((d) => d.available);
    setFilters(filters);
    setFilterModalVisible(false);
    setCurrentFilterKey("");
    if (contextValue.current.filterChanged.length) {
      contextValue.current.filterChanged.length = 0;
      onChangeHandler();
    }
  };
  const onConfirmFilter = (data) => {
    filters = [...data];
    setFilters(filters);
    setFilterModalVisible(false);
    setCurrentFilterKey("");
    onChangeHandler();
  };

  const onRemoveFilter = (item, index) => {
    filters.splice(index, 1);
    if (item.available) {
      contextValue.current.filterChanged.push(item);
    }
    setFilters([...filters]);
  };

  const onFieldChange = (item, row) => {
    let newData = [...filters];
    let index = findIndex(newData, { id: row.id });
    if (index !== -1) {
      newData.splice(index, 1, createFilterItem(row.id, item.value, item.type));
      setFilters(newData);
    }
  };
  const isFiltered = useCallback(
    (key) => {
      return filters.some((d) => d.available && d.fieldName === key);
    },
    [filters]
  );
  const isFilterOpened = useCallback(
    (rowKey) => {
      return currentFilterKey === rowKey;
    },
    [currentFilterKey]
  );
  useEffect(() => {
    let defaultFilters = [];
    memoColumns.forEach((d: any) => {
      if (d.filterable && d.filterable.defaultFilter) {
        let { name, type } = d.filterable;
        let item = d.filterable.defaultFilter;
        let filterItem = createFilterItem(name, name, type);
        filterItem.condition = item[0];
        filterItem.value = item[1];
        filterItem.available = true;
        defaultFilters.push(filterItem);
      }
    });
    setFilters(defaultFilters);
  }, []);
  /**filter 操作***end */
  // let propEditorRowKey = useRef(editorRowKey);
  // useEffect(() => {
  //   propEditorRowKey.current = editorRowKey;
  // });
  // if (
  //   editorRowKey !== propEditorRowKey.current &&
  //   editorRowKey !== currentEditorRowKey
  // ) {
  //   setEditorRowKey(editorRowKey);
  // }
  const isEditing = useCallback(
    (row) => {
      let rowKey = getRowKey(row);
      let rowKeys: any = !editorRowKey ? currentEditorRowKey : editorRowKey;
      if (typeof rowKeys === "function") {
        return rowKeys(row) === true;
      } else if (isArray(rowKeys)) {
        return rowKeys.indexOf(rowKey) !== -1;
      }
      return rowKeys === "*" || rowKeys === rowKey;
    },
    [currentEditorRowKey, editorRowKey, getRowKey]
  );

  const validateFields = (callback, typeField) => {
    form.validateFields().then(values => {
      let newData = dataSource.map((item) => {
        let row = getFormRowData(item, typeField ? item[typeField] : null);
        return {
          ...item,
          ...row,
        };
      });
      callback(newData);
    });
  };
  const validateRowFields = (row, callback) => {
    let fields = getRowFormRealFields(row);
    form.validateFields(fields.map(d => d.realName)).then(values => { 
      const rowData = getFormRowData(row);
      callback({
        ...row,
        ...rowData,
        ...values
      });
    });
  };

  if (!contextValue.current) {
    contextValue.current = {
      filterChanged: [],
      table: {
        pagination: getDefaultPagination(pagination),
      },
      columnsUniqueId: {},
      form: form,
    };
  }
  contextValue.current.getRowKey = getRowKey;
  contextValue.current.removeEditorRowKey = removeEditorRowKey;
  contextValue.current.addEditorRowKey = addEditorRowKey;
  contextValue.current.setEditorRowKey = setEditorRowKey;
  contextValue.current.isEditing = isEditing;
  contextValue.current.validateFields = validateFields;
  contextValue.current.validateRowFields = validateRowFields;
  contextValue.current.getFormFieldValue = getFormFieldValue;
  contextValue.current.getFormRowData = getFormRowData;
  contextValue.current.getFormAllData = getFormAllData;
  contextValue.current.getFormRealFieldName = getFormRealFieldName;
  contextValue.current.getFieldName = getFieldName;
  contextValue.current.onFilterClick = onFilterClick;
  contextValue.current.setFilterModalVisible = (visible) => {
    setFilterModalVisible(visible);
  };
  useImperativeHandle(ref, () => contextValue.current, [contextValue]);

  // const getColumnUniqueId = (name) => {
  //   if (!contextValue.columnsUniqueId[name]) {
  //     contextValue.columnsUniqueId[name] = uniqueId(name);
  //   }
  //   return contextValue.columnsUniqueId[name];
  // };
  const isCanEditor = useMemo(() => {
    return some(columns, (d) => !!d.editable);
  }, [columns]);
  const isCanFilter = useMemo(() => {
    return some(columns, (d) => !!d.filterable);
  }, [columns]);
  let tableComponents = useMemo(() => {
    let result: any = {};
    if (isCanEditor) {
      result.body = {
        cell: BodyEditorCell,
      };
    }
    if (isCanFilter) {
      result.header = {
        cell: HeadFilterCell,
      };
    }
    return merge(result, components || {});
  }, [isCanFilter, isCanEditor, components]);

  let memoColumns = useMemo(() => {
    return columns.map((c: any) => {
      let editable = c.editable,
        filterable = c.filterable;
      if (!editable && !filterable) {
        return c;
      }
      let result = { ...c };
      if (editable) {
        if (isBoolean(editable)) {
          editable = {};
        }
        editable = extend(
          {
            type: "text",
            options: {},
          },
          editable
        );
        let oldOnCell = result.onCell;
        result.editable = editable;
        result.onCell = (record, rowIndex) => {
          let rowKey = getRowKey(record, rowIndex);
          let old = (oldOnCell && oldOnCell(record, rowIndex)) || {};
          let cellProps = {
            ...old,
            editing: isEditing(record),
            record: record,
            rowKey: rowKey,
            editable: editable,
            fieldName: getFieldName(rowKey, c.dataIndex),
            dataIndex: c.dataIndex,
          };
          return cellProps;
        };
      }
      if (filterable) {
        if (isBoolean(filterable)) {
          filterable = {};
        } else if (typeof filterable === "string") {
          filterable = {
            type: filterable,
          };
        }
        filterable = extend(
          { type: "text", defaultFilter: null, name: c.dataIndex },
          filterable
        );

        let oldOnHeaderCell = result.onHeaderCell;
        result.filterable = filterable;
        result.onHeaderCell = (column) => {
          let old = (oldOnHeaderCell && oldOnHeaderCell(column)) || {};
          return {
            ...old,
            dataIndex: c.dataIndex,
            filterable: filterable,
            opened: isFilterOpened(filterable.name),
            filtered: isFiltered(filterable.name),
          };
        };
      }
      return result;
    });
  }, [columns, isFilterOpened, isEditing, isFiltered, getRowKey]);
  const currentEditorFileds = useMemo(() => {
    return memoColumns
      .filter((d) => d.editable)
      .map((d) => {
        return {
          name: d.dataIndex,
          editable: d.editable,
        };
      });
  }, [memoColumns]);

  let rowClassNameFn = (record, index) => {
    let rowCls = rowClassName;
    if (typeof rowClassName === "function") {
      rowCls = rowClassName(record, index);
    }
    let isEdit = isEditing(record);
    return classNames(
      rowCls,
      {
        "disable-open-overlayer": isEdit,
        "xantd-table-row-edting": isEdit,
      },
      styles.editableRow
    );
  };

  let [overlayLayerOps, setOverlayLayer] = useState({
    visible: false,
    record: null,
    container: null,
    event: null,
  });

  let onNewRow = onRow;
  if (overlayLayer) {
    overlayLayer = useMemo(() => {
      return extend(
        {
          width: 500,
          height: "auto",
          closeFilterHandler(e) {
            if (
              (closest(e.target, ".ant-table-row") &&
                curentContainerRef.current.contains(e.target)) ||
              closest(e.target, ".disable-close-overlayer")
            ) {
              return false;
            }
          },
          openFilterHandler(e) {
            if (closest(e.target, ".disable-open-overlayer")) {
              return false;
            }
          },
          getPopupContainer(e) {
            return curentContainerRef.current;
          },
          getPosition(e, ovarlayerEl) {
            let target = e.currentTarget;
            let offset = getOffset(target);
            let left = offset.left;
            let top = offset.top + offset.height;
            // let mtop=top+ovarlayerEl.clientHeight-window.innerHeight;
            // if(mtop>0){
            //   top=top-mtop;
            // }
            return {
              left: left,
              top: top,
            };
          },
        },
        overlayLayer
      );
    }, [overlayLayer]);
    onNewRow = (record) => {
      let oldRow: any = {};
      if (typeof onRow === "function") {
        oldRow = onRow(record);
      }
      return {
        ...oldRow,
        onClick(e) {
          if (isEditing(record)) {
            return;
          }
          if (oldRow.onClick) {
            oldRow.onClick(e, record);
          }
          if (
            overlayLayer.openFilterHandler &&
            overlayLayer.openFilterHandler(e, record) === false
          ) {
            return;
          }
          if (overlayLayer.onClick) {
            overlayLayer.onClick(e, record);
          }
          let container = overlayLayer.getPopupContainer(e);
          setOverlayLayer({
            visible: true,
            record: record,
            container: container,
            event: {
              currentTarget: e.currentTarget,
              target: e.target,
            },
          });
        },
      };
    };
  }
  const onOverlayLayerClose = () => {
    if (overlayLayer.onCancel) {
      overlayLayer.onCancel();
    }
    setOverlayLayer((state) => {
      return {
        ...state,
        record: null,
        visible: false,
      };
    });
  };
  let renderOverlayLayer = () => {
    if (!overlayLayer) {
      return;
    }
    let visible = has(overlayLayer, "visible")
      ? overlayLayer.visible
      : overlayLayerOps.visible;
    let {
      style = {},
      width,
      height,
      render,
      getPosition,
      closeFilterHandler,
    } = overlayLayer;
    let { record, container, event } = overlayLayerOps;
    return (
      <OverlayLayer
        event={event}
        record={record}
        render={render}
        container={container}
        style={style}
        width={width}
        height={height}
        closeFilterHandler={closeFilterHandler}
        onCancel={onOverlayLayerClose}
        getPosition={getPosition}
        visible={visible}
      ></OverlayLayer>
    );
  };

  return (
    <div ref={curentContainerRef} className={styles.gridTableContainer}>
      <Form form={form} component={false}>
      <GridTableContext.Provider value={contextValue.current}>
        <Table
          bordered
          {...restProps}
          onRow={onNewRow}
          pagination={pagination}
          dataSource={dataSource}
          onChange={onChangeHandler}
          rowClassName={rowClassNameFn}
          columns={memoColumns}
          rowKey={getRowKey}
          components={tableComponents}
        />
        {isCanFilter ? (
          <FilterTable
            ref={filterTableRef}
            filterModalProps={filterModalProps}
            filterTableProps={filterTableProps}
            columns={memoColumns}
            visible={filterModalVisible}
            onRemove={onRemoveFilter}
            onFieldChange={onFieldChange}
            onOk={onConfirmFilter}
            onCancel={onCloseFilterModel}
            onAdd={onAddFilterRow}
            filters={filters}
          />
        ) : null}
        </GridTableContext.Provider>
        </Form>
      {renderOverlayLayer()}
    </div>
  );
});

// GridTable = React.forwardRef(GridTable);

// GridTable = Form.create()(GridTable);

GridTable.defaultProps = {
  filterModalProps: {},
  filterTableProps: {},
  transformFilterData(data) {
    return {
      whereClauses: data.map((d) => {
        return {
          logic: "and",
          criteriaClause: {
            filed: d.fieldName,
            cond: d.condition, // transformCondition(d.condition),
            value1: d.value,
          },
        };
      }),
    };
  },
};

const transformCondition = cond([
  [partial(eq, conditions.IS_NULL), constant(0)],
  [partial(eq, conditions.IS_NOT_NULL), constant(1)],
  [partial(eq, conditions.EQUAL), constant(2)],
  [partial(eq, conditions.NOT_EQUAL), constant(3)],
  [partial(eq, conditions.GT_EQUAL), constant(4)],
  [partial(eq, conditions.GT_OR_EQUAL), constant(5)],
  [partial(eq, conditions.LT_EQUAL), constant(6)],
  [partial(eq, conditions.LT_OR_EQUAL), constant(7)],
  [partial(eq, conditions.START_WITH), constant(8)],
  [partial(eq, conditions.END_WITH), constant(9)],
  [partial(eq, conditions.LIKE), constant(10)],
  [partial(eq, conditions.INClUDE), constant(11)],
  [partial(eq, conditions.NOT_INCLUDE), constant(12)],
  [partial(eq, conditions.BETWEEN), constant(13)],
  [partial(eq, conditions.NO_LIKE), constant(14)],
]);

export const createRowEditor = function (normalRender) {
  return function render(text, row, index) {
    function renderComponent({
      isEditing,
      setEditorRowKey,
      removeEditorRowKey,
      addEditorRowKey,
      getRowKey,
      getFormRowData,
      validateRowFields,
    }) {
      let rowKey = getRowKey(row);
      return normalRender({
        isEditing: isEditing(row),
        edit(isOnly = false) {
          addEditorRowKey(rowKey, isOnly);
        },
        cancel() {
          removeEditorRowKey(rowKey);
        },
        getEditorData() {
          return getFormRowData(row);
        },
        validateFields(callback) {
          validateRowFields(row, callback);
        },
        addEditorRowKey: addEditorRowKey,
        removeEditorRowKey: removeEditorRowKey,
        text: text,
        record: row,
        rowIndex: index,
      });
    }
    return (
      <GridTableContext.Consumer>{renderComponent}</GridTableContext.Consumer>
    );
  };
};

export default GridTable;
