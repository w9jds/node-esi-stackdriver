export interface Header {
    mail_id?: number;
    subject?: string;
    from?: number;
    timestamp?: string;
    labels?: string;
    recipients?: Recipient[];
    is_read?: boolean;
}

export interface Mail {
    body?: string;
    from?: number;
    labels?: number[];
    read?: boolean;
    recipients?: Recipient[],
    subject?: string;
    timestamp?: string;
}

export enum RecipientType {
    ALLIANCE = 'alliance',
    CHARACTER = 'character',
    CORPORATION = 'corporation',
    MAILING_LIST = 'mailing_list'
}

export interface Recipient {
    recipient_type: RecipientType;
    recipient_id: number;
}