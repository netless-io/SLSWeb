import { Form, Input, Space, DatePicker, Button, Spin, Select, Table, Dropdown, Menu } from "antd";
import moment, { Moment } from "moment";
import { useTranslation } from "react-i18next";
import { UsageItemType } from "../Components/UsageItemType";
import { baseUrl } from "../utility";
import { useLoaderData, useNavigation, useNavigate } from "react-router-dom";

export const regions = [
    "cn-hz",
    "us-sv",
    "in-mum",
    "sg",
    "gb-lon"
]

export interface UsageInvestType {
    team: string
    region: string
    from: Moment | string
}

interface UsageInvestResult {
    count: number
    list: any[]
    query?: UsageInvestType
}

function emptyUsageInvestQuery(): UsageInvestType {
    return {
        team: "",
        region: 'cn-hz',
        from: moment().utc().startOf('day'),
    }
}

export async function UsageInvestLoader(requestUrl: string) {
    const fromUrl = new URL(requestUrl);
    if (fromUrl.search.length <= 0) {
        return Promise.resolve({ count: 0, list: [], query: emptyUsageInvestQuery() });
    }
    const urlSearchParams = fromUrl.searchParams;
    const query = Object.fromEntries(urlSearchParams.entries()) as unknown as UsageInvestType;
    const from = query.from as string;

    const fromMoment = moment.unix(Number(from));
    const toMoment = moment.unix(Number(from)).add(1, 'day');
    const to = toMoment.unix().toString();
    query.from = fromMoment;

    const url = new URL(`${baseUrl}/teamRooms`);
    url.searchParams.append('from', from);
    url.searchParams.append('to', to);
    url.searchParams.append('region', query.region);
    url.searchParams.append('team', query.team);

    return new Promise((resolver, error) => {
        fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } })
            .then(res => res.json())
            .then(res => {
                if (res["error"] !== undefined) {
                    error(`server error: ${res["error"]}`);
                    return;
                }
                let list = res["list"] as UsageItemType[];
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

function UsageInvestigatePage() {
    let { count, list, query } = useLoaderData() as UsageInvestResult;

    const { t } = useTranslation();
    const { state } = useNavigation();
    const navigate = useNavigate();

    function navigateWith(aQuery: UsageInvestType) {
        const url = new URL(`${baseUrl}/teamRooms`);
        if (typeof aQuery.from === 'object') {
            url.searchParams.append('from', aQuery.from.unix().toString());
        }
        url.searchParams.append('region', aQuery.region);
        url.searchParams.append('team', aQuery.team);
        const newPath = '/usage' + url.search;
        navigate(newPath);
    }

    return (
        <div className="UsageInvestigate">
            <Form
                name='team info'
                labelCol={{ span: 2 }}
                onFinish={(value: UsageInvestType) => {
                    navigateWith(value);
                }}
                initialValues={query}
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
                            name='from'
                        >
                            <DatePicker disabledDate={d=>{return d.unix() > moment.now() / 1000;}}/>
                        </Form.Item>
                        <div>UTC</div>
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
            </Form >

        <Spin spinning={state === 'loading'}>
            <Table
                style={{ overflowX: 'scroll' }}
                columns={[
                    {
                        title: t('page.normal.uuid'),
                        dataIndex: "uuid",
                        key: "uuid",
                        render: (uuid) => {
                            return <Dropdown
                                trigger={['click']}
                                overlay={<Menu items={[
                                    {
                                        label: t('turnToRoomLog'),
                                        key: 'log',
                                        onClick: () => {
                                            const match = list.find((e) => {
                                                return e['uuid'] === uuid;
                                            });
                                            const mid = moment.unix(match['timestamp'] / 1000);
                                            const to = mid.add(1, 'day');
                                            const from = to.subtract(1, 'day');
                                            const url = new URL(`${baseUrl}`);
                                            url.searchParams.append('uuid', uuid);
                                            url.searchParams.append('from', from.unix().toString());
                                            url.searchParams.append('to', to.unix().toString());
                                            url.searchParams.append('page', '1');
                                            url.searchParams.append('pageSize', '30');
                                            const path = '/normal' + url.search;
                                            navigate(path);
                                        }
                                    },
                                    {
                                        label: t('turnToUsageDetail'),
                                        key: 'detail',
                                        onClick: () => {
                                            const url = new URL(`${baseUrl}`);
                                            url.searchParams.append('uuid', uuid);
                                            url.searchParams.append('region', query.region);
                                            const path = '/usageDetail' + url.search;
                                            navigate(path);
                                        }
                                    },
                                ]} />}>
                                <a onClick={(e) => e.preventDefault()}>{uuid}</a>
                            </Dropdown>
                        }
                    },
                    {
                        title: t('page.usage.count'),
                        dataIndex: 'timeCount',
                        key: 'timeCount',
                        defaultSortOrder: 'descend',
                        sorter: (a, b) => a.timeCount - b.timeCount
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
                dataSource={list}
                pagination={{
                    showTotal: () => <div>{t('page.counter', { count })}</div>,
                    position: ['bottomLeft'],
                    total: count
                }}
                scroll={{ y: 480 }}
                size={'small'}
                bordered={true}
            />
        </Spin>
        </div >
    )
}

export default UsageInvestigatePage;