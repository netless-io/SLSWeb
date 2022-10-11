import { DatePicker } from "antd";
import { RangePickerProps } from "antd/lib/date-picker";
import moment from "moment";

const { RangePicker } = DatePicker;
export function IRangePicker(props: RangePickerProps) {
    return <RangePicker
        style={{ width: 300 }}
        ranges={{
            '15分钟': [moment().subtract(15, 'minutes'), moment()],
            '今天': [moment().startOf('day'), moment()],
            '一周': [moment().subtract(1, 'week'), moment()],
            '一月': [moment().subtract(1, 'month'), moment()],
        }}
        defaultValue={[moment().startOf('day'), moment()]}
        disabledDate={current => {
            return current && current >= moment();
        }}
        {...props}
    />
}