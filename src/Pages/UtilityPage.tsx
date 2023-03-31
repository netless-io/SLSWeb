import { Button, Divider, Form, Input, Typography, message } from "antd";
import { useTranslation } from "react-i18next";

interface UtilityPageProps {
    uuid: string
    token: string
}
interface DecodeTokenResult {
    ak: string
    nonce: string
    role: string
    sig: string
    uuid: string
    expireAt: string
}
export default function UtilityPage() {
    const { t } = useTranslation();

    function commit(value: UtilityPageProps) {
        const { uuid, token } = value;
        // check token prefix 'NETLESSROOM_'
        if (!token.startsWith('NETLESSROOM_')) {
            message.error("Invalid Token, should start with 'NETLESSROOM_'");
            return
        }
        // Remove 'NETLESSROOM_' prefix
        const tokenWithoutPrefix = token.slice(12);
        // base64 decode.
        const decoded = atob(tokenWithoutPrefix);
        // split with '&'
        const decodedArray = decoded.split('&');
        // split with '='
        const decodedObject = decodedArray.reduce((acc, cur) => {
            const [key, value] = cur.split('=');
            acc[key] = value;
            return acc;
        }, {} as DecodeTokenResult);
        if (decodedObject.uuid !== uuid) {
            message.error("Invalid Token, uuid not match");
            return
        }
        // get current timestamp as number.
        const now = new Date().getTime();
        // check if expire.
        if (now > Number(decodedObject.expireAt)) {
            message.error("Invalid Token, token expired");
            return
        }
        message.success("Token static check valid. Try use it to join room.");
    }

    return <div>
        <Typography.Title level={5}>{t('tokenvalid')}</Typography.Title>
        <Form
            name="tokenValid"
            onFinish={commit}
        >
            <Form.Item
                label={t('page.normal.uuid')}
                name="uuid"
                rules={[{ required: true, len: 32, message: t('page.normal.uuid.warnings') }]}
            >
                <Input style={{ width: 300 }} type='text' placeholder={t('page.normal.uuid.placeholder')} />
            </Form.Item>
            <Form.Item
                label={t('page.normal.token')}
                name="token"
                rules={[{ required: true, message: "" }]}
            >
                <Input.TextArea autoSize={true} placeholder={t('page.normal.token.placeholder')} />
            </Form.Item>

            <Form.Item>
                <Button type='primary' htmlType='submit'>{'Check'}</Button>
            </Form.Item>
        </Form>

        <Divider></Divider>
    </div >
}