import { Menu, Layout, Dropdown, Typography, Space, Row, Col } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Pages } from "./Router";

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

const { Header, Content } = Layout;

export default function Root() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const userMenu = (<Menu
        items={[
            {
                key: 'logout',
                label: t('app.logout'),
            }
        ]}
        onClick={() => {
            navigate('/handleAgoraLogout');
        }}
    />)

    const lngsMenu = (<Menu
        selectable
        items={lngItems}
        defaultSelectedKeys={[lngs[i18n.resolvedLanguage].key]}
        onClick={e => {
            i18n.changeLanguage(e.key)
        }}
    >
    </Menu>);

    const userName = document.cookie
        .split(';')
        .filter(e => e.trim().startsWith('UserName='))
        .map(e => e.trim().split('=')[1])[0];


    const currentKey = (location.pathname === "/" ? "/normal" : location.pathname).replace("/", "");

    return <Layout>
        <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
            <Row justify="space-between">
                <Col>
                    <Menu
                        onSelect={info => {
                            navigate(info.key)
                        }}
                        theme="dark"
                        mode="horizontal"
                        selectedKeys={[currentKey]}
                        items={Pages.map((page) => { return { key: page, label: t(`app.page.${page}`) } })}
                    />
                </Col>
                <Col>
                    <Space size={20}>
                        <Dropdown overlay={lngsMenu} trigger={['click']}>
                            <Typography.Link>
                                {t('app.selectLanguage') + ": " + lngs[i18n.resolvedLanguage].label}
                            </Typography.Link>
                        </Dropdown>
                        {userName &&
                            <Dropdown overlay={userMenu} trigger={['click']}>
                                <Typography.Link>
                                    {t("user.indicator", {USER_NAME: userName})}
                                </Typography.Link>
                            </Dropdown>
                        }
                    </Space>
                </Col>
            </Row>
        </Header>

        <Content className="site-layout" style={{ padding: '0 14px', marginTop: 60 }}>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 720 }}>
                <div id="detail">
                    <Outlet />
                </div>
            </div>
        </Content>
    </Layout>
}