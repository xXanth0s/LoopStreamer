import { injectable } from 'inversify';
import * as log from 'electron-log';
import { environment } from '../../environments/environment';

@injectable()
export class Logger {

    public static log(message, ...args: any[]): void {
        this.execute(message, logType.log, ...args);
    }

    public static error(message, ...args: any[]): void {
        this.execute(message, logType.error, ...args);
    }

    public static warn(message, ...args: any[]): void {
        this.execute(message, logType.warn, ...args);
    }

    public static info(message, ...args: any[]): void {
        this.execute(message, logType.info, ...args);
    }

    public static verbose(message, ...args: any[]): void {
        this.execute(message, logType.verbose, ...args);
    }

    public static debug(message, ...args: any[]): void {
        this.execute(message, logType.debug, ...args);
    }

    public static silly(message, ...args: any[]): void {
        this.execute(message, logType.silly, ...args);
    }


    private static execute(message: string, type: logType, ...args: any[]): void {
        switch (type) {
            case logType.log:
                if (environment.isDev) {
                    console.log(message, ...args);
                } else {
                    log.log(message, ...args);
                }
                break;
            case logType.warn:
                if (environment.isDev) {
                    console.warn(message, ...args);
                } else {
                    log.warn(message, ...args);
                }
                break;
            case logType.info:
                if (environment.isDev) {
                    console.info(message, ...args);
                } else {
                    log.info(message, ...args);
                }
                break;
            case logType.error:
                if (environment.isDev) {
                    console.error(message, ...args);
                } else {
                    log.error(message, ...args);
                }
                break;
            case logType.silly:
                if (environment.isDev) {
                    console.log(message, ...args);
                } else {
                    log.silly(message, ...args);
                }
                break;
            case logType.verbose:
                if (environment.isDev) {
                    console.log(message, ...args);
                } else {
                    log.verbose(message, ...args);
                }
                break;
            case logType.debug:
                if (environment.isDev) {
                    console.debug(message, ...args);
                } else {
                    log.debug(message, ...args);
                }
                break;
            default:
                if (environment.isDev) {
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
    log,
    info,
    verbose,
    debug,
    silly

}
