import { Button, Dropdown, Menu, MenuProps } from "antd";

export function DownloadMenu(props: MenuProps) {
    return <Dropdown
        overlay={<Menu
            {...props}
            items={[{
                label: 'download xlsx',
                key: 'xlsx'
            }, {
                label: 'download csv',
                key: 'csv',
            }]}
        />}
    >
        <Button type='link' onClick={e => e.preventDefault()}>Download</Button>
    </Dropdown>
}