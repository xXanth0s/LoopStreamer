import { PORTALS } from '../enums/portals.enum';
import { PROVIDORS } from '../enums/providors.enum';
import { LANGUAGE } from '../enums/language.enum';
import { LINK_TYPE } from '../enums/link-type.enum';

export interface LinkModel {
    key: string;
    href: string;
    parentKey: string;
    portal?: PORTALS;
    providor?: PROVIDORS;
    language: LANGUAGE;
    type: LINK_TYPE;
    dateUpdated: Date;
}

export function getEmptyLinkModel(): LinkModel {
    return {
        key: '',
        href: '',
        parentKey: '',
        language: LANGUAGE.NONE,
        type: LINK_TYPE.NONE,
        dateUpdated: new Date(),
    };
}
