import moment from "moment"
import ReactECharts from 'echarts-for-react';
import { Checkbox, Empty, Select } from "antd";
import { ReactPortal, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import kmr from '../Resources/key_message_map.json';
import { KeyMessage, KeyMessageType, LogChartItem } from "../Types/ChartItemType";
import { LogChartTimeLine, timeLineWidth, timeLineHeight } from "./LogChartTimeLine";
import { LogItemType } from "./LogItemType";

const { Option } = Select;

const keyMessageMap: Map<string, KeyMessage> = new Map();
kmr.forEach(i => {
    const key = i[0] as string;
    const localizedString = i[1] as string;
    const type = i[2] as KeyMessageType;
    const order = i[3] as number;
    keyMessageMap.set(key, {
        localizedString,
        type,
        order
    })
});

function getChartItemsFor(aList: any[]): {
    interval: number,
    allData: { [key: string]: LogChartItem[] },
    minDate: number,
    maxDate: number,
} {
    // 保证是升序的
    const list = aList.sort((i, j) => {
        return i.createdat - j.createdat;
    });
    const unprocessedUids = list.map(i => i['suid'] as string);
    // 去重后的uid
    const allUIDs: string[] = unprocessedUids.filter((i, p) => {
        return unprocessedUids.indexOf(i) === p;
    });
    // 获取时间区间
    let minDate: number = Number.MAX_SAFE_INTEGER;
    let maxDate: number = -1;
    list.forEach(i => {
        const v = parseInt(i['createdat']);
        minDate = v < minDate ? v : minDate;
        maxDate = v > maxDate ? v : maxDate;
    });
    // 计算 X 轴间隔
    const startHour = moment(minDate).startOf('hour');
    const endHour = moment(maxDate).endOf('hour');
    const intervalUnit: moment.unitOfTime.DurationConstructor = 'minute';
    // 5 分钟一个节点
    let intervalCount = 5;
    const interval = 60 * intervalCount * 1000;

    let intervals: number[] = [startHour.unix()];
    let temp = startHour;
    while (temp.isBefore(endHour)) {
        const next = temp.add(intervalCount, intervalUnit);
        if (next.isBefore(endHour)) {
            intervals.push(next.unix());
        }
        temp = next;
    }
    intervals.push(endHour.unix());

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
        const msg = i['message'] as string;
        let keyMsg: KeyMessage | undefined;
        if (keyMessageMap.hasOwnProperty(msg)) {
            keyMsg = keyMessageMap[msg];
        } else {
            keyMessageMap.forEach((value, key) => {
                if (msg.startsWith(key)) {
                    keyMsg = value;
                }
            });
        }
        if (keyMsg !== undefined) {
            allData[suid][intervalIndex].count += 1;
            allData[suid][intervalIndex].keyMessages.push({ createdat: time, message: keyMsg });
        }
    });

    allUIDs.forEach(uid => {
        const msgs = allData[uid];
        const allEmpty = msgs.every(i => i.count <= 0)
        if (allEmpty) {
            delete allData[uid];
        }
    });

    return { interval, allData, minDate, maxDate };
}

function dataSeries(name: string, aList: any[], t: any) {
    const list = aList
        .map(i => {
            const value = [i['createdat'] * 1000, i.suid];
            i.value = value;
            return i
        });
    return {
        name: name,
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
                const km = sorted[0].message;
                if (km.order >= 2) {
                    return t(km.localizedString, { ns: 'key_message' });
                }
                return undefined;
            }
        },
        itemStyle: {
            opacity: 1,
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
        data: list,
    }
}

interface LogTimeLineChartState {
    interval: number
    allData: { [key: string]: LogChartItem[] }
    minDate: number
    maxDate: number
    allDataUids: string[]
    selectedDataUids: string[]
    series: any[]
}

function generateChartState(source: LogItemType[], t: any): LogTimeLineChartState {
    const chartsResult = getChartItemsFor(source);
    const allDataUids = Object.keys(chartsResult.allData);
    const selectedDataUids = allDataUids;
    // const selectionCount = 99;
    // const selectedDataUids = allDataUids.length <= selectionCount ? allDataUids : allDataUids.slice(0, selectionCount);
    const series = selectedDataUids.map(uid => dataSeries(uid, chartsResult.allData[uid], t));
    return {
        interval: chartsResult.interval,
        allData: chartsResult.allData,
        minDate: chartsResult.minDate,
        maxDate: chartsResult.maxDate,
        allDataUids: allDataUids,
        selectedDataUids,
        series: series,
    }
}

interface LogTimeLineChartProps {
    source: LogItemType[]
}

