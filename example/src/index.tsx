import React, { useCallback } from 'react';
import { render } from 'react-dom';
// import Renderer from '../../dist';
import Renderer from '../../src/Renderer';
import { RenderRef, AnswerItemType } from '../../src/types';
import { MOCK_SCHEMA } from './mock';
import AntTable from '../../src/AntdTable';

const App: React.FC = () => {

  // const renderer = React.createRef<RenderRef>();

  // const handleSubmit = useCallback((answers: AnswerItemType[]) => {
  //   console.log('answers:::', answers);
  // }, []);

  const columns = [{
    key: '1',
    name: '胡彦斌',
    age: 32,
    address: '西湖区湖底公园1号',
  },
  {
    key: '2',
    name: '胡彦祖',
    age: 42,
    address: '西湖区湖底公园1号',
    }];
  const dataSource = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '住址',
      dataIndex: 'address',
      key: 'address',
    }
  ];
  return (
    <div>
     <AntTable columns={columns} dataSource={dataSource}></AntTable>
     吴建何
    </div>
  );
  
};

render(<App />, document.querySelector('#app'));
