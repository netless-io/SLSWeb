import { Button, Dropdown, Menu, MenuProps } from "antd";

export function DownloadMenu(props: MenuProps) {
    return <Dropdown
        overlay={<Menu
            {...props}
            items={[{
                label: '下载 xlsx',
                key: 'xlsx'
            }, {
                label: '下载 csv',
                key: 'csv',
            }]}
        />}
    >
        <Button type='link' onClick={e => e.preventDefault()}>下载</Button>
    </Dropdown>
}