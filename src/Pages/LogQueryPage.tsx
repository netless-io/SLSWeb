import { Table, TablePaginationConfig, message } from 'antd';
import moment from "moment";
import { useState } from 'react';
import './App.css';
import { getPreference, ISOTimelocation, QueryForm, updatePreference } from '../Components/QueryForm';
import { baseUrl, getColumns } from '../utility';
import { useTranslation } from 'react-i18next';
import { redirect, useLoaderData, useNavigate, useNavigation } from 'react-router-dom';

export interface LogQueryType {
    uuid: string
    suid: string | undefined
    from: string
    to: string
    range: moment.Moment[]
    keys: string[]
    timeLocation: string
    page: string
    pageSize: string
}

interface LogQueryResult {
    count: number
    list: any[]
    query?: LogQueryType
}

function emptyLogQuery(): LogQueryType {
    return {
        uuid: '',
        from: moment().startOf('day').unix().toString(),
        to: moment().unix().toString(),
        range: [
            moment().startOf('day'),
            moment()],
        keys: getPreference().displayKeys,
        timeLocation: getPreference().timelocation,
        page: '1',
        pageSize: '30',
        suid: undefined
    }
}

export async function LogQueryLoader(requestUrl: string) {
    const fromUrl = new URL(requestUrl);
    if (fromUrl.search.length <= 0) {
        return Promise.resolve({ count: 0, list: [], query: emptyLogQuery() });
    }
    const urlSearchParams = fromUrl.searchParams;
    const query = Object.fromEntries(urlSearchParams.entries()) as unknown as LogQueryType;
    if (query.from === query.to) {
        const redirectUrl = new URL(requestUrl.replace(`to=${query.to}`, `to=${Number(query.to) + 3600*24}`));
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
    const url = new URL(`${baseUrl}/logs`);
    if (query.uuid === undefined) {
        return Promise.resolve({ count: 0, list: [], query });
    }
    url.searchParams.append('uuid', query.uuid);
    if (query.suid !== null && query.suid !== undefined && query.suid.length > 0) {
        url.searchParams.append('suid', query.suid);
    }
    url.searchParams.append('from', query.from);
    url.searchParams.append('to', query.to);
    url.searchParams.append('page', query.page.toString());
    url.searchParams.append('pageSize', query.pageSize.toString());
    return new Promise((resolver, error) => {
        fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } })
            .then(res => res.json())
            .then(res => {
                if (res["error"] !== undefined) {
                    error(`server error: ${res["error"]}`);
                    return;
                }
                let list = res["list"] as any[];
                list = list.map((obj, index) => {
                    obj['key'] = `${index}`;
                    return obj;
                });
                resolver({
                    count: res["count"],
                    list: list,
                    query
                })
            });
    })
}

function LogQueryPage() {
    let { count, list, query } = useLoaderData() as LogQueryResult;
    const [columns, setColumns] = useState(getColumns(query.keys, query.timeLocation !== ISOTimelocation));
    const { t } = useTranslation();
    const { state } = useNavigation();
    const navigate = useNavigate();

    const handlerTableChange = (pagination: TablePaginationConfig) => {
        navigateToSearchPage(pagination.current, pagination.pageSize);
    }

    const getDownloadHref = (fileType: string): string => {
        message.info('download start');
        const url = new URL(`${baseUrl}/downloadLogs`);
        query.keys.forEach(element => {
            url.searchParams.append('keys', element);
        });
        url.searchParams.append('from', query.from);
        url.searchParams.append('to', query.to);
        url.searchParams.append('fileType', fileType);
        url.searchParams.append('uuid', query.uuid);
        if (query.suid !== undefined) {
            url.searchParams.append('suid', query.suid);
        }
        if (query["timeLocation"] !== ISOTimelocation) {
            url.searchParams.append('timeLocation', query["timeLocation"]);
        }
        return url.toString()
    }

    const navigateToSearchPage = (page: number, pageSize: number) => {
        const url = new URL(`${baseUrl}/logs`);
        url.searchParams.append('uuid', query.uuid);
        if (query.suid !== undefined) {
            url.searchParams.append('suid', query.suid);
        }
        url.searchParams.append('from', query.from);
        url.searchParams.append('to', query.to);
        url.searchParams.append('page', page.toString());
        url.searchParams.append('pageSize', pageSize.toString());
        const newPath = '/normal' + url.search
        navigate(newPath);
    }

    return (
        <div className="LogQuery">
            <QueryForm
                defaultValue={query}
                onValuesChange={(_, value) => {
                    const timelocation = value["timeLocation"] as string;
                    setColumns(getColumns(value["keys"], timelocation !== ISOTimelocation));
                    updatePreference(value["keys"], timelocation);
                }}
                onFinish={(value) => {
                    query = value;
                    const startTime = (value['range'][0] as moment.Moment).unix();
                    const endTime = (value['range'][1] as moment.Moment).unix()
                    query.from = startTime.toString();
                    query.to = endTime.toString();
                    navigateToSearchPage(1, 30);
                }}
                downloadHref={getDownloadHref}
                showCustomQuery={false}
            />

            <div className='table-container' style={{ width: '98%' }}>
                <Table
                    style={{ overflowX: 'scroll' }}
                    columns={columns}
                    dataSource={list}
                    onChange={handlerTableChange}
                    pagination={{
                        showTotal: () => <div>{t('page.counter', { count: count })}</div>,
                        position: ['bottomLeft'],
                        pageSize: query && Number(query.pageSize),
                        current: query && Number(query.page),
                        total: count
                    }}
                    scroll={{ y: 480 }}
                    size={'small'}
                    bordered={true}
                    loading={state === 'loading'}>
                </Table>
            </div>
        </div>
    )
}

export default LogQueryPage;
