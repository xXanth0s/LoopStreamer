import { PROVIDORS } from '../../store/enums/providors.enum';
import { IProvidorController } from '../controller/providors/providor.controller.interface';
import { CONTENT_TYPES } from './CONTENT_TYPES';
import { inversifyContentContainer } from './container';
import { PORTALS } from '../../store/enums/portals.enum';

export function getProvidorController(providorKey: PROVIDORS): IProvidorController {
    const symbol = getContentTypeForProvidor(providorKey);
    return inversifyContentContainer.get<IProvidorController>(symbol);
}

export const getContentTypeForPortal = (portal: PORTALS): symbol => {
    switch (portal) {
        case PORTALS.BS:
            return CONTENT_TYPES.BurningSeries;
    }
};

export const getContentTypeForProvidor = (providor: PROVIDORS): symbol => {
    switch (providor) {
        case PROVIDORS.Vivo:
            return CONTENT_TYPES.Vivo;
        case PROVIDORS.MIXdrop:
            return CONTENT_TYPES.MIXDrop;
    }
};
