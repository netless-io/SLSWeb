import { Button, DatePicker, Form, Input, Space, Spin } from 'antd';
import moment, { Moment } from 'moment';
import { useTranslation } from 'react-i18next';
import { LogItemType } from '../Components/LogItemType';
import { LogTimeLineChart } from '../Components/LogTimeLineChart';
import { baseUrl } from '../utility';
import { getPreference } from '../Components/QueryForm';
import { useLoaderData, useNavigate, useNavigation } from 'react-router-dom';
import { authWrappedFetch } from '../agoraSSOAuth';

export interface ChartQueryType {
    uuid: string
    suid: string | undefined
    from: string
    timeLocation: string
    date: Moment
}

interface ChartQueryResult {
    list: any[]
    query?: ChartQueryType
}

function emptyChartQuery(): ChartQueryType {
    return {
        uuid: "",
        suid: undefined,
        from: moment().startOf('day').unix().toString(),
        timeLocation: getPreference().timelocation,
        date: moment().startOf('day')
    }
}

export async function ChartQueryLoader(requestUrl: string) {
    const fromUrl = new URL(requestUrl);
    if (fromUrl.search.length <= 0) {
        return Promise.resolve({ count: 0, list: [], query: emptyChartQuery() });
    }
    const urlSearchParams = fromUrl.searchParams;
    const query = Object.fromEntries(urlSearchParams.entries()) as unknown as ChartQueryType;
    query.date = moment.unix(Number(query.from));
    const preference = getPreference();
    query.timeLocation = preference.timelocation;

    const url = new URL(`${baseUrl}/customQuery/logs`);
    url.searchParams.append('from', query.from);
    url.searchParams.append('to', (Number(query.from) + 3600 * 24).toString());
    const uuid = query.uuid;
    let suidQuery: string = "";
    if (query.suid !== undefined && query.suid !== null && query.suid.length > 0) {
        suidQuery = `and suid: ${query.suid}`;
    }
    const slsQuery = `uuid: ${uuid} ${suidQuery} | select * from log limit ${queryLogsMaxCountPerTime}`;
    url.searchParams.append('customQuery', slsQuery);
    return authWrappedFetch(
        requestUrl,
        url,
        { method: 'GET', headers: { 'Accept': 'application/json' } },
        async (response) => {
            const jsonObj = await response.json();
            if (jsonObj["error"] !== undefined) {
                throw new Error(`server error: ${jsonObj["error"]}`);
            }
            let list = jsonObj["list"] as LogItemType[];
            return { list, query };
        }
    );
}

const queryLogsMaxCountPerTime = 10000;
export function ChartQueryPage() {
    let { list, query } = useLoaderData() as ChartQueryResult;

    const { t } = useTranslation();
    const { state } = useNavigation();
    const navigate = useNavigate();

    const navigateToNewPath = () => {
        const url = new URL(`${baseUrl}/customQuery/logs`);
        url.searchParams.append('uuid', query.uuid);
        if (query.suid !== undefined) {
            url.searchParams.append('suid', query.suid);
        }
        url.searchParams.append('from', query.from);
        const newPath = '/chart' + url.search;
        navigate(newPath);
    }

    return <div>
        <Form
            name='room info'
            labelCol={{ span: 2 }}
            onFinish={(value) => {
                query = value;
                query.from = (value['date'] as Moment).unix().toString();
                navigateToNewPath();
            }}
            initialValues={query}
        >
            <Form.Item
                label={t('page.normal.uuid')}
                name="uuid"
                rules={[{ required: true, len: 32, message: t('page.normal.uuid.warnings') }]}
            >
                <Input style={{ width: 300 }} type='text' placeholder={t('page.normal.uuid.placeholder')} />
            </Form.Item>

            <Form.Item
                label={t('page.normal.suid')}
                name="suid"
                rules={[{ required: false }]}
            >
                <Input style={{ width: 300 }} type='text' placeholder={t('page.normal.suid.placeholder')} />
            </Form.Item>


            <Form.Item
                label={t('page.normal.date')}
            >
                <Space>
                    <Form.Item
                        noStyle
                        name='date'
                    >
                        <DatePicker />
                    </Form.Item>
                    <div>{query.timeLocation}</div>
                </Space>
            </Form.Item>

            <Form.Item >
                <Space>
                    <Button type='primary' htmlType='submit'>{t('page.normal.search')}</Button>
                    {
                        list &&
                        <div style={{ color: 'gray' }}>
                            {t('page.chart.result.tips', { count: list.length, total: queryLogsMaxCountPerTime })}
                        </div>
                    }
                </Space>
            </Form.Item>
        </Form>

        <Spin spinning={state === 'loading'}>
            <LogTimeLineChart
                source={list}
            />
        </Spin>
    </div>
}