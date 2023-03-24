import { ColumnsType } from "antd/lib/table";
import { LogItemType } from "./Components/LogItemType";

// export const baseUrl = 'https://sls-server.netless.group';
export const baseUrl = 'http://localhost:8080';
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

