import {
  Dropdown,
  Layout,
  Menu,
  Typography,
} from 'antd';
import { Suspense, useState } from 'react';
import './App.css';
import LogQueryPage from '../Pages/LogQueryPage';
import CustomLogQueryPage from '../Pages/CustomLogQueryPage';
import { useTranslation } from 'react-i18next';

const lngs = {
  en: {
    key: 'en',
    label: 'English'
  },
  zh: {
    key: 'zh',
    label: '简体中文'
  }
};

const lngItems = Object.keys(lngs).map(e=> {
  return lngs[e];
});

const { Header, Content, Footer } = Layout;

function App() {
  const { t, i18n } = useTranslation();
  const [sel, setSel] = useState('1');

  const lngsMenu = (<Menu
    selectable
    items={lngItems}
    defaultSelectedKeys={[lngs[i18n.resolvedLanguage].key]}
    onClick={e => {
      i18n.changeLanguage(e.key)
    }}
  >
  </Menu>);

  const pages = [
    {
      key: '1',
      label: t('app.page.normal')
    }, {
      key: '2',
      label: t('app.page.custom')
    }
  ];

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

    <Footer>
      <Dropdown overlay={lngsMenu} trigger={['click']}>
        <Typography.Link>
          {t('app.selectLanguage') + ": "+  lngs[i18n.resolvedLanguage].label}
        </Typography.Link>
      </Dropdown>
    </Footer>
  </Layout>
}

export default function WrappedApp() {
  return (
    <Suspense fallback="... is loading">
      <App />
    </Suspense>
  );
}