import { Timeline } from "antd";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { KeyMessageItem, KeyMessageType } from "../Types/ChartItemType";

export const timeLineWidth = 320;
export const timeLineHeight = 244;
export function LogChartTimeLine(props: { keyMessages: KeyMessageItem[] }) {
    const { t } = useTranslation();

    return <Timeline style={{
        width: timeLineWidth,
        height: timeLineHeight,
        whiteSpace: 'pre-line',
        paddingTop: 10,
        overflowY: 'auto',
        overflowX: 'hidden',
    }}
        mode={'left'}>
        {props.keyMessages.map(i => {
            return <Timeline.Item
                key={i.createdat}
                label={moment(i.createdat).format('yyyy-MM-DD hh:mm:ss')}
                color={i.message.type === KeyMessageType.error ? 'red' : undefined}
            >
                {t(i.message.localizedString, { ns: 'key_message' })}
            </Timeline.Item>;
        })}
    </Timeline>
}