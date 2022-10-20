import moment, { max, min } from "moment"
import ReactECharts from 'echarts-for-react';
import { Timeline } from "antd";
import { ReactPortal, useEffect, useState } from "react";
import ReactDOM from "react-dom";

enum KeyMessageType {
    normal = 'normal',
    error = 'error'
}

interface KeyMessage {
    localizedString: string
    type: KeyMessageType
    order: number
}

interface KeyMessageItem {
    createdat: number,
    message: KeyMessage
}

interface LogChartItem {
    createdat: number
    suid: string
    count: number
    keyMessages: KeyMessageItem[],
    value: any[]
}

const keyMessageMap: { [key: string]: KeyMessage } = {
    'change room phase to reconnecting': {
        localizedString: 'reconnecting',
        type: KeyMessageType.normal,
        order: 1
    },
    'change room phase to connected': {
        localizedString: 'connected',
        type: KeyMessageType.normal,
        order: 1
    },
    'change room phase to disconnected': {
        localizedString: 'disconnected',
        type: KeyMessageType.normal,
        order: 1
    },
    'connect failed': {
        localizedString: 'connect failed',
        type: KeyMessageType.error,
        order: 2
    }
}

const timeLineWidth = 320;
const timeLineHeight = 244;
function TimeLines(props: { keyMessages: KeyMessageItem[] }) {
    return <Timeline style={{ 
        width: timeLineWidth, 
        height: timeLineHeight, 
        overflowY: 'scroll', 
        overflowX: 'hidden',
        paddingTop: 10,
        }} 
        mode={'left'}>
        {props.keyMessages.map(i => {
            return <Timeline.Item
                key={i.createdat}
                label={moment(i.createdat).format('yyyy-MM-DD hh:mm:ss')}
                color={i.message.type === KeyMessageType.error ? 'red' : undefined}
                >
                {i.message.localizedString}
            </Timeline.Item>;
        })}
    </Timeline>
}

