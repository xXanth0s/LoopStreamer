import { StateModel } from '../models/state.model';
import { Providor } from '../models/providor.model';

export const getAllProvidors = (state: StateModel): Providor[] => Object.values(state.providors);

export const getAllUsedProvidors = (state: StateModel):
    Providor[] => Object.values(state.providors).filter(providor => providor.isUsed);

export const getProvidorForKey = (state: StateModel, providorKey: Providor['key']): Providor => {
    const providor = state.providors[providorKey];
    if (!providor) {
        console.error('getProvidorForKey: No providor found');
    }

    return providor;
};

export const getProvidorForName = (state: StateModel, providorName: string): Providor => {
    const providors = getAllProvidors(state);
    return providors
        .filter(providor => providor.names
            .some(name => name.toLocaleLowerCase() === providorName.trim().toLocaleLowerCase()))[0];
};
