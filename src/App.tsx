import {
  Layout,
  Menu,
  ConfigProvider
} from 'antd';
import { useState } from 'react';
import './App.css';
import LogQueryPage from './LogQueryPage';
import locale from 'antd/es/locale/zh_CN';
import CustomLogQueryPage from './CustomLogQueryPage';

const { Header, Content, Footer } = Layout;
const pages = [
  {
    key: '1',
    label: '房间查询'
  }, {
    key: '2',
    label: '自定义查询'
  }
];

function App() {
  const [sel, setSel] = useState(pages[0].key);

  return <ConfigProvider locale={locale}>
    <Layout>
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
          {sel === '1' ? <LogQueryPage/> : <CustomLogQueryPage/>}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Netless ©2022 Created by vince</Footer>
    </Layout>
  </ConfigProvider>
}
export default App;