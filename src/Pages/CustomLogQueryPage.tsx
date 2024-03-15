import { Space, Table, TablePaginationConfig, message } from 'antd';
import moment from "moment";
import { useState } from 'react';
import './App.css';
import { defaultSelKeys } from '../Const';
import { baseUrl, errorMsgFromResponseBody, getColumns } from '../utility';
import { ISOTimelocation, QueryForm, getPreference, updatePreference } from '../Components/QueryForm';
import { useTranslation } from 'react-i18next';
import { redirect, useLoaderData, useNavigate } from 'react-router-dom';
import { authWrappedFetch } from '../agoraSSOAuth';

export interface CustomLogQueryType {
    customQuery: string
    from: string
    to: string
    range: moment.Moment[]
    keys: string[]
    timeLocation: string
    page: string
    pageSize: string
}

interface CustomLogQueryResult {
    count: number
    list: any[]
    query?: CustomLogQueryType
}

function emptyCustomLogQuery(): CustomLogQueryType {
    return {
        from: moment().startOf('day').unix().toString(),
        to: moment().unix().toString(),
        range: [
            moment().startOf('day'),
            moment()],
        keys: getPreference().displayKeys,
        timeLocation: getPreference().timelocation,
        page: '1',
        pageSize: '30',
        customQuery: ''
    }
}

export async function CustomLogQueryLoader(requestUrl: string) {
    const fromUrl = new URL(requestUrl);
    if (fromUrl.search.length <= 0) {
        return Promise.resolve({ count: 0, list: [], query: emptyCustomLogQuery() });
    }
    const urlSearchParams = fromUrl.searchParams;
    const query = Object.fromEntries(urlSearchParams.entries()) as unknown as CustomLogQueryType;
    if (query.from === query.to) {
        const redirectUrl = new URL(requestUrl.replace(`to=${query.to}`, `to=${Number(query.to) + 3600 * 24}`));
        const newPath = redirectUrl.pathname + redirectUrl.search;
        return redirect(newPath);
    }
    query.range = [
        moment.unix(Number(query.from)),
        moment.unix(Number(query.to))
    ];
    const preference = getPreference();
    query.keys = preference.displayKeys;
    query.timeLocation = preference.timelocation;

    const url = new URL(`${baseUrl}/customQuery/logs`);
    if (query.customQuery.length <= 0) {
        return Promise.resolve({ count: 0, list: [], query });
    }
    if (query.customQuery !== null && query.customQuery !== undefined && query.customQuery.length > 0) {
        url.searchParams.append('customQuery', query.customQuery);
    }
    url.searchParams.append('from', query.from);
    url.searchParams.append('to', query.to);
    url.searchParams.append('page', query.page.toString());
    url.searchParams.append('pageSize', query.pageSize.toString());
    return await authWrappedFetch(
        requestUrl,
        url,
        { method: 'GET', headers: { 'Accept': 'application/json' }},
        async (response) => {
            const jsonObj = await response.json();
            const errorMsg = errorMsgFromResponseBody(jsonObj);
            if (errorMsg !== undefined) {
                message.error(errorMsg);
                return { count: 0, list: [], query }
            }
            let list = jsonObj["list"] as any[];
            list = list.map((obj, index) => {
                obj['key'] = `${index}`;
                return obj;
            });
            return { list, query, count: jsonObj["count"] };
        }
    )
}

function CustomLogQueryPage() {
    const [columns, setColumns] = useState(getColumns(defaultSelKeys, getPreference().timelocation === undefined));
    const { t } = useTranslation();
    const navigate = useNavigate();
    let { count, list, query } = useLoaderData() as CustomLogQueryResult;

    const handlerTableChange = (pagination: TablePaginationConfig) => {
        navigateToSearchPage(pagination.current, pagination.pageSize);
    }

    const getDownloadHref = (fileType: string): string => {
        message.info(t('download.start'));
        const url = new URL(`${baseUrl}/customQuery/downloadLogs`);
        query.keys.forEach(element => {
            url.searchParams.append('keys', element);
        });
        url.searchParams.append('from', query.from);
        url.searchParams.append('to', query.to);
        url.searchParams.append('fileType', fileType);
        url.searchParams.append('customQuery', query.customQuery);
        if (query["timeLocation"] !== ISOTimelocation) {
            url.searchParams.append('timeLocation', query["timeLocation"]);
        }
        return url.toString()
    }

    const navigateToSearchPage = (page: number, pageSize: number) => {
        const url = new URL(`${baseUrl}/customQuery/logs`);

        if (query.customQuery !== undefined) {
            url.searchParams.append('customQuery', query.customQuery);
        }
        url.searchParams.append('from', query.from);
        url.searchParams.append('to', query.to);
        url.searchParams.append('page', page.toString());
        url.searchParams.append('pageSize', pageSize.toString());
        const newPath = '/custom' + url.search;
        navigate(newPath);
    }

    return (
        <div className="LogQuery">
            <Space direction='vertical' align="start" style={{ width: '100%' }}>
                <QueryForm
                    defaultValue={query}
                    showCustomQuery={true}
                    onFinish={(value) => {
                        query = value;
                        const startTime = (value['range'][0] as moment.Moment).unix();
                        const endTime = (value['range'][1] as moment.Moment).unix()
                        query.from = startTime.toString();
                        query.to = endTime.toString();
                        navigateToSearchPage(1, 30);
                    }}
                    onValuesChange={(_, value) => {
                        const timelocation = value["timeLocation"] as string;
                        const keys = value["keys"];
                        setColumns(getColumns(keys, timelocation !== ISOTimelocation));
                        updatePreference(keys, timelocation);
                        query.keys = keys;
                    }}
                    downloadHref={getDownloadHref}
                />

                <div className='table-container' style={{ width: '98%' }}>
                    <Table
                        style={{ overflowX: 'scroll' }}
                        columns={columns}
                        dataSource={list}
                        onChange={handlerTableChange}
                        pagination={{
                            showTotal: () => <div>{t('page.counter', { count })}</div>,
                            position: ['bottomLeft'],
                            pageSize: query && Number(query.pageSize),
                            current: query && Number(query.page),
                            total: count
                        }}
                        scroll={{ y: 480 }}
                        size={'small'}
                        bordered={true}>
                    </Table>
                </div>
            </Space>
        </div>
    )
}

export default CustomLogQueryPage;
