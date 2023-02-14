import { Button, Form, Input, Select, Space, Spin, Table, message } from "antd";
import { useTranslation } from "react-i18next";
import { useLoaderData, useNavigate, useNavigation } from "react-router-dom";
import { baseUrl } from "../utility";
import { useEffect, useRef, useState } from "react";
import { FundFilled } from "@ant-design/icons";
import ReactECharts from 'echarts-for-react';
import moment from "moment";
import { regions } from "./UsageInvestigatePage";

export interface UsageDetailQueryType {
    uuid: string
    region: string
}

interface UsageMinutesDetailType {
    segment: number
    writersPeakCount: number
    readonlyPeakCount: number
}

interface UsageMinutesTarget {
    start: number
    end: number
    uuid: string
    region: string
}

interface UsageMinutesResult {
    start: number
    end: number
    list: UsageMinutesDetailType[]
}

interface UsageDetailType {
    room: string
    timestamp: string
    cumulativeSessionsCount: number
    cumulativeWritersCount: number
    peakSessionsCount: number
    peakWritersCount: number
    cumulativeReadonlyCount: number
    peakReadonlyCount: number
}

interface UsageDetailLoadResult {
    list: UsageDetailType[]
    query: UsageDetailQueryType
}

function emptyQuery(): UsageDetailQueryType {
    return {
        uuid: '',
        region: regions[0]
    }
}

export async function UsageDetailLoader(requestUrl: string): Promise<UsageDetailLoadResult> {
    const fromUrl = new URL(requestUrl);
    if (fromUrl.search.length <= 0) {
        return Promise.resolve({ list: [], query: emptyQuery() });
    }
    const urlSearchParams = fromUrl.searchParams;
    const query = Object.fromEntries(urlSearchParams.entries()) as unknown as UsageDetailQueryType;
    if (query.uuid === undefined) {
        return Promise.resolve({ list: [], query });
    }
    const url = new URL(`${baseUrl}/roomDailyUsage`);
    url.searchParams.append('uuid', query.uuid);
    url.searchParams.append('region', query.region);
    return new Promise((resolver, error) => {
        fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } })
            .then(res => res.json())
            .then(res => {
                if (res["error"] !== undefined) {
                    error(`server error: ${res["error"]}`);
                    return;
                }
                let list = res as unknown as UsageDetailType[];
                list = list.map((obj, index) => {
                    obj['key'] = `${index}`;
                    return obj;
                });
                resolver({
                    list,
                    query
                });
            });
    })
}

