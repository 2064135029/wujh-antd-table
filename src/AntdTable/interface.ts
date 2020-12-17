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

