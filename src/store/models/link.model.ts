import { PORTALS } from '../enums/portals.enum';
import { PROVIDORS } from '../enums/providors.enum';
import { Language } from '../enums/language.enum';
import { LINK_TYPE } from '../enums/link-type.enum';

export interface LinkModel {
    key: string;
    href: string;
    parentKey: string;
    destination: PORTALS | PROVIDORS;
    language: Language;
    type: LINK_TYPE;
    dateAdded: Date;
}
