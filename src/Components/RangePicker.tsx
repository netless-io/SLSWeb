import { DatePicker } from "antd";
import { RangePickerProps } from "antd/lib/date-picker";
import moment from "moment";

const { RangePicker } = DatePicker;
export function IRangePicker(props: RangePickerProps) {
    return <RangePicker
    className="range-picker"
        style={{ width: 300 }}
        ranges={{
            'Yesterday': [moment().startOf('day').subtract(1), moment().startOf('day')],
            'Today': [moment().startOf('day'), moment()],
            'This Week': [moment().subtract(1, 'week'), moment()],
            'This Month': [moment().subtract(1, 'month'), moment()],
        }}
        // defaultValue={[moment().startOf('day'), moment()]}
        disabledDate={current => {
            return current && current >= moment();
        }}
        {...props}
    />
}