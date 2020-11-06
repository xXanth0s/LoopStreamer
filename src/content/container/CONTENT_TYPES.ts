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

    // Providors
    Vivo: Symbol.for('Vivo'),


};

export { CONTENT_TYPES };


