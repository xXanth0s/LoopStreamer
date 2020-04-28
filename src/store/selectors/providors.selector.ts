import {StateModel} from '../models/state.model';
import Providor from '../models/providor.model';

export const getAllProvidors = (state: StateModel): Providor[] => Object.values(state.providors);

export const getProvidorForKey = (state: StateModel, providorKey: Providor['key']): Providor => {
    const providor = state.providors[providorKey];
    if(!providor) {
        console.error('getProvidorForKey: No providor found');
    }

    return providor;
};


export const getActiveSortedProvidors = (state: StateModel): Providor[] => {
    return getAllProvidors(state).filter(providor => providor.isUsed)
        .sort((providorA: Providor, providorB: Providor) => providorA.index - providorB.index);
};

export const getActiveProvidor = (state: StateModel): Providor | null => {
    if(state.controlState.activeProvidor) {
        return getProvidorForKey(state, state.controlState.activeProvidor);
    }

    return null;
};
