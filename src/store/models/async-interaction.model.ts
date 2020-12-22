import { AsyncInteractionType } from '../enums/async-interaction-type.enum';

export declare interface AsyncInteraction<P extends Object | void> {
    type: AsyncInteractionType,
    payload: P,
    key: string,
    equals: (action: AsyncInteraction<any>) => boolean
}

export declare interface AsyncInteractionCreator<P extends Object | void> {
    (payload?: P): AsyncInteraction<P>;

    type: string;
    match: (action: AsyncInteraction<any>) => boolean;
    isInstanceOf: (interaction: AsyncInteraction<any>) => interaction is AsyncInteraction<P>

}
