const CONTENT_TYPES = {
    RootController: Symbol.for('RootContentController'),
    VideoController: Symbol.for('VideoController'),
    TestController: Symbol.for('TestController'),
    PopupController: Symbol.for('PopupController'),

    // Services
    NotificationService: Symbol.for('NotificationService'),
    PortalService: Symbol.for('PortalService'),
    RecaptchaService: Symbol.for('RecaptchaService'),
    PopupService: Symbol.for('PopupService'),

    // Portals
    BurningSeries: Symbol.for('BurningSeries'),
    SerienStream: Symbol.for('SerienStream'),

    // Providors
    Vivo: Symbol.for('Vivo'),
    Voe: Symbol.for('Voe'),
    MIXDrop: Symbol.for('MIXDrop'),

};

export { CONTENT_TYPES };
