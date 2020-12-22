import { Guid } from 'guid-typescript';
import { AsyncInteractionType } from '../enums/async-interaction-type.enum';
import { AsyncInteraction, AsyncInteractionCreator } from '../models/async-interaction.model';


export function createAsyncInteraction<T extends Object | void>(type: AsyncInteractionType): AsyncInteractionCreator<T> {

    function actionCreator(args?: T) {
        const key = `${type}_${Guid.create().toString()}`;
        const equals = (action: AsyncInteraction<any>) => action.key === key;
        return {
            type,
            key,
            equals,
            payload: args,
        };
    }

    actionCreator.type = type;

    actionCreator.match = (action: AsyncInteraction<any>) => {
        return action.type === type;
    };

    actionCreator.isInstanceOf = <(a: AsyncInteraction<any>) => a is AsyncInteraction<T>>((interaction) => actionCreator.match(interaction));


    return actionCreator;
}

