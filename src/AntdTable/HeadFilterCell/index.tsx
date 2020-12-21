import React, { useContext, useMemo } from "react";
import GridTableContext from "../context";
// import { isBoolean, extend } from "lodash";
import { Dropdown } from "antd";
import classNames from "classnames";
import { FunnelPlotOutlined } from "@ant-design/icons";

function stopPropagation(e) {
  e.stopPropagation();
  if (e.nativeEvent.stopImmediatePropagation) {
    e.nativeEvent.stopImmediatePropagation();
  }
}

export default function HeadFilterCell(props) {
  let {
    filterable,
    dataIndex,
    opened,
    filtered,
    children,
    className,
    ...restProps
  } = props;

  // let [filterVisible, setFilterVisible] = useState(false);
  let context = useContext(GridTableContext);

  let { getPopupContainer } = filterable || {};

  const onFilterClick = e => {
    console.log(e);
    console.log(filterable);
    context.onFilterClick({
      ...filterable
    });
    stopPropagation(e);
  };
  const renderFilterIcon = () => {
    let prefixCls = "ant-table";
    const dropdownIconClass = classNames({
      [`${prefixCls}-filter-selected`]: filtered,
      [`${prefixCls}-open`]: opened,
      [`${prefixCls}-filter-open`]: opened
    });

    return (
        <FunnelPlotOutlined className={dropdownIconClass}
        onClick={onFilterClick}/>
    );
  };
  className=classNames(classNames,{
    "ant-table-column-has-actions": filterable,
    "ant-table-column-has-filters": filterable
  })
  return (
    <th className={className} {...restProps}>
      {children}
      {filterable ? renderFilterIcon() : null}
    </th>
  );
}
