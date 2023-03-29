import { Spin, Typography } from "antd";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router-dom";

const { Title } = Typography;

export default function LinkingPage() {
    const {t} = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const linkUrl = useLoaderData() as string;

    useEffect(() => {
        let timer = setTimeout(() => {
            setIsLoading(true);
            window.location.href = linkUrl;
        }, 1000);
        return () => clearTimeout(timer);
    }, [linkUrl]);

    return <Spin size='large' spinning={isLoading}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Title type="secondary">{t("linking.tips")}</Title>
        </div>
    </Spin >
}