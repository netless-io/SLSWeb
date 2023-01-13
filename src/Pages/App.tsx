import {
  Dropdown,
  Layout,
  Menu,
  Typography,
} from 'antd';
import { Suspense } from 'react';
import './App.css';
import LogQueryPage from '../Pages/LogQueryPage';
import CustomLogQueryPage from '../Pages/CustomLogQueryPage';
import UsageInvestigatePage from '../Pages/UsageInvestigatePage';
import { useTranslation } from 'react-i18next';
import { ChartQueryPage } from './ChartQueryPage';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
  useLocation
} from 'react-router-dom'

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

const lngItems = Object.keys(lngs).map(e => {
  return lngs[e];
});

const { Header, Content, Footer } = Layout;

function App() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

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
      key: 'normal',
      label: t('app.page.normal'),
    }, {
      key: 'custom',
      label: t('app.page.custom'),
    }, {
      key: 'chart',
      label: t('app.page.chart'),
    }, {
      key: 'usage',
      label: t('app.page.usage'),
    }
  ];

  return <Layout>
    <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
      <Menu
        onSelect={info => {
          navigate(info.key)
        }}
        theme="dark"
        mode="horizontal"
        selectedKeys={pages.filter(i => {
          return location.pathname.includes(i.key);
        }).map(i=>i.key)}
        items={pages}
      />
    </Header>

    <Content className="site-layout" style={{ padding: '0 14px', marginTop: 60 }}>
      <div className="site-layout-background" style={{ padding: 24, minHeight: 720 }}>
        <div id="detail">
          <Outlet />
        </div>
      </div>
    </Content>

    <Footer>
      <Dropdown overlay={lngsMenu} trigger={['click']}>
        <Typography.Link>
          {t('app.selectLanguage') + ": " + lngs[i18n.resolvedLanguage].label}
        </Typography.Link>
      </Dropdown>
    </Footer>
  </Layout>
}

function ErrorPage() {
  // const error = useRouteError();

  return <div id="error-page">
    <h1>Oops! Bad path</h1>
  </div>
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "normal",
        element: <LogQueryPage />
      },
      {
        path: "custom",
        element: <CustomLogQueryPage />
      },
      {
        path: "chart",
        element: <ChartQueryPage />
      },
      {
        path: "usage",
        element: <UsageInvestigatePage />
      }
    ]
  }
]);

export default function WrappedApp() {
  return (
    <Suspense fallback="... is loading">
      <RouterProvider router={router} />
    </Suspense>
  );
}

