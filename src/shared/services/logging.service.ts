import { injectable } from 'inversify';
import * as log from 'electron-log';
import { environment } from '../../environments/environment';

@injectable()
export class LoggingService {

    private readonly isDev = environment.isDev;

    public error(message, ...args: any[]): void {
        this.execute(message, logType.error, ...args);
    }

    public warn(message, ...args: any[]): void {
        this.execute(message, logType.warn, ...args);
    }

    public info(message, ...args: any[]): void {
        this.execute(message, logType.info, ...args);
    }

    public verbose(message, ...args: any[]): void {
        this.execute(message, logType.verbose, ...args);
    }

    public debug(message, ...args: any[]): void {
        this.execute(message, logType.debug, ...args);
    }

    public silly(message, ...args: any[]): void {
        this.execute(message, logType.silly, ...args);
    }


    private execute(message: string, type: logType, ...args: any[]): void {
        switch (type) {
            case logType.warn:
                if (this.isDev) {
                    console.warn(message, ...args);
                } else {
                    log.warn(message, ...args);
                }
                break;
            case logType.info:
                if (this.isDev) {
                    console.info(message, ...args);
                } else {
                    log.info(message, ...args);
                }
                break;
            case logType.error:
                if (this.isDev) {
                    console.error(message, ...args);
                } else {
                    log.error(message, ...args);
                }
                break;
            case logType.silly:
                if (this.isDev) {
                    console.log(message, ...args);
                } else {
                    log.silly(message, ...args);
                }
                break;
            case logType.verbose:
                if (this.isDev) {
                    console.log(message, ...args);
                } else {
                    log.verbose(message, ...args);
                }
                break;
            case logType.debug:
                if (this.isDev) {
                    console.debug(message, ...args);
                } else {
                    log.debug(message, ...args);
                }
                break;
            default:
                if (this.isDev) {
                    console.log(message, ...args);
                } else {
                    log.log(message, ...args);
                }
        }
    }
}

enum logType {
    error,
    warn,
    info,
    verbose,
    debug,
    silly

}
