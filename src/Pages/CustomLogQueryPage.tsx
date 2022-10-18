import { Space, Table, TablePaginationConfig, message } from 'antd';
import moment from "moment";
import { useState } from 'react';
import './App.css';
import { defaultSelKeys } from '../Const';
import { baseUrl, getColumns } from '../utility';
import { defaultUsingLocalTime, QueryForm } from '../Components/QueryForm';
import { useTranslation } from 'react-i18next';

function CustomLogQueryPage() {
    const [query, setQuery] = useState(undefined);
    const [columns, setColumns] = useState(getColumns(defaultSelKeys, defaultUsingLocalTime));
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [listSource, setListSource] = useState<any[]>([]);
    const [tableParams, setTableParams] = useState<TablePaginationConfig>({ current: 1, pageSize: 30 })
    const { t } = useTranslation();

    const handlerTableChange = (pagination: TablePaginationConfig) => {
        setTableParams(pagination);
    }

    const getDownloadHref = (fileType: string): string => {
        const url = new URL(`${baseUrl}/customQuery/downloadLogs`);
        url.searchParams.append('customQuery', query["customQuery"]);
        const from = (query['range'][0] as moment.Moment).unix();
        const to = (query['range'][1] as moment.Moment).unix();
        url.searchParams.append('from', from.toString());
        url.searchParams.append('to', to.toString());
        url.searchParams.append('fileType', fileType);

        query['keys'].forEach(element => {
            url.searchParams.append('keys', element);
        });
        if (query["timeLocation"] !== undefined) {
            url.searchParams.append('timeLocation', query["timeLocation"]);
        }
        return url.toString()
    }

    const fetchData = () => {
        setLoading(true);
        const url = new URL(`${baseUrl}/customQuery/logs`);
        const from = (query['range'][0] as moment.Moment).unix();
        const to = (query['range'][1] as moment.Moment).unix();
        url.searchParams.append('from', from.toString());
        url.searchParams.append('to', to.toString());
        url.searchParams.append('customQuery', query["customQuery"]);

        fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } })
            .then(res => res.json())
            .then(res => {
                if (res["error"] !== undefined) {
                    message.error(`server error: ${res["error"]}`, 3);
                    setLoading(false);
                    return
                }
                let list = res["list"] as any[];
                list = list.map((obj, index) => {
                    obj['key'] = `${index}`;
                    return obj;
                })
                setTotal(res["count"]);
                setListSource(list);
                setLoading(false);
            });
    }

    return (
        <div className="LogQuery">
            <Space direction='vertical' align="start" style={{ width: '100%' }}>
                <QueryForm
                    showCustomQuery={true}
                    onFinish={() => {
                        setTableParams({ ...tableParams, current: 1 });
                        fetchData();
                    }}
                    onValuesChange={(_, value) => {
                        const localTime = value["timeLocation"] !== undefined;
                        setColumns(getColumns(value["keys"], localTime));
                        setQuery(value);
                    }}
                    downloadHref={getDownloadHref}
                />

                <div className='table-container' style={{ width: '98%' }}>
                    <Table
                        style={{ overflowX: 'scroll' }}
                        columns={columns}
                        dataSource={listSource}
                        onChange={handlerTableChange}
                        pagination={{
                            showTotal: () => <div>{t('page.counter', {count: total})}</div>,
                            position: ['bottomLeft'],
                            pageSize: tableParams.pageSize,
                            current: tableParams.current,
                            total: listSource.length
                        }}
                        scroll={{ y: 480 }}
                        size={'small'}
                        bordered={true}
                        loading={loading}>
                    </Table>
                </div>
            </Space>
        </div>
    )
}

export default CustomLogQueryPage;
