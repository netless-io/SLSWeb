import { Button, Space, Typography } from "antd"
import { useLoaderData, useNavigate } from "react-router-dom"
import { ssoUrl } from "../agoraSSOAuth";
import { useTranslation } from "react-i18next";
import { baseUrl } from "../utility";
import './theme.css';
import LanguagePicker from "./LanguagePicker";

export async function LoginLoadingData() {
    const url = new URL(baseUrl + "/health");
    const response = await fetch(url.toString());
    const json = await response.json();
    return json;
}

export default function LoginPage() {
    const data = useLoaderData();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // show button on the center.
    return <div className="login-bg">
        <div className="login-center">
            <Space direction="vertical" align="center" size={14}>
                <div className="login-title">{t("web.title")}</div>
                <Button
                    className="login-button"
                    type='default'
                    shape="round"
                    size="large"
                    icon={<img alt="agora-logo" src="./agora-logo.png" height="20px" style={{ padding: 2 }} />}
                    onClick={() => {
                        const ssoEncodedUrl = encodeURIComponent(ssoUrl(''));
                        const path = '/linking?url=' + ssoEncodedUrl;
                        navigate(path);
                    }}
                >
                    {t("login.title")}
                </Button>
                <Typography.Text type='secondary'>{t("login.version", { version: data["version"] })}</Typography.Text>
            </Space>
        </div>
        <LanguagePicker />
    </div>
}

