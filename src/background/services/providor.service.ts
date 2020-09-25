import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import Providor from '../../store/models/providor.model';
import { getActiveProvidor, getActiveSortedProvidors } from '../../store/selectors/providors.selector';
import { setActiveProvidorAction } from '../../store/reducers/control-state.reducer';

@injectable()
export class ProvidorService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }


    public isUrlValid(url?: string): boolean {
        if(url) {
            const providor = this.getCurrentProvidor();

            const regex = new RegExp(providor?.urlRegex, 'i');
            return regex.test(url);
        }

        return false
    }

    public getCurrentProvidor(): Providor {
        const activeProvidor = this.store.selectSync(getActiveProvidor);
        if(!activeProvidor) {
            return this.getNextProvidor();
        }

        return activeProvidor;
    }

    public getNextProvidor(): Providor {
        const activeProvidor = this.store.selectSync(getActiveProvidor);
        const activeProvidorsList = this.store.selectSync(getActiveSortedProvidors);
        let index = 0;
        if(activeProvidor) {
            index = activeProvidorsList.indexOf(activeProvidor) + 1
        }

        const newProvidor = activeProvidorsList[index];
        if(newProvidor) {
            this.setActiveProvidor(newProvidor);
        }

        return newProvidor;
    }

    public setActiveProvidor(providor: Providor): void {
        this.store.dispatch(setActiveProvidorAction(providor.key));
    }

}
