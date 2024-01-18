import { createDecorator } from "src/platform/instantiation/instantiation";
import { LogConfig } from "./log";

export const ILoggerService = createDecorator<ILoggerService>("loggerService");

export type CategorieKey = keyof LogConfig["categories"];

export interface ILoggerService   {
    readonly _serviceBrand: undefined;
  
    trace(category: CategorieKey, message: any, ...args: any[]): Promise<void>;
    debug(category: CategorieKey, message: any, ...args: any[]): Promise<void>;
    info(category: CategorieKey, message: any, ...args: any[]): Promise<void>;
    warn(category: CategorieKey, message: any, ...args: any[]): Promise<void>;
    error(category: CategorieKey, message: any, ...args: any[]): Promise<void>;
    fatal(category: CategorieKey, message: any, ...args: any[]): Promise<void>;
    flush(): Promise<void>;
  }