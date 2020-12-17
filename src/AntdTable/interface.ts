

export interface GridTableProps { 
    columns?: Array<Object>;
    editorRowKey?: string;
    components?: any;
    rowClassName?: string;
    rowKey?: string;
    dataSource?: Array<Object>;
    pagination?: any;
    onChange?: Function,
    filterModalProps?: any,
    filterTableProps?: any,
    transformFilterData?: any,
    overlayLayer?: any,
    onRow?: any,
    restProps?: any
}