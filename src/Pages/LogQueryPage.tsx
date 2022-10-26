import { Table, TablePaginationConfig, message } from 'antd';
import moment from "moment";
import { useState } from 'react';
import './App.css';
import { defaultUsingLocalTime, QueryForm } from '../Components/QueryForm';
import { defaultSelKeys } from '../Const';
import { baseUrl, getColumns } from '../utility';
import { useTranslation } from 'react-i18next';
import { LogItemType } from '../Components/LogItemType';

function LogQueryPage() {
    const [query, setQuery] = useState(undefined);
    const [columns, setColumns] = useState(getColumns(defaultSelKeys, defaultUsingLocalTime));
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [listSource, setListSource] = useState<LogItemType[]>([]);
    const [tableParams, setTableParams] = useState<TablePaginationConfig>({ current: 1, pageSize: 30 })
    const { t } = useTranslation();

    const handlerTableChange = (pagination: TablePaginationConfig) => {
        setTableParams(pagination);
        fetchData();
    }

    const getDownloadHref = (fileType: string): string => {
        const url = new URL(`${baseUrl}/downloadLogs`);
        query['keys'].forEach(element => {
            url.searchParams.append('keys', element);
        });
        const from = (query['range'][0] as moment.Moment).unix();
        const to = (query['range'][1] as moment.Moment).unix();
        url.searchParams.append('from', from.toString());
        url.searchParams.append('to', to.toString());
        url.searchParams.append('fileType', fileType);
        url.searchParams.append('uuid', query["uuid"]);
        if (query["suid"] !== undefined) {
            url.searchParams.append('suid', query["suid"]);
        }
        if (query["timeLocation"] !== undefined) {
            url.searchParams.append('timeLocation', query["timeLocation"]);
        }
        return url.toString()
    }

    const fetchData = () => {
        setLoading(true);
        const url = new URL(`${baseUrl}/logs`);
        url.searchParams.append('uuid', query["uuid"]);
        if (query["suid"] !== undefined) {
            url.searchParams.append('suid', query["suid"]);
        }
        const from = (query['range'][0] as moment.Moment).unix();
        const to = (query['range'][1] as moment.Moment).unix();
        url.searchParams.append('from', from.toString());
        url.searchParams.append('to', to.toString());
        url.searchParams.append('page', `${tableParams.current}`);
        url.searchParams.append('pageSize', `${tableParams.pageSize}`);

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
                });
                setTotal(res["count"]);
                setListSource(list);
                setLoading(false);
            });
    }

    return (
        <div className="LogQuery">
            <QueryForm
                onValuesChange={(_, value) => {
                    const localTime = value["timeLocation"] !== undefined;
                    setColumns(getColumns(value["keys"], localTime));
                    setQuery(value);
                }}
                onFinish={() => {
                    setTableParams({ ...tableParams, current: 1 });
                    fetchData();
                }}
                downloadHref={getDownloadHref}
                showCustomQuery={false}
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
                            total: total
                        }}
                        scroll={{ y: 480 }}
                        size={'small'}
                        bordered={true}
                        loading={loading}>
                    </Table>
                </div>
        </div>
    )
}

export default LogQueryPage;
