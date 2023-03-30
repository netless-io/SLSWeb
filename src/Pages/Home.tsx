import { Menu, Layout, Dropdown, Typography, Space, Row, Col } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Pages } from "../Router";
import { getUserName } from "../utility";
import LanguagePicker from "./LanguagePicker";

const { Header, Content } = Layout;

export default function Home() {
    const { t } = useTranslation();
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

    const userName = getUserName();

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
                        <LanguagePicker />
                        {userName &&
                            <Dropdown overlay={userMenu} trigger={['click']}>
                                <Typography.Link>
                                    {t("user.indicator", { USER_NAME: userName })}
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