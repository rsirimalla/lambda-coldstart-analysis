
const async_hooks = require('async_hooks')
const util = require('util')

function doSomething() {
    print('Call back fired')
}

function print(obj) {
    process._rawDebug(util.inspect(obj, true, 100, true))
}

function init(asynId, type, triggerAsyncId, resource) {
    print({ asynId, type, triggerAsyncId, resource })
}

function before(asynId) {
    print({ stage: `before ${asynId}` })
}

function after(asynId) {
    print({ stage: `after ${asynId}` })
}

function destroy(asynId) {
    print({ stage: `destroy ${asynId}` })
}

const hook = async_hooks.createHook({ init, before, after, destroy })
hook.enable()
setTimeout(doSomething, 10)

// console.log('something')
