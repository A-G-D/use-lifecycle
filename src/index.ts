import { useRef } from 'react'

type CallbackEntry = {
  evaluator: Function
  localCallback: Function
  inheritedCallbacks: Function[]
}

class CallbackHandler {
  [index: string]: any

  init(name: string, value: Function = null) {
    const entry: CallbackEntry = {
      evaluator: null,
      localCallback: value,
      inheritedCallbacks: []
    }
    this[name] = entry
    return entry
  }

  inherit(callbacks: CallbackHandler | object) {
    for (const name in callbacks) {
      const data = this[name] ?? this.init(name)
      if (callbacks instanceof CallbackHandler) {
        const inheritedData = callbacks.__target__[name]
        if (data.evaluator !== inheritedData.evaluator) {
          data.inheritedCallbacks = [...inheritedData.inheritedCallbacks]
          if (inheritedData.localCallback != null) {
            data.inheritedCallbacks.push(inheritedData.localCallback)
          }
          this.rebuildEvaluator(name)
        }
      } else {
        const inheritedData = callbacks[name]
        if (data.evaluator !== inheritedData) {
          data.inheritedCallbacks = [inheritedData]
          this.rebuildEvaluator(name)
        }
      }
    }

    for (const name in this) {
      if (!(name in callbacks)) {
        const entry: any = this[name]
        entry.inheritedCallbacks = []
        this.rebuildEvaluator(name)
      }
    }
  }

  rebuildEvaluator(name: string) {
    const data = this[name]

    data.evaluator = (...args: any[]) => {
      const results: Function[] = []

      const result = data.localCallback?.(...args)
      if (typeof result === 'function') {
        results.push(result)
      }
      for (let i = data.inheritedCallbacks.length - 1; i >= 0; --i) {
        const result = data.inheritedCallbacks[i]?.(...args)
        if (typeof result === 'function') {
          results.push(result)
        }
      }

      return () => {
        while (results.length > 0) {
          const result = results.pop()
          if (result) {
            result(...args)
          }
          // results.pop()?.(...args)
        }
      }
    }
  }
}

const interceptor = {
  get(
    target: CallbackHandler,
    key: string,
    receiver: object | CallbackHandler
  ) {
    if (key === '__target__' || key in CallbackHandler.prototype)
      return Reflect.get(target, key, receiver)
    return Reflect.get(target, key, receiver)?.evaluator
  },

  set(
    target: CallbackHandler,
    key: string,
    value: Function,
    receiver: object | CallbackHandler
  ) {
    if (typeof value !== 'function') return false

    const data = Reflect.get(target, key, receiver)

    if (data == null) {
      target.init(key, value)
      target.rebuildEvaluator(key)
    } else {
      data.localCallback = value
    }

    return true
  },

  ownKeys(target: CallbackHandler) {
    return Object.keys(target).filter(
      (key) => !(key in CallbackHandler.prototype) && key.startsWith('on')
    )
  },

  has(target: CallbackHandler, key: string) {
    return (
      key in target &&
      !(key in CallbackHandler.prototype) &&
      key.startsWith('on')
    )
  }
}

export const useLifecycle = (
  lifecycle: object = {}
): { [index: string]: Function } => {
  const handlerObject = useRef(new CallbackHandler()).current

  handlerObject.inherit(lifecycle)

  return useRef(
    new Proxy(
      Object.assign(handlerObject, { __target__: handlerObject }),
      interceptor
    )
  ).current
}
