import {inject, injectable} from 'inversify';
import {SHARED_TYPES} from '../../shared/constants/SHARED_TYPES';
import {StoreService} from '../../shared/services/store.service';
import Providor from '../../store/models/providor.model';
import {
    getActiveProvidor,
    getActiveSortedProvidors,
    getAllProvidors
} from '../../store/selectors/providors.selector';
import {setActiveProvidorAction} from '../../store/reducers/control-state.reducer';
import {getContentTypeForProvidor} from '../container/CONTENT_TYPES';
import {inversifyContentContainer} from '../container/container';
import {IProvidorController} from '../controller/providors/providor.controller.interface';
import { PROVIDORS } from '../../store/enums/providors.enum';

@injectable()
export class ProvidorService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    private _providorController: IProvidorController;

    public async getCurrentProvidor(): Promise<Providor> {
        const activeProvidor = this.store.selectSync(getActiveProvidor);
        if (!activeProvidor) {
            return this.getNextProvidor();
        }

        return activeProvidor;
    }

    public async getFirstProvidor(): Promise<Providor> {
        const providors = this.store.selectSync(getAllProvidors);
        const providor = providors[0];
        await this.setActiveProvidor(providor);
        return providor;
    }

    public getProvidorController(providorKey: PROVIDORS): IProvidorController {
        const symbol = getContentTypeForProvidor(providorKey);
        this._providorController = inversifyContentContainer.get<IProvidorController>(symbol);

        return this._providorController;
    }

    public async getNextProvidor(): Promise<Providor | undefined> {
        const activeProvidor = this.store.selectSync(getActiveProvidor);
        const activeProvidorsList = this.store.selectSync(getActiveSortedProvidors);
        let index = 0;
        if (activeProvidor) {
            index = activeProvidorsList.indexOf(activeProvidor) + 1
        }

        const newProvidor = activeProvidorsList[index];
        if (newProvidor) {
            await this.setActiveProvidor(newProvidor);
        }

        return newProvidor;
    }

    public async setActiveProvidor(providor: Providor): Promise<void> {
        await this.store.dispatch(setActiveProvidorAction(providor.key));
    }

    public getProvidorForName(providorName: string): Providor {
        const providors = this.store.selectSync(getAllProvidors);
        return providors.filter(providor => {
            return providor.names.some(name => name.toLocaleLowerCase() === providorName.trim().toLocaleLowerCase());
        })[0];
    }

    public reset(): Promise<void> {
        return this.store.dispatch(setActiveProvidorAction('')) as Promise<void>;
    }
}
