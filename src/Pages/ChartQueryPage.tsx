import { Button, DatePicker, Form, Input, message, Space, Spin } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogItemType } from '../Components/LogItemType';
import { LogTimeLineChart } from '../Components/LogTimeLineChart';
import { baseUrl } from '../utility';

const queryLogsMaxCountPerTime = 10000;
export function ChartQueryPage() {
    const { t } = useTranslation();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const [query, setQuery] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [chartListSource, setChartListSource] = useState<LogItemType[] | undefined>(undefined);

    const fetchData = () => {
        setLoading(true);
        const url = new URL(`${baseUrl}/customQuery/logs`);
        const date = query['date'] as moment.Moment;
        const from = date.startOf('day').unix();
        const to = date.endOf('day').unix();
        url.searchParams.append('from', from.toString());
        url.searchParams.append('to', to.toString());
        const uuid = query["uuid"];
        let suidQuery: string = "";
        if (query["suid"] !== undefined) {
            suidQuery = `and suid: ${query["suid"]}`;
        }
        const slsQuery = `uuid: ${uuid} ${suidQuery} | select * from log limit ${queryLogsMaxCountPerTime}`;
        url.searchParams.append('customQuery', slsQuery);

        fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } })
            .then(res => res.json())
            .then(res => {
                if (res["error"] !== undefined) {
                    message.error(`server error: ${res["error"]}`, 3);
                    setLoading(false);
                    return
                }
                let list = res["list"] as LogItemType[];
                setChartListSource(list);
                setLoading(false);
            });
    }

    return <div>
        <Form
            name='room info'
            labelCol={{ span: 2 }}
            onFinish={fetchData}
            onValuesChange={(_, value) => {
                setQuery(value);
            }}
            initialValues={{
                'date': moment().startOf('day')
            }}
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
                name='date'
            >
                <Space>
                    <Form.Item
                        noStyle
                        name='date'
                    >
                        <DatePicker />
                    </Form.Item>
                    <div>{timeZone}</div>
                </Space>
            </Form.Item>



            <Form.Item >
                <Space>
                    <Button type='primary' htmlType='submit'>{t('page.normal.search')}</Button>
                    {
                        chartListSource &&
                        <div style={{ color: 'gray' }}>
                            {t('page.chart.result.tips', { count: chartListSource.length, total: queryLogsMaxCountPerTime })}
                        </div>
                    }
                </Space>
            </Form.Item>
        </Form>

        <Spin spinning={loading}>
            <LogTimeLineChart
                source={chartListSource}
            />
        </Spin>
    </div>
}