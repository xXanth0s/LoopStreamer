import { Container } from 'inversify';
import 'reflect-metadata';
import { TabController } from '../background/controller/tab.controller';


export const EXTENSION_TYPES = {
    RootBackgroundController: Symbol.for('RootContentController'),
    TabController: Symbol.for('TabController')
}



const extensionContainer = new Container();


extensionContainer.bind(EXTENSION_TYPES.TabController).to(TabController).inSingletonScope();
