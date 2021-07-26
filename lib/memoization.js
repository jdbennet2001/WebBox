const Redis = require('ioredis')
const redis = new Redis();

/*
 Leverage Redis to provide fast function memoization for single parameter functions

 NOTE: Requires a local copy of redis-server on port 6379
 */
 async function memoize(func, params, scope=__filename){

    let key = `${scope}:${func.name}:${JSON.stringify(params)}`

    if ( await redis.exists(key) ){
        let data = await redis.get(key);
        return JSON.parse(data);
    }

    let data = await func(params)
    await redis.set(key, JSON.stringify(data) )
    return data;
}

module.exports = {memoize}