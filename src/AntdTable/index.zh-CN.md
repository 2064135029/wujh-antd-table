* [example](#example)
* [api](#API)


----------
## example


**创建行编辑**
```jsx
import GridTable,{createRowEditor} from '@/components/GridTable'
 let columns = [
	 {},
    {
      title: "操作",
      render: createRowEditor(function({
	    record,
        isEditing,
        edit,
        cancel,
        validateFields
      }) {
        return isEditing ? (
          <div>
            <Button
              type="link"
              onClick={() => {
                validateFields(data => {
                  console.log("save-success", data);
                  save({
	                  ...rocrd,
	                  ...data
	               })
                });
              }}
            >
              保存
            </Button>
            <Button type="link" onClick={cancel}>
              取消
            </Button>
          </div>
        ) : (
          <div>
            <Button type="link" onClick={edit}>
              编辑
            </Button>
            <Button type="link" onClick={()=>{
	            delete(record.id)
            }}>删除</Button>
          </div>
        );
      })
    }
  ];
 
```
## API

基本继承 antd 的 Table 组件 API。新增 API 如下:

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| ---- | ---- | ---- | ------ | ---- |
|editorRowKey |编辑 key |string\|array
|filterModalProps | 过滤弹出框属性 |object
|filterTableProps | 过滤表格属性 | object
|transformCondition |转换滤结果集|< T >(filters:object[])=>T
|onChange | 表格状态改变，过滤改变| (pagination,filters,sort)=>
|columns | 列表 | object[]|
|overlayLayer|浮层|object={width:number,height:number,render:(record)=>React.createElement}|

### overlayLayer

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| ---- | ---- | ---- | ------ | ---- |
|width |宽 key | int
|height | 高 |int 
|render | 渲染 | function
|visible |自定义控制是否显示| boolean
|onClick | 点击行触发| function
|onCancel | 关闭触发| function
|closeFilterHandler|过滤哪些元素能关闭|function
|


## columns

新增属性

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| ---- | ---- | ---- | ------ | ---- |
|editable|列是否可编辑|object
|filterable|列是否可过滤|object

### editable
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| ---- | ---- | ---- | ------ | ---- |
|type| 控件类型|string| text
|render|自定义渲染|()=>React.createElement
|options|form.getFieldDecorator(options) |object
|transform|转换编辑结果值|< T >(v:T)=>T

### filterable

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| ---- | ---- | ---- | ------ | ---- |
|type| 控件类型(目前只支持：text,date,datetime,number.bool)|string| text