export function LogTimeLineChart(props: LogTimeLineChartProps) {
    const { t } = useTranslation();

    const [selectedNodeIndex, setSelectedNodeIndex] = useState<{ index: number, uid: string } | undefined>(undefined);
    const [timelineContainer] = useState(() => { return document.createElement('div') });
    const [portal, setPortal] = useState<ReactPortal | null>(null);
    const [chartState, setChartState] = useState<LogTimeLineChartState | undefined>(undefined);
    const { interval, allData, minDate, maxDate, allDataUids = [], selectedDataUids = [] } = { ...chartState };
    const yh = selectedDataUids.length * 122;
    const yAxisHeight = Math.max(Math.min(yh, 3840), 320);

    useEffect(() => {
        if (selectedNodeIndex === undefined) { return; }
        const msgs = allData[selectedNodeIndex.uid][selectedNodeIndex.index].keyMessages;
        setPortal(ReactDOM.createPortal(<LogChartTimeLine keyMessages={msgs} uid={selectedNodeIndex.uid} />, timelineContainer));
    }, [JSON.stringify(selectedNodeIndex)]);

    useEffect(() => {
        if (props.source === undefined) {
            setChartState(undefined);
            return;
        }
        const state = generateChartState(props.source, t);
        setChartState(state);
    }, [props.source])

    function updateChartState(partial: Partial<LogTimeLineChartState>) {
        const newState = { ...chartState, ...partial };
        newState.series = newState.selectedDataUids.map(uid => dataSeries(uid, newState.allData[uid], t));
        setChartState(newState);
    }

    if (chartState === undefined || chartState.allDataUids.length === 0) {
        return <Empty />
    }

    const isAllSelect = chartState.allDataUids.length === chartState.selectedDataUids.length;
    const isAllUnSelect = chartState.selectedDataUids.length === 0;
    return <div className="chart-wrapper" style={{ width: '100%' }}>
        <Checkbox
            indeterminate={!(isAllSelect || isAllUnSelect)}
            checked={isAllSelect}
            onChange={() => {
                if (isAllSelect) {
                    updateChartState({ selectedDataUids: [] });
                } else {
                    updateChartState({ selectedDataUids: chartState.allDataUids });
                }
            }}>
            {t('page.chart.checkall')}
        </Checkbox>

        <Select
            mode="multiple"
            value={selectedDataUids}
            onChange={e => updateChartState({ selectedDataUids: e })}
            style={{ width: '100%' }}
            placeholder={t('page.chart.userpick.placeholder', { count: allDataUids.length })}
        >
            {allDataUids.map(i => {
                return (<Option key={i}>{i}</Option>)
            })}
        </Select>

        <div className="chart-container" style={{ width: '100%', height: yAxisHeight }}>
            {portal}
            <ReactECharts
                style={{ width: '100%', height: '100%' }}
                option={{
                    grid: {
                        show: true,
                        borderWidth: 1,
                        opacity: 0.3,
                    },
                    xAxis: {
                        type: 'time',
                        axisPointer: { type: 'none', triggerTooltip: false, },
                        min: 'dataMin',
                        max: 'dataMax',
                        axisLine: { show: true, },
                    },
                    yAxis: {
                        data: selectedDataUids,
                        show: true, type: 'category',
                        gridIndex: 0,
                        axisLine: { show: false, },
                        splitLine: {
                            alignWithLabel: true,
                            show: true,
                            interval: 0,
                            lineStyle: {
                                color: '#448df8',
                                width: 1,
                                opacity: 0.7,
                            }
                        },
                        axisTick: {
                            show: false,
                            alignWithLabel: true,
                        },
                        axisPointer: {
                            show: false
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
                    series: chartState.series,
                    tooltip: {
                        trigger: 'item',
                        position: (_, __, dom, rect, ___) => {
                            if (rect === null) { return []; }
                            const scrollLeft = dom.parentElement.parentElement.scrollLeft;
                            const scrollTop = dom.parentElement.parentElement.scrollTop;
                            const mouseX = rect.x - scrollLeft;
                            const mouseY = rect.y - scrollTop;
                            const circleWidth = rect.width <= 30 ? 30 : rect.width;
                            const x = mouseX <= timeLineWidth ? rect.x : rect.x - timeLineWidth - circleWidth;
                            const y = mouseY <= timeLineHeight ? rect.y : rect.y - timeLineHeight;
                            return [x, y];
                        },
                        triggerOn: 'mousemove',
                        enterable: true,
                        appendToBody: false,
                        formatter: (i: Object, _) => {
                            if (!i.hasOwnProperty('dataIndex')) {
                                return undefined;
                            }
                            if (!i.hasOwnProperty('seriesName')) {
                                return undefined;
                            }
                            const uid = (i as any).seriesName;
                            const index = (i as any).dataIndex as number;
                            const s = { index, uid };
                            if (JSON.stringify(s) !== JSON.stringify(selectedNodeIndex)) {
                                setSelectedNodeIndex({ index, uid });
                            }
                            if (allData[uid][index].count <= 0) {
                                return undefined;
                            }
                            return timelineContainer
                        }
                    }
                }}
            />
        </div>
    </div>
}