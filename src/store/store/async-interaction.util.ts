import { AsyncInteractionType } from '../enums/async-interaction-type.enum';
import { AsyncInteraction } from '../models/async-interaction.model';
import { Guid } from 'guid-typescript';

export function generateAsyncInteraction(type: AsyncInteractionType, payload: any): AsyncInteraction {
    return {
        type,
        key: `${type}_${Guid.create().toString()}`,
        payload
    };
}
