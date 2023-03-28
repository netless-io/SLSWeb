import { Result } from "antd";
import { ResultStatusType } from "antd/lib/result";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function RootErrorBoundary() {
    const error = useRouteError();
    const { t } = useTranslation();

    return (
        <div className="error-page">
            {isRouteErrorResponse(error) &&
                <Result
                    status={error.status as ResultStatusType}
                    title={error.status}
                    subTitle={t("error-http-wrap", {
                        reason: error.data.message
                    })}
                    extra={<a href="/">{t("backhome")}</a>}
                />}
        </div>
    )
}