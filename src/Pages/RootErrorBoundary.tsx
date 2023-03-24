import { Result } from "antd";
import { ResultStatusType } from "antd/lib/result";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function RootErrorBoundary() {
    const error = useRouteError();

    return (
        <div className="error-page">
            {isRouteErrorResponse(error) &&
                <Result
                    status={error.status as ResultStatusType}
                    title={error.status}
                    subTitle={error.data.message}
                    extra={<a href="/">Back Home</a>}
                />}
        </div>
    )
}