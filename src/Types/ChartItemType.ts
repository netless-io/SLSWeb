export enum KeyMessageType {
    normal = 'normal',
    error = 'error'
}

export interface KeyMessage {
    localizedString: string
    type: KeyMessageType
    order: number
}

export interface KeyMessageItem {
    createdat: number,
    message: KeyMessage
}

export interface LogChartItem {
    createdat: number
    suid: string
    count: number
    keyMessages: KeyMessageItem[],
    value: any[]
}