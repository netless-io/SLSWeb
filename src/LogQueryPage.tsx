import { Button, Space, Table, TablePaginationConfig, Checkbox, Row, Col, Radio, message } from 'antd';
import moment from "moment";
import { useState } from 'react';
import './App.css';
import { IRangePicker } from './Components/RangePicker';
import { defaultSelKeys, optionKeys } from './Const';
import { baseUrl, download, getColumns, queryElements } from './utility';

function LogQueryPage() {
    const [selNames, setSelNames] = useState(defaultSelKeys);
    const [formatTime, setFormatTime] = useState(true);
    const [columns, setColumns] = useState(getColumns(selNames, formatTime));
    const [timeRange, setTimeRange] = useState<moment.Moment[]>([moment().startOf('day'), moment()]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [listSource, setListSource] = useState<any[]>([]);
    const [tableParams, setTableParams] = useState<TablePaginationConfig>({ current: 1, pageSize: 30 })

    const handlerTableChange = (pagination: TablePaginationConfig) => {
        setTableParams(pagination);
        fetchData();
    }

    const getDownloadHref = (): string => {
        const url = new URL(`${baseUrl}/downloadLogs`);
        url.searchParams.append('from', `${timeRange[0].unix()}`);
        url.searchParams.append('to', `${timeRange[1].unix()}`);
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
                    <div style={{ width: 100 }}>{'日志时间'}</div>
                    <IRangePicker onChange={d => setTimeRange([d![0]!, d![1]!])}/>
                </Space>

                <Checkbox.Group
                    defaultValue={selNames}
                    onChange={list => {
                        const names = list as string[];
                        setSelNames(names);
                        setColumns(getColumns(names, formatTime));
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
                    setFormatTime(!formatTime);
                    setColumns(getColumns(selNames, !formatTime));
                }} value={formatTime ? 'locale' : 'unix'}>
                    <Radio value={'locale'}>本地时间</Radio>
                    <Radio value={'unix'}>Unix时间</Radio>
                </Radio.Group>

                <Space direction='horizontal'>
                    <Button type='primary' onClick={() => {
                        setTableParams({ current: 1 });
                        fetchData();
                    }}>
                        查询
                    </Button>
                    <Button type='link' onClick={()=>download(getDownloadHref())}>下载</Button>
                </Space>

                <Table
                    columns={columns}
                    dataSource={listSource}
                    onChange={handlerTableChange}
                    pagination={{
                        showTotal: () => <div>共 {total} 条</div>,
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
            </Space>
        </div>
    )
}

export default LogQueryPage;
