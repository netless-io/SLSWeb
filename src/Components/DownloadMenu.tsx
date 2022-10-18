import { Button, Dropdown, Menu, MenuProps } from "antd";
import { useTranslation } from "react-i18next";

type DownloadMenuProps = {
    menuProps: MenuProps
    onDropDownOpenChange?: (open: boolean) => void
}

export function DownloadMenu(props: DownloadMenuProps) {
    const { t } = useTranslation();

    return <Dropdown
        onOpenChange={props.onDropDownOpenChange}
        placement='top'
        overlay={<Menu
            {...props.menuProps}
            items={[{
                label: t('page.normal.download.xlsx'),
                key: 'xlsx'
            }, {
                label: t('page.normal.download.csv'),
                key: 'csv',
            }]}
        />}
    >
        <Button type='link' onClick={e => e.preventDefault()}>{t('page.normal.download')}</Button>
    </Dropdown>
}