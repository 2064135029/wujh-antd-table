import React, { useState, useEffect } from 'react';
import { endsWith, extend, isArray, isFunction, isEqual } from 'lodash';
export const FIELD_SEPARATOR = '__$$__';
export function getFieldName(key, name) {
  return name + FIELD_SEPARATOR + key;
}

export function useGridPagination(options, deps) {
  let [gridPagination, setGridPagination] = useState(() => {
    let gridPagination = new GridPagination(options);
    gridPagination.deps = deps;
    return gridPagination;
  });
  if (deps && isArray(deps) && !isEqual(deps, gridPagination.deps)) {
    gridPagination.deps = deps;
    if (options.dataSource) {
      gridPagination.onBindData(options.dataSource);
    }
    if (options.getTotal) {
      gridPagination.options.getTotal = options.getTotal;
    }
    if (options.extraWhere) {
      gridPagination.options.extraWhere = options.extraWhere;
    }
  }
  return gridPagination;
}
export class GridPagination {
  options: any;
  queryParams: any;
  orderByClauses: any;
  whereClauses: any;
  defaultQueryData: any;
  queryData: any;
  _totalCount: number;
  bindDataHandle: Function;
  deps: any;


  constructor(options) {
    this.options = {};
    this.queryParams = {};
    this.updateOptions(options);
  }
  updateOptions(options: any = {}) {
    options = this.options = extend(
      {
        simple: false,
        page: 1,
        pageSize: 10,
        whereClauses: [],
        orderByClauses: [],
        extraProps: {},
        getTotal: null,
        dataSource: null,
        parseQuery: null,
        extraWhere: null,
      },
      this.options,
      options,
    );
    this.orderByClauses = options.orderByClauses.slice();
    this.whereClauses = options.whereClauses.slice();
    this.defaultQueryData = {
      page: options.page,
      pageSize: options.pageSize,
    };
    this.queryData = {
      ...this.defaultQueryData,
    };
    if (options.dataSource) {
      this.onBindData(options.dataSource);
    }
    if (options.parseQuery) {
      this.options.parseQuery = options.parseQuery;
    }
    this._totalCount = 0;
  }
  addOrderByClauses(name, order = 'desc') {
    this.orderByClauses.push({
      filed: name,
      direction: order,
    });
    return this;
  }
  addWhereClauses(name, value = '', cond = 2) {
    this.whereClauses.push({
      logic: 'and',
      criteriaClause: {
        filed: name,
        cond: cond,
        value1: value,
      },
    });
    return this;
  }
  clearWhereClauses() {
    this.whereClauses.length = 0;
  }
  onBindData(bindDataHandle) {
    this.bindDataHandle = bindDataHandle;
    return this;
  }
  get props() {
    return this.options.simple
      ? {
          ...this.options.extraProps,
          showQuickJumper: false,
          showSizeChanger: false,
          showLessItems: false,
          current: this.current,
          pageSize: this.pageSize,
          total: this.total,
        }
      : {
          ...this.options.extraProps,
          showQuickJumper: true,
          showSizeChanger: true,
          showLessItems: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: total => {
            return `共${total}条`;
          },
          current: this.current,
          pageSize: this.pageSize,
          total: this.total,
        };
  }
  get total() {
    let totalCount = this._totalCount;
    if (this.options.getTotal && isFunction(this.options.getTotal)) {
      totalCount = this.options.getTotal();
    }
    return totalCount;
  }
  set total(value) {
    this._totalCount = value;
  }
  get current() {
    return this.queryData.page;
  }
  get page() {
    return this.queryData.page;
  }
  get pageSize() {
    return this.queryData.pageSize;
  }
  getQueryParams() {
    return this.queryParams;
  }
  fetch(queryParams :any = {}, ...funcArgs) {
    if (this.options.parseQuery && isFunction(this.options.parseQuery)) {
      queryParams = this.options.parseQuery(queryParams);
    }
    queryParams = {
      ...queryParams,
    };
    let whereClauses = [...this.whereClauses];
    if (isArray(queryParams.whereClauses)) {
      whereClauses = whereClauses.concat(queryParams.whereClauses);
    }
    if (this.options.extraWhere && isFunction(this.options.extraWhere)) {
      let resultExtrawhere = this.options.extraWhere();
      if (isArray(resultExtrawhere)) {
        whereClauses = whereClauses.concat(resultExtrawhere);
      }
    }
    if (whereClauses.length > 0) {
      queryParams.whereClauses = whereClauses;
    }
    if (!this.bindDataHandle) {
      return Promise.resolve();
    }
    // 缓存所有的查询条件
    this.queryParams = queryParams;

    return this.bindDataHandle(queryParams, ...funcArgs);
  }
  read(queryData = {}, ...funcArgs) {
    queryData = this.queryData = extend({}, this.defaultQueryData, queryData);
    return this.fetch(queryData, ...funcArgs);
  }
  // 带查询条件的刷新列表
  refresh(queryData = {}, ...funcArgs) {
    queryData = this.queryData = extend({}, this.defaultQueryData, this.queryParams, queryData);
    return this.fetch(queryData, ...funcArgs);
  }
}

export function closest(el, selector) {
  // let matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  if (el.closest) {
    return el.closest(selector);
  } else {
    if (!document.documentElement.contains(el)) return null;
    do {
      if (el.matches(selector)) return el;
      el = el.parentElement;
    } while (el !== null);
    return null;
  }
}
export function getOffset(elem) {
  let rect = elem.getBoundingClientRect();
  let win = elem.ownerDocument.defaultView;
  return {
    height: rect.height,
    width: rect.width,
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset,
  };
}
function getCss(el, name) {
  return el.ownerDocument.defaultView.getComputedStyle(el).getPropertyValue(name);
}
export function getPosition(elem) {
  var parentOffset = { top: 0, left: 0 },
    offset,
    offsetParent,
    doc;
  if (getCss(elem, 'position') == 'fixed') {
    offset = elem.getBoundingClientRect();
  } else {
    offset = getOffset(elem);
    doc = elem.ownerDocument;
    offsetParent = elem.offsetParent || doc.documentElement;
    while (
      offsetParent &&
      (offsetParent === doc.body || offsetParent === doc.documentElement) &&
      getCss(offsetParent, 'position') === 'static'
    ) {
      offsetParent = offsetParent.parentNode;
    }
    if (offsetParent && offsetParent !== elem && offsetParent.nodeType === 1) {
      // Incorporate borders into its offset, since they are outside its content origin
      parentOffset = getOffset(offsetParent);
      parentOffset.top += offsetParent.clientTop;
      parentOffset.left += offsetParent.clientLeft;
    }
  }
  return {
    top: offset.top - parentOffset.top,
    left: offset.left - parentOffset.left,
  };
}
