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
}
