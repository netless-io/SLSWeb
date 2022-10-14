import { ColumnsType } from "antd/lib/table";
import { LogItemType } from "./LogItemType";
import { Input, Space } from "antd";

export const baseUrl = 'http://sls-server.netless.group:8080';
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

export function queryElements(showCustomQuery: boolean) {
    if (showCustomQuery) {
        return (
            <Space>
                <div style={{ width: 100 }}>{'custom query'}</div>
                <Input.TextArea
                    placeholder={`like 'uuid:fc10b74047b511ed91d4612f8be91524 | select * from log limit 30000'`}
                    style={{ width: 480 }}
                    id='customQuery'
                    autoSize={{ minRows: 2, maxRows: 10 }} />
            </Space>
        );
    } else {
        return (
            <Space direction='vertical'>
                <Space>
                    <div style={{ width: 100 }}>{'room uuid'}</div>
                    <Input style={{ width: 300 }} type='text' id='uuid' placeholder="room uuid length 32"></Input>
                </Space>

                <Space>
                    <div style={{ width: 100 }}>{'uid'}</div>
                    <Input style={{ width: 300 }} type='text' id='uid' placeholder="user uid"></Input>
                </Space>
            </Space>
        );
    }
}