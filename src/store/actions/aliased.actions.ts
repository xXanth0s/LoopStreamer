import { createAliasedAction } from 'electron-redux';
import { LinkModel } from '../models/link.model';

export const addOrUpdateMultipleLinksActionType = 'series/addOrUpdateMultipleLinksAliasedAction';
export const addOrUpdateMultipleLinksAliasedAction = createAliasedAction(
    addOrUpdateMultipleLinksActionType,
    (links: LinkModel[]) => ({
        type: addOrUpdateMultipleLinksActionType,
        payload: links
    })
)
type padsad = ReturnType<typeof addOrUpdateMultipleLinksAliasedAction>
const t = addOrUpdateMultipleLinksAliasedAction([]);
const tt = t.type

console.log('addOrUpdateMultipleLinksAliasedAction', t)
