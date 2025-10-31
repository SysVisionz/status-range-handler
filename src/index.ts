/**
    @example 207 responses with exact status 207 will run this function
    300-404 responses with any status from 300 to 404 will run this function
    40# responses with any status matching 40[0-9] will run this function
    4## responses with any status matching 4[00-99] will run this function
    400+ any response with a status greater than 400 will run this function
    400- any response with a status less than 400 will run this function
 */

export type HandlerObject<R extends any[] = any[]> = {[Key in 'ok' | 'error' | `${number}${number}${number}` | `${number}${number}#` | `${number}##` | `${number}${number}${number}-${number}${number}${number}` | `${number}${number}${number}+` | `${number}${number}${number}-`]: (res: Response, ...args: R) => boolean}

declare global {
    var errorRangeHandlerDefaults: HandlerObject
}
/**
    Runs the first function with a provided handler key matching the response status.
    @param res Response object
    @param handlers HandlerObject
*/
export function responseRangeHandler<R extends any[] = any[]>(res: Response, handlers?: HandlerObject, ...args: R): boolean
export function responseRangeHandler<R extends {[K: string]: any} = {[K: string]: any}>(res: Response, options: {
    handlers?: HandlerObject
} & R): boolean
export function responseRangeHandler<R extends any[] = any[]>(res: Response, ...args: R): boolean
export function responseRangeHandler<R extends any[] | {[K: string]: any}>(res: Response, handlersOrOptions?: any, ...argu: typeof handlersOrOptions extends HandlerObject ? any[] : never): boolean {
    let handlers: HandlerObject | undefined
    let args: R
    let argsObject: boolean
    if (handlersOrOptions && typeof handlersOrOptions === 'object'){
        if ((handlersOrOptions as { handlers?: HandlerObject} & R).handlers) {
            const {handlers: theHandlers, ...theArgs} = handlersOrOptions as { handlers?: HandlerObject} & R;
            handlers = theHandlers;
            args = theArgs as R;
            argsObject = true;
        } else if (Object.keys(handlersOrOptions).every(v => /(\d##|\d\d#|\d\d\d|\d\d\d\+|\d\d\d-|\d\d\d-\d\d\d|ok|error)/.test(v))) {
            handlers = handlersOrOptions as HandlerObject
            args = argu as unknown as R
            argsObject = false;
        }
    }
    else {
        args = [handlersOrOptions, ...argu] as R
    }
    const status = res.status.toString() as keyof HandlerObject
    if (!handlers){
        handlers = globalThis.errorRangeHandlerDefaults
    }
    if (handlers[status]){
        return handlers[status](res, ...(argsObject ? [args] as [{[key: string]: string}] : args as any[]))
    }
    if (handlers.ok && res.ok) {
        return handlers.ok(res, ...(argsObject ? [args] as [{[key: string]: string}] : args as any[]))
    }
    if (handlers.error && !res.ok){
        return handlers.error(res, ...(argsObject ? [args] as [{[key: string]: string}] : args as any[]))
    }
    for (const i in handlers){
        if (/^\d\d\d$/.exec(i)){
            continue
        }
        const funct = handlers[i as keyof typeof handlers]
        const [min, max] = (/\d\d\d-\d\d\d/.exec(i)
            ? i.split('-')
            : /\d\d#/.exec(i) && !!RegExp(`${i.substring(0,2)}\\d`).exec(status)
                ? [`${i.substring(0,2)}0`, `${i.substring(0,2)}9`]
                : /\d##/.exec(i) && !!RegExp(`${i[0]}\\d\\d`).exec(status)
                    ? [`${i[0]}00`, `${i[0]}99`]
                    : /\d\d\d\+/.exec(i)
                        ? [i.substring(0,3)]
                        : /\d\d\d-/.exec(i)
                            ? [undefined, i.substring(0,3)]
                            : i === 'ok'
                                ? [200, 299]
                                : i === 'error'
                                    ? [300]
                                    : [undefined, undefined]).map<number|undefined>(v => v === undefined ? undefined : Number(v))
        if ((min || max) && ((min == undefined) || res.status >= min ) && ((max == undefined) || res.status <= max )){
            funct(res, ...(argsObject ? [args] as [{[key: string]: string}] : args as any[]) )
            return true;
        }
    }
    return false;
}
/** init defines your global defaults for responseRangeHandler calls. */ 
export const init = (serverDefaults: HandlerObject) => {
    globalThis.errorRangeHandlerDefaults = serverDefaults;
}