import { StateModel } from '../models/state.model';
import Providor from '../models/providor.model';

export const getAllProvidors = (state: StateModel): Providor[] => Object.values(state.providors);

export const getAllUsedProvidors = (state: StateModel): Providor[] => Object.values(state.providors).filter(providor => providor.isUsed);

export const getProvidorForKey = (state: StateModel, providorKey: Providor['key']): Providor => {
    const providor = state.providors[providorKey];
    if (!providor) {
        console.error('getProvidorForKey: No providor found');
    }

    return providor;
};

export const getProvidorForName = (state: StateModel, providorName: string): Providor => {
    const providors = getAllProvidors(state);
    return providors.filter(providor => {
        return providor.names.some(name => name.toLocaleLowerCase() === providorName.trim().toLocaleLowerCase());
    })[0];
};


export const getActiveSortedProvidors = (state: StateModel): Providor[] => {
    return getAllProvidors(state).filter(providor => providor.isUsed)
        .sort((providorA: Providor, providorB: Providor) => providorA.index - providorB.index);
};

export const getActiveProvidor = (state: StateModel): Providor | null => {
    if (state.controlState.activeProvidor) {
        return getProvidorForKey(state, state.controlState.activeProvidor);
    }

    return null;
};
