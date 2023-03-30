import { Menu, Dropdown, Typography } from "antd";
import { useTranslation } from "react-i18next";

export default function LanguagePicker() {
    const { t, i18n } = useTranslation();

    const lngs = {
        en: { key: 'en', label: 'English' },
        zh: { key: 'zh', label: '简体中文' }
    };

    const lngItems = Object.keys(lngs).map(e => { return lngs[e]; });

    const lngsMenu = (<Menu
        selectable
        items={lngItems}
        defaultSelectedKeys={[lngs[i18n.resolvedLanguage].key]}
        onClick={e => {
            i18n.changeLanguage(e.key)
        }}
    >
    </Menu>);

    return <Dropdown overlay={lngsMenu} trigger={['click']}>
        <Typography.Link>
            {t('app.selectLanguage') + ": " + lngs[i18n.resolvedLanguage].label}
        </Typography.Link>
    </Dropdown>
}