export function LogTimeLineChart(props: { source: any[] }) {
    // const list = props.source;

    const json = require('./test.json');
    // 保证是升序的
    const list = json.list.sort((i, j) => {
        return i.createdat - j.createdat;
    });

    const uids = list.map(i => {
        return i['suid'];
    });
    const allUIDs: string[] = uids.filter((i, p) => {
        return uids.indexOf(i) === p;
    });
    let ld: number = Number.MAX_SAFE_INTEGER;
    let md: number = -1;
    list.forEach(i => {
        const v = parseInt(i['createdat']);
        ld = v < ld ? v : ld;
        md = v > md ? v : md;
    });

    const startHour = moment(ld).startOf('hour');
    const endHour = moment(md).endOf('hour');

    const intervalUnit: moment.unitOfTime.DurationConstructor = 'minute';
    const intervalCount = 15;
    const interval = 60 * 15 * 1000;
    // const intervalCount = 5;
    // const interval = 60 * intervalCount * 1000;

    let intervals: number[] = [startHour.unix()];
    let t = startHour;
    while (t.isBefore(endHour)) {
        const next = t.add(intervalCount, intervalUnit);
        if (next.isBefore(endHour)) {
            intervals.push(next.unix());
        }
        t = next;
    }
    intervals.push(endHour.unix());

    let xAsixlength = intervals.length * 80;
    xAsixlength = xAsixlength <= 720 ? 720 : xAsixlength;

    let allData: { [key: string]: LogChartItem[] } = {};
    allUIDs.forEach(uid => {
        allData[uid] = intervals.map(i => {
            return {
                createdat: i,
                count: 0,
                suid: uid,
                keyMessages: [],
                value: []
            }
        });;
    });

    let intervalIndex = 0;
    list.forEach(i => {
        const time = parseInt(i['createdat']);
        let delta = time - intervals[intervalIndex] * 1000;

        while (delta > interval) {
            intervalIndex += 1;
            delta = time - intervals[intervalIndex] * 1000;
        }

        const suid = i['suid'] as string;
        const km = keyMessageMap[i['message']];
        if (km !== undefined) {
            allData[suid][intervalIndex].count += 1;
            allData[suid][intervalIndex].keyMessages.push({ createdat: time, message: km });
        }
    });

    let data: LogChartItem[] = [];
    allUIDs.forEach(id => {
        data.push(...allData[id]);
    });

    const dataLength = data.length;
    data = data.filter((i, index) => {
        if (index === 0) { return true; }
        if (index === dataLength - 1) { return true; }
        return i.count > 0;
    }).map((i, _) => {
        const value = [i['createdat'] * 1000, i.suid];
        i.value = value;
        return i;
    });

    const displayUIDs = data.filter(i => {
        return i.count > 0
    }).map(i => i.suid);
    const yAxisLength =  displayUIDs.length * 66;

    const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | undefined>(undefined);
    const [timelineContainer] = useState(() => { return document.createElement('div') });
    const [portal, setPortal] = useState<ReactPortal | null>(null)

    useEffect(() => {
        if (selectedNodeIndex === undefined) {
            return;
        }
        const msgs = data[selectedNodeIndex].keyMessages;
        setPortal(ReactDOM.createPortal(<TimeLines keyMessages={msgs} />, timelineContainer));
    }, [selectedNodeIndex]);

    return <div className="chart-container" style={{ width: 1024, height: 420, overflow: 'scroll' }}>
        {portal}
        <ReactECharts
            style={{ width: xAsixlength, height: yAxisLength }}
            option={{
                // legend: {
                //     data: ['Punch Card'],
                //     left: 'right',
                // },
                xAxis: {
                    type: 'time',
                    axisPointer: {
                        type: 'none',
                        triggerTooltip: false,
                    },
                    min: 'dataMin',
                    max: 'dataMax',
                    minInterval: interval,
                    maxInterval: interval,
                    axisLine: {
                        show: true,
                    },
                },
                yAxis: {
                    show: true,
                    type: 'category',
                    data: displayUIDs,
                    axisLine: {
                        show: false,
                    },
                    axisPointer: {
                        z: 0,
                        show: true,
                        type: 'line',
                        lineStyle: {
                            width: 2,
                            type: 'solid',
                            color: '#448df8',
                        },
                        label: {
                            show: false
                        },
                        triggerTooltip: false,
                        handle: {
                            show: true,
                            size: 0,
                        }
                    },
                    axisLabel: {
                        show: true,
                        width: 44,
                        fontSize: 16,
                        overflow: 'break',
                        formatter: (i) => {
                            if (typeof i !== 'string') {
                                return undefined;
                            }
                            const length = i.length;
                            const showingLength = 4;
                            if (length <= showingLength) {
                                return i;
                            }
                            return i.substring(length - showingLength, length);
                        }
                    },
                },
                series: [
                    {
                        name: 'user_key_events',
                        type: 'scatter',
                        symbol: 'circle',
                        symbolSize: (_, k: Object) => {
                            if (!k.hasOwnProperty('data')) {
                                return 0;
                            }
                            const item: LogChartItem = (k as any).data;
                            if (item === undefined) {
                                return 0;
                            }
                            const count = item.count;
                            if (count <= 0) { return 0; }
                            if (count <= 3) { return 10; }
                            if (count <= 5) { return 30; }
                            return 50;
                        },
                        label: {
                            show: true,
                            position: 'top',
                            formatter: (i) => {
                                const item: LogChartItem = i.data
                                if (item.count <= 0) { return undefined; }
                                const sorted = item.keyMessages.sort((i, j) => {
                                    return j.message.order - i.message.order;
                                });
                                const q = sorted.find(i=> {
                                    return i.message.order === 2;
                                });
                                if (q !== undefined) {
                                    console.log({sorted})    ;
                                }
                                
                                return sorted[0].message.localizedString;
                            }
                        },
                        itemStyle: {
                            color: (i) => {
                                const item = i.data as LogChartItem;
                                const error = item.keyMessages.find(i => {
                                    return i.message.type === KeyMessageType.error;
                                });
                                if (error !== undefined) {
                                    return 'red'
                                }
                                return '#448df8';
                            }
                        },
                        data: data,
                    }
                ],
                tooltip: {
                    trigger: 'item',
                    position: (_, __, dom, rect, ___) => {
                        if (rect === null) { return []; }
                        const scrollLeft = dom.parentElement.parentElement.scrollLeft;
                        const scrollTop = dom.parentElement.parentElement.scrollTop;
                        const mouseX = rect.x - scrollLeft;
                        const mouseY = rect.y - scrollTop;
                        const x = mouseX <= timeLineWidth ? rect.x : rect.x - timeLineWidth;
                        const y = mouseY <= timeLineHeight ? rect.y : rect.y - timeLineHeight;
                        return [x, y];
                    },
                    enterable: true,
                    formatter: (i: Object, _) => {
                        if (!i.hasOwnProperty('dataIndex')) {
                            return undefined;
                        }
                        const index = (i as any).dataIndex;
                        setSelectedNodeIndex(index);
                        if (data[index].count <= 0) { return undefined; }
                        return timelineContainer
                    }
                }
            }}
        />
    </div>
}