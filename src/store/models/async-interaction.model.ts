import { AsyncInteractionType } from '../enums/async-interaction-type.enum';

export interface AsyncInteraction {
    key: string,
    type: AsyncInteractionType,
    payload: any
}
