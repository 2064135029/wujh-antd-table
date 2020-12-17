import { PaginationProps } from 'antd/lib/pagination'


export interface TablePagination extends PaginationProps { 
    read: Function
}
export interface GridTableProps { 
    columns?: Array<Object>;
    editorRowKey?: string;
    components?: any;
    rowClassName?: any;
    rowKey?: string;
    dataSource?: Array<Object>;
    pagination?: TablePagination;
    onChange?: Function,
    filterModalProps?: any,
    filterTableProps?: any,
    transformFilterData?: any,
    overlayLayer?: any,
    onRow?: any,
    restProps?: any
}


export interface FilterTableProps { 
    filters?: Array<Object>,
    columns?: Array<Object>,
    visible?: boolean,
    onOk?: Function,
    onCancel?: Function,
    onRemove?: Function,
    onFieldChange?: Function,
    onAdd?:Function,
    filterModalProps:any,
    filterTableProps:any,
}
