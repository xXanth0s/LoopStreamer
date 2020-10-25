import { PORTALS } from '../../store/enums/portals.enum';
import { PROVIDORS } from '../../store/enums/providors.enum';

const CONTENT_TYPES = {
    RootController: Symbol.for('RootContentController'),
    VideoController: Symbol.for('VideoController'),
    TestController: Symbol.for('TestController'),
    PopupController: Symbol.for('PopupController'),

    // Services
    PortalService: Symbol.for('PortalService'),
    ProvidorService: Symbol.for('ProvidorService'),
    RecaptchaService: Symbol.for('RecaptchaService'),
    PopupService: Symbol.for('PopupService'),

    // Portals
    BurningSeries: Symbol.for('BurningSeries'),

    // Providors
    Vivo: Symbol.for('Vivo'),


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
