## status-range-handler

This module allows a user to handle error responses easily and quickly by categorizing standard responses by range.

### installation
```npm install status-range-handler```

### the HandlerObject
```
HandlerObject = <args extends any[]> (res: Response, ...args) => boolean
HandlerObject = <args extends {[key: string]: any}>(res: Response, args) => boolean
```

This is important to the functionality of the module. There are several options to how you can set your status selectors. The following are examples of those styles and their behaviors:  
```207```- responses with exact status 207 will run this function  
```300-404``` responses with any status from 300 to 404 will run this function  
```40#``` responses with any status matching 40[0-9] will run this function  
```4##``` responses with any status matching 4[00-99] will run this function  
```400+``` any response with a status greater than 400 will run this function  
    ```400-``` any response with a status less than 400 will run this function  

Note that this is the priority order. Only the first matching handler will be run.


### functions

#### ```init(HandlerObject)```
This will generate your application defaults. When this is set, calling the core ```statusRangeHandler``` will use these as a fallback if the response status doesn't match any of those provided in its HandlerObject.

#### ```statusRangeHandler(res: Response, handlers?: HandlerObject, ...args)```
(args are then passed into the resulting handler in order)
#### ```statusRangeHandler(res: Response, {handlers?: HandlerObject, ...args})```
(args are then passed into the resulting handler as an object)
#### ```statusRangeHandler(res: Response, ...args)```
(args are then passed into the resulting hander in order)


This is the core function. It allows you to wrap the response object, combined with a HandlerObject, and runs the functionality with the provided HandlerObject. If the response status matches none of the handler keys, it will then fall back to the default global handlers. If it is also not matched in the global handlers, no handling will occur, so make sure you're accounting for that.