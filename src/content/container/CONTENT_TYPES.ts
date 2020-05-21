import { PORTALS } from '../../store/enums/portals.enum';
import { PROVIDORS } from '../../store/enums/providors.enum';

const CONTENT_TYPES = {
    RootController: Symbol.for('RootContentController'),
    VideoController: Symbol.for('VideoController'),

    // Services
    NotificationService: Symbol.for('NotificationService'),
    PortalService: Symbol.for('PortalService'),
    ProvidorService: Symbol.for('ProvidorService'),

    // Portals
    BurningSeries: Symbol.for('BurningSeries'),

    // Providors
    Vivo: Symbol.for('Vovp'),


};

export { CONTENT_TYPES };


export const getContentTypeForPortal = (portal: PORTALS): symbol => {
    switch (portal) {
        case PORTALS.BS: return CONTENT_TYPES.BurningSeries;
    }
};

export const getContentTypeForProvidor = (providor: PROVIDORS): symbol => {
    switch (providor) {
        case PROVIDORS.Vivo: return CONTENT_TYPES.Vivo;
    }
};
