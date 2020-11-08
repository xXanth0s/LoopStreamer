import { Context } from '../enums/context.enum';

export const ContextIconMap: Record<Context, string> = {
    [Context.SUCCESS]: 'fas fa-check green',
    [Context.ERROR]: 'fas fa-times red',
    [Context.INFO]: 'fas fa-info-circle yellow',
};