function UsageDetailPage() {
    const bottomRef = useRef(null);
    let { list, query } = useLoaderData() as UsageDetailLoadResult;
    const { t } = useTranslation();
    const { state } = useNavigation();
    const navigate = useNavigate();
    const [minutesDetailTarget, setMinutesDetailTarget] = useState<UsageMinutesTarget | undefined>(undefined);
    const [minutesDetail, setMinutesDetail] = useState<UsageMinutesResult | undefined>(undefined);

    useEffect(() => {
        if (minutesDetailTarget === undefined) { return; }
        const url = new URL(`${baseUrl}/roomMinutesUsage`);
        url.searchParams.append('uuid', minutesDetailTarget.uuid);
        url.searchParams.append('from', minutesDetailTarget.start.toString());
        url.searchParams.append('to', minutesDetailTarget.end.toString());
        url.searchParams.append('region', minutesDetailTarget.region);
        fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } })
            .then(res => res.json())
            .then(res => {
                if (res["error"] !== undefined) {
                    message.error(`server error: ${res["error"]}`);
                    return;
                }
                const list = res as unknown as UsageMinutesDetailType[];
                setMinutesDetail({ ...minutesDetailTarget, list });
                console.log(bottomRef.current);
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            });
    }, [minutesDetailTarget]);

    function navigateToSearchPage() {
        const url = new URL(`${baseUrl}/usageDetail`);
        url.searchParams.append('uuid', query.uuid);
        url.searchParams.append('region', query.region);
        const newPath = '/usageDetail' + url.search
        navigate(newPath);
    }

    return <div>
        <div>
            <Form
                name='room detail'
                labelCol={{ span: 2 }}
                onFinish={(value) => {
                    query = value;
                    navigateToSearchPage();
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
                    label={t('page.normal.region')}
                    name="region"
                >
                    <Select
                        style={{ width: 300 }}
                        options={regions.map(i => {
                            return {
                                value: i,
                                label: t(i)
                            }
                        })}
                    />
                </Form.Item>

                <Form.Item
                    help={`UTC+0 Date`}
                >
                    <Button type='primary' htmlType='submit'>{t('page.normal.search')}</Button>
                </Form.Item>
            </Form>
        </div >

        <div className='table-container' style={{ width: '98%' }}>
            <Table
                style={{ overflowX: 'scroll' }}
                columns={[
                    {
                        title: t('date'), dataIndex: 'timestamp', key: 'timestamp', render: (e) => {
                            const date = new Date(parseInt(e));
                            const isoDateStr = moment(date).utc().format('yyyy-MM-DD');
                            return <div>{isoDateStr}</div>
                        },
                    },
                    { title: t('cumulativeSessionsCount'), dataIndex: 'cumulativeSessionsCount', key: 'cumulativeSessionsCount' },
                    { title: t('cumulativeWritersCount'), dataIndex: 'cumulativeWritersCount', key: 'cumulativeWritersCount' },
                    { title: t('peakSessionsCount'), dataIndex: 'peakSessionsCount', key: 'peakSessionsCount' },
                    { title: t('peakWritersCount'), dataIndex: 'peakWritersCount', key: 'peakWritersCount' },
                    { title: t('cumulativeReadonlyCount'), dataIndex: 'cumulativeReadonlyCount', key: 'cumulativeReadonlyCount' },
                    { title: t('peakReadonlyCount'), dataIndex: 'peakReadonlyCount', key: 'peakReadonlyCount' },
                    {
                        title: t('detail'), dataIndex: 'timestamp', render: (e) => {
                            const start = e as unknown as number;
                            const end = start + (3600 * 24 * 1000);
                            const region = query.region;
                            return <FundFilled style={{ color: "#52c41a" }} onClick={() => {
                                setMinutesDetailTarget({ uuid: query.uuid, start, end, region});
                            }} />
                        }
                    }
                ]}
                dataSource={list}
                pagination={{
                    showTotal: () => <div>{t('page.counter', { count: list.length })}</div>,
                    position: ['bottomLeft'],
                    total: list.length
                }}
                scroll={{ y: 480 }}
                size={'small'}
                bordered={true}
                loading={state === 'loading'}>
            </Table>
        </div>

        <div style={{ width: '98%', height: '440px', display: minutesDetail === undefined ? 'none' : 'block' }}>
            {minutesDetail !== undefined && <ReactECharts
                style={{ width: '100%', height: '100%' }}
                option={{
                    title: {
                        text: moment(minutesDetailTarget.start).utc().format('yyyy-MM-DD')
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: ['readonly', 'write'].map(e => { return t(e); }),
                    },
                    xAxis: [{
                        type: 'time',
                        min: minutesDetail.list[0].segment,
                        max: minutesDetail.list[minutesDetail.list.length - 1].segment,
                        boundaryGap: false,
                        data: minutesDetail.list.map(e => e.segment),
                    }],
                    yAxis: [{
                        type: 'value',
                        boundaryGap: [0, '10%'],
                    }],
                    series: [
                        {
                            name: t('readonly'),
                            type: 'line',
                            symbol: 'none',
                            data: minutesDetail.list.map(e => [e.segment, e.readonlyPeakCount]),
                        },
                        {
                            name: t('write'),
                            type: 'line',
                            symbol: 'none',
                            data: minutesDetail.list.map(e => [e.segment, e.writersPeakCount]),
                        }
                    ]
                }}
            />}
        </div>
        <div ref={bottomRef} />
    </div >
}

export default UsageDetailPage;
