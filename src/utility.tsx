import { ColumnsType } from "antd/lib/table";
import { LogItemType } from "./Components/LogItemType";
import { t } from "i18next";
import { agoraCustomOrigin } from "./agoraSSOAuth";

export const baseUrl = 'https://sls-server.netless.group'; // prod
// export const baseUrl = 'http://localhost:8080'; // dev

export function getColumns(keys: string[], timeFormat: boolean): ColumnsType<LogItemType> {
    return keys.map(key => {
        let r = {
            title: key,
            dataIndex: key,
            key: key,
            render: undefined as any,
        };
        if (key === 'createdat') {
            if (timeFormat) {
                r.render = (e: any) => {
                    const date = new Date(parseInt(e));
                    const str = date.toLocaleString();
                    return <div>{str}</div>
                }
            } else {
                r.render = (e: any) => {
                    const date = new Date(parseInt(e));
                    const str = date.toISOString();
                    return <div>{str}</div>
                }
            }
        }
        return r;
    });
}

export function download(href: string) {
    const a = document.createElement("a");
    a.href = href;
    document.body.appendChild(a);
    a.click()
    document.body.removeChild(a);
}

export function errorMsgFromResponseBody(jsonObj: any): string | undefined {
    if (jsonObj["error"] !== undefined) {
        if (jsonObj["code"] !== undefined) {
            const errorKey = `auth.error.${jsonObj["code"]}`;
            const displayErrorMsg = t(errorKey);
            return displayErrorMsg;
        } else {
            return jsonObj["error"];
        }
    }
    return undefined;
}

export function isAgoraCustomerOrigin(): boolean {
    // Get current origin.
    const origin = window.location.origin;
    return origin === agoraCustomOrigin;
}

export function isLogin(): boolean {
    const userName = document.cookie
        .split(';')
        .filter(e => e.trim().startsWith('UserName='))
        .map(e => e.trim().split('=')[1])[0]
    if (userName === undefined) { return false; }
    return userName.length > 0;
}