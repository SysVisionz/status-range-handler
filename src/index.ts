/**
    @example 207 responses with exact status 207 will run this function
    300-404 responses with any status from 300 to 404 will run this function
    40# responses with any status matching 40[0-9] will run this function
    4## responses with any status matching 4[00-99] will run this function
    400+ any response with a status greater than 400 will run this function
    400- any response with a status less than 400 will run this function
 */

export type HandlerObject = {[Key in `${number}${number}${number}` | `${number}${number}#` | `${number}##` | `${number}${number}${number}-${number}${number}${number}` | `${number}${number}${number}+` | `${number}${number}${number}-`]: <R extends unknown = unknown>(res: Response) => void}

declare global {
    var errorRangeHandlerDefaults: HandlerObject
}
/**
    Runs the first function with a provided handler key matching the response status.
    @param res Response object
    @param handlers HandlerObject
*/
export const responseRangeHandler = <R extends unknown=unknown>(res: Response, handlers?: HandlerObject) => {
    const status = res.status.toString() as keyof HandlerObject
    if (!handlers){
        handlers = globalThis.errorRangeHandlerDefaults
    }
    if (handlers[status]){
        handlers[status](res)
        return true;
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
                            : [undefined, undefined]).map<number|undefined>(v => v === undefined ? undefined : Number(v))
        if (((min == undefined) || res.status >= min ) && ((max == undefined) || res.status <= max )){
            funct(res)
            return true;
        }
    }
    return false;
}
/** init defines your global defaults for responseRangeHandler calls. */ 
export const init = (serverDefaults: HandlerObject) => {
    globalThis.errorRangeHandlerDefaults = serverDefaults;
}