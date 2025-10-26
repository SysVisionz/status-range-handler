/**
    @example 207 responses with exact status 207 will run this function
    300-404 responses with any status from 300 to 404 will run this function
    40# responses with any status matching 40[0-9] will run this function
    4## responses with any status matching 4[00-99] will run this function
    400+ any response with a status greater than 400 will run this function
    400- any response with a status less than 400 will run this function
 */
export type HandlerObject = {[Key in `\d\d\d` | `\d\d#` | `\d##` | `\d\d\d-\d\d\d` | `\d\d\d+` | `\d\d\d-`]: (res: Response) => boolean}


declare global {
    var errorRangeHandlerDefaults: HandlerObject
}
/**
    @param res Response object
    @param defaults HandlerObject
*/
export const responseRangeHandler = (res: Response, defaults?: HandlerObject) => {
    const status = res.status.toString() as keyof HandlerObject
    if (!defaults){
        defaults = globalThis.errorRangeHandlerDefaults
    }
    if (defaults[status]){
        defaults[status](res)
        return true;
    }
    for (const i in defaults){
        const funct = defaults[i as keyof typeof defaults]
        const [min, max] = (/\d\d\d-\d\d\d/.exec(i)
            ? i.split('-')
            : /\d\d#/.exec(i) && !!RegExp(`${i.substring(0,2)}\\d`).exec(status)
                ? [`${i.substring(0,2)}0`, `${i.substring(0,2)}9`]
                : /\d##/.exec(i) && !!RegExp(`${i[0]}\\d\\d`).exec(status)
                    ? [`${i[0]}00`, `${i[0]}99`]
                    : /\d\d\d\+/.exec(i)
                        ? [i]
                        : /\d\d\d-/.exec(i)
                            ? [undefined, i]
                            : [undefined, undefined]).map<number|undefined>(v => v === undefined ? undefined : Number(v))
        if (((min ?? true) && res.status >= min ) && ((max ?? true) && res.status <= max )){
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