import { Form, Input, Space, DatePicker, Button, Spin, Select, message, Table, TablePaginationConfig } from "antd";
import moment from "moment";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UsageItemType } from "../Components/UsageItemType";
import { baseUrl } from "../utility";

const regions = [
    "cn-hz",
    "us-sv",
    "in-mum",
    "sg",
    "gb-lon"
]

function UsageInvestigatePage() {
    const { t } = useTranslation();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const [query, setQuery] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [usageListSource, setUsageListSource] = useState<UsageItemType[] | undefined>(undefined);
    const [total, setTotal] = useState(0);

    function fetchData() {
        if (query === undefined) { return; }
        setLoading(true);
        const url = new URL(`${baseUrl}/teamRooms`);
        const date = query['date'] as moment.Moment;
        const from = date.startOf('day').unix();
        const to = date.endOf('day').unix();
        url.searchParams.append('from', from.toString());
        url.searchParams.append('to', to.toString());
        url.searchParams.append('region', query['region']);
        url.searchParams.append('team', query['team']);

        fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } })
            .then(res => res.json())
            .then(res => {
                if (res["error"] !== undefined) {
                    message.error(`server error: ${res["error"]}`, 3);
                    setLoading(false);
                    return
                }
                let list = res["list"] as UsageItemType[];
                setTotal(res["count"]);
                setUsageListSource(list);
                setLoading(false);
            });
    }

    return (
        <div className="UsageInvestigate">
            <Form
                name='team info'
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
                    label={'Team'}
                    name="team"
                    rules={[{ required: true, min: 1, message: t('page.normal.team.warnings') }]}
                >
                    <Input style={{ width: 300 }} type='text' placeholder={'Team UUID'} />
                </Form.Item>


                <Form.Item
                    label={t('page.normal.region')}
                    name="region"
                    initialValue={regions[0]}
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
                    label={t('page.normal.date')}
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
                        <div style={{ color: 'gray' }}>
                            {t('page.usage.tips')}
                        </div>
                    </Space>
                </Form.Item>
            </Form>

            <Spin spinning={loading}>
                <Table
                    style={{ overflowX: 'scroll' }}
                    columns={[
                        {
                            title: t('page.normal.uuid'),
                            dataIndex: "uuid",
                            key: "uuid"
                        },
                        {
                            title: t('page.usage.count'),
                            dataIndex: 'timeCount',
                            key: 'timeCount'
                        },
                        {
                            title: t('page.usage.updateDate'),
                            dataIndex: 'timestamp',
                            key: 'timestamp',
                            render: (e: any) => {
                                const n = parseInt(e);
                                if (n <= 0) {
                                    return <div />
                                }
                                const date = new Date(n);
                                const str = date.toISOString();
                                return <div>{str}</div>
                            }
                        }
                    ]}
                    dataSource={usageListSource}
                    pagination={{
                        showTotal: () => <div>{t('page.counter', { count: total })}</div>,
                        position: ['bottomLeft'],
                        total: total
                    }}
                    scroll={{ y: 480 }}
                    size={'small'}
                    bordered={true}
                />
            </Spin>
        </div>
    )
}

export default UsageInvestigatePage;