import { Button, Space, Table, TablePaginationConfig, Checkbox, Row, Col, Radio, message } from 'antd';
import moment, { locale } from "moment";
import { useState } from 'react';
import './App.css';
import { IRangePicker } from './Components/RangePicker';
import { defaultSelKeys, optionKeys } from './Const';
import { DownloadMenu } from './DownloadMenu';
import { baseUrl, download, getColumns, queryElements } from './utility';

function LogQueryPage() {
    const [selNames, setSelNames] = useState(defaultSelKeys);
    const [usingLocalTime, setUsingLocalTime] = useState(true);
    const [columns, setColumns] = useState(getColumns(selNames, usingLocalTime));
    const [timeRange, setTimeRange] = useState<moment.Moment[]>([moment().startOf('day'), moment()]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [listSource, setListSource] = useState<any[]>([]);
    const [tableParams, setTableParams] = useState<TablePaginationConfig>({ current: 1, pageSize: 30 })

    const handlerTableChange = (pagination: TablePaginationConfig) => {
        setTableParams(pagination);
        fetchData();
    }

    const getDownloadHref = (fileType: string): string => {
        const url = new URL(`${baseUrl}/downloadLogs`);
        url.searchParams.append('from', `${timeRange[0].unix()}`);
        url.searchParams.append('to', `${timeRange[1].unix()}`);
        if (usingLocalTime) {
            url.searchParams.append('timeLocation', `${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
        }
        url.searchParams.append('fileType', fileType);
        selNames.forEach(i => {
            url.searchParams.append("keys", i);
        })

        const uuid = (document.getElementById('uuid') as any).value;
        url.searchParams.append('uuid', uuid);
        const uid = (document.getElementById('uid') as any).value as string;
        if (uid.length > 0) {
            url.searchParams.append('suid', uid)
        }
        return url.toString()
    }

    const fetchData = () => {
        setLoading(true);
        const url = new URL(`${baseUrl}/logs`);
        url.searchParams.append('from', `${timeRange[0].unix()}`);
        url.searchParams.append('to', `${timeRange[1].unix()}`);
        const uuid = (document.getElementById('uuid') as any).value;
        if (uuid.length <= 0) {
            message.info("room uuid is empty");
            setLoading(false);
            return;
        }
        url.searchParams.append('uuid', uuid);
        url.searchParams.append('page', `${tableParams.current}`);
        url.searchParams.append('pageSize', `${tableParams.pageSize}`);

        const uid = (document.getElementById('uid') as any).value as string;
        if (uid.length > 0) {
            url.searchParams.append('suid', uid)
        }

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
            <Space direction='vertical' align="start" style={{ width: '100%' }}>
                {queryElements(false)}
                <Space>
                    <div style={{ width: 100 }}>{'date'}</div>
                    <IRangePicker onChange={d => {
                        const start = d![0]!;
                        const end = d![1]!;
                        if (start?.unix() === end?.unix()) {
                            const s = start?.startOf('day');
                            const e = end?.endOf('day');
                            setTimeRange([s, e]);
                        } else {
                            setTimeRange([start, end!]);
                        }
                    }} />
                    <div>{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
                </Space>

                <Checkbox.Group
                    defaultValue={selNames}
                    onChange={list => {
                        const names = list as string[];
                        setSelNames(names);
                        setColumns(getColumns(names, usingLocalTime));
                    }}
                >
                    <Space direction='vertical'>
                        {optionKeys.map((g, index) =>
                            <div key={`${index}`}>
                                {g!.title}
                                <Row gutter={[120, 0]} style={{ fontWeight: 'bold' }}>
                                    {(g!.list.map(k => <Col span={1} key={k}><Checkbox value={k}>{k}</Checkbox></Col>))}
                                </Row>
                            </div>
                        )}
                    </Space>
                </Checkbox.Group>

                <Radio.Group onChange={() => {
                    setUsingLocalTime(!usingLocalTime);
                    setColumns(getColumns(selNames, !usingLocalTime));
                }} value={usingLocalTime ? 'locale' : 'unix'}>
                    <Radio value={'locale'}>local time</Radio>
                    <Radio value={'unix'}>iso time</Radio>
                </Radio.Group>

                <Space direction='horizontal'>
                    <Button type='primary' onClick={() => {
                        setTableParams({ ...tableParams, current: 1 });
                        fetchData();
                    }}>
                        Search
                    </Button>
                    <DownloadMenu
                        onClick={e => download(getDownloadHref(e.key))}
                    />
                    <div style={{ fontSize: 12 }}>Current download count limit is 10000. Go to 'Custom Room Log Query' page if you want more.</div>
                </Space>

                <div className='table-container' style={{ width: '98%'}}>
                    <Table
                        style={{ overflowX: 'scroll' }}
                        columns={columns}
                        dataSource={listSource}
                        onChange={handlerTableChange}
                        pagination={{
                            showTotal: () => <div>共 {total} 条</div>,
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
            </Space>
        </div>
    )
}

export default LogQueryPage;
