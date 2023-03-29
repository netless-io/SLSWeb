import { Button, Space, Typography } from "antd"
import { useLoaderData } from "react-router-dom"
import { ssoUrl } from "../agoraSSOAuth";
import { useTranslation } from "react-i18next";
import Title from "antd/lib/typography/Title";
import { baseUrl } from "../utility";

export async function LoginLoadingData() {
    const url = new URL(baseUrl + "/health");
    const response = await fetch(url.toString());
    const json = await response.json();
    return json;
}

export default function LoginPage() {
    const data = useLoaderData();
    const { t } = useTranslation();

    // show button on the center.
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Space direction="vertical" align="center">
            <Title>{t("web.title")}</Title>
            <Button
                type='default'
                shape="round"
                size="large"
                icon={<img alt="agora-logo" src="./agora-logo.png" height="18px"/>}
                href={ssoUrl('')}
            >
                {t("login.title")}
            </Button>
            <Typography.Text type='secondary'>{t("login.version", {version: data["version"]}) }</Typography.Text>
        </Space>
    </div>
}