import { injectable } from 'inversify';

@injectable()
export class TestController {

    private readonly inivisibleButtonSelector = (): HTMLElement => document.getElementById('invisible_button');

    public executeRecaptchaChallenge(): void {
        const button = this.inivisibleButtonSelector();
        button?.click();
    }
}
