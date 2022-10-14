import {
  Layout,
  Menu,
} from 'antd';
import { useState } from 'react';
import './App.css';
import LogQueryPage from './LogQueryPage';
import CustomLogQueryPage from './CustomLogQueryPage';

const { Header, Content, Footer } = Layout;
const pages = [
  {
    key: '1',
    label: 'Room Log Query'
  }, {
    key: '2',
    label: 'Custom Room Log Query'
  }
];

function App() {
  const [sel, setSel] = useState(pages[0].key);

  return <Layout>
    <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
      <Menu
        onSelect={info => setSel(info.key)}
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={[pages[0].key]}
        items={pages}
      />
    </Header>
    <Content className="site-layout" style={{ padding: '0 14px', marginTop: 60 }}>
      <div className="site-layout-background" style={{ padding: 24, minHeight: 720 }}>
        {sel === '1' ? <LogQueryPage /> : <CustomLogQueryPage />}
      </div>
    </Content>
  </Layout>
}
export default App;