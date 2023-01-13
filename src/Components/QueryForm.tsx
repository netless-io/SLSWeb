import { Space, Input, Form, Checkbox, Row, Col, Radio, Button } from "antd";
import moment from "moment";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { defaultSelKeys, optionKeys } from "../Const";
import { DownloadMenu } from "./DownloadMenu";
import { download } from "../utility";
import { IRangePicker } from "./RangePicker";

export const defaultUsingLocalTime = true;

export function defaultQueryElementsValue(localTime: boolean) {
    return {
        'keys': defaultSelKeys,
        'range': [moment().startOf('day'), moment()],
        'timeLocation': localTime ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined
    }
}

interface QueryElementsProps {
    showCustomQuery: boolean
    onFinish: (any) => void
    downloadHref: (string) => string
    onValuesChange?: (changedValues: any, values: any) => void
}

export function QueryForm(props: QueryElementsProps) {
    const { t } = useTranslation();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const [downloadHelp, setShowDownloadHelp] = useState(false);

    return (
        <Form
            name="basic"
            onFinish={props.onFinish}
            onValuesChange={props.onValuesChange}
            labelCol={{ span: 2 }}
            initialValues={defaultQueryElementsValue(defaultUsingLocalTime)}
        >
            {
                props.showCustomQuery ?
                    (<Form.Item
                        label={t('page.custom.query')}
                        name='customQuery'
                        rules={[{ required: true, message: t('page.custom.query.warning') }]}
                        hidden={!props.showCustomQuery}
                    >
                        <Input.TextArea style={{ width: 480 }} autoSize={{ minRows: 2, maxRows: 10 }} placeholder={t('page.custom.query.placeholder')} />
                    </Form.Item>) :
                    (<Form.Item
                        label={t('page.normal.uuid')}
                        name="uuid"
                        rules={[{ required: true, len: 32, message: t('page.normal.uuid.warnings') }]}
                    >
                        <Input style={{ width: 300 }} type='text' placeholder={t('page.normal.uuid.placeholder')} />
                    </Form.Item>)
            }

            <Form.Item
                label={t('page.normal.suid')}
                name="suid"
                hidden={props.showCustomQuery}
                rules={[{ required: false }]}
            >
                <Input style={{ width: 300 }} type='text' placeholder={t('page.normal.suid.placeholder')} />
            </Form.Item>


            <Form.Item
                label={t('page.normal.date')}
            >
                <Space>
                    <Form.Item name='range' noStyle>
                        <IRangePicker />
                    </Form.Item>
                    <div>{timeZone}</div>
                </Space>
            </Form.Item>

            <Form.Item
                label={t('page.normal.fields')}
                name={'keys'}
            >
                <Checkbox.Group>
                    {optionKeys.map((g, index) =>
                        <div key={`${index}`}>
                            <Row gutter={[144, 0]} style={{ fontWeight: 'bold' }}>
                                {(g!.list.map(k => <Col span={1} key={k} ><Checkbox value={k} style={{ lineHeight: '32px' }}>{k}</Checkbox></Col>))}
                            </Row>
                        </div>
                    )}
                </Checkbox.Group>
            </Form.Item>

            <Form.Item
                label={t('page.normal.timeLocation')}
                name='timeLocation'
            >
                <Radio.Group>
                    <Radio value={timeZone}>{t('page.normal.timeLocation.local')}</Radio>
                    <Radio value={undefined}>{t('page.normal.timeLocation.ISO')}</Radio>
                </Radio.Group>
            </Form.Item>

            <Form.Item
                help={(!props.showCustomQuery && downloadHelp) ? t('page.normal.download.tips') : ''}
            >
                <Button type='primary' htmlType='submit'>{t('page.normal.search')}</Button>
                <DownloadMenu
                    onDropDownOpenChange={open => setShowDownloadHelp(open)}
                    menuProps={{
                        onClick: e => download(props.downloadHref(e.key))
                    }}
                />
            </Form.Item>
        </Form>
    );
}