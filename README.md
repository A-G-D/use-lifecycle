# useLifecycle React Hook

[![NPM](https://img.shields.io/npm/v/use-lifecycle.svg)](https://www.npmjs.com/package/use-lifecycle) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This custom hook allows easy creation of custom lifecycle events and handlers for your react component.

## Rationale

When manually implementing a lifecycle system for a heavily wrapped react component, the code easily gets bloated as an intermediate component modifies the lifecycle handlers passed by its possible wrappers before it can pass it down to the component it wrapping. For each intermediate component, this handler modification process is done repeatedly until the final handler is passed to the component that manages the certain lifecycle, which causes a lot of boring repeated lines of code.

`useLifecycle()` merely encapsulates all those extra lines to turn them into a single hook per intermediate component.

## Install

```bash
npm install --save @react-custom-hooks/use-lifecycle
```

or

```bash
yarn add @react-custom-hooks/use-lifecycle
```

## Example

In the following example, BaseComponent is a basic react component that implements onMount() and onUnmount() lifecycles. CoolComponent is a more complex component that wraps around BaseComponent, thus, inheriting its lifecycles. On top of this, CoolComponent also implement an additional lifecycle called onRender(). CoolerComponent is another component layer on top CoolComponent which once again inherits all its lifecycles.

The user passes lifecycle handlers as props to the CoolerComponent. CoolerComponent then passes these handlers, in addition to its own internal handlers, as props (once again) to CoolComponent. CoolComponent runs onRender(), a lifecycle it manages, and modifies the handlers to the remaining lifecycles, by adding its own handlers, and passes them as props to BaseComponent. The underlying BaseComponent therefore runs all the handlers for onMount() and onUmount() from the 3 levels above, in the order of how 'close' they are to BaseComponent.

After running onMount(), BaseComponent saves the returned value as a 'lifecycle cleanup' into the onMount variable. When BaseComponent decides it is time to run the cleanups for this lifecycle, all cleanups are run in reverse order as the run order of the handlers.

**base-component.js**

```js
import { useRef, useEffect } from 'react'

/*
 *	All app components supposedly inherits this component
 */
export const BaseComponent = ({
  children,
  className,
  lifecycle: { onMount } = {},
  ...props
}) => {
  const ref = useRef()

  useEffect(() => {
    const onUnmount = onMount?.(ref.current)
    return onUnmount
  }, [])

  return (
    <div
      ref={ref}
      className={['BaseComponent', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
```

**cool-component.js**

```js
import { useRef, useEffect } from 'react'
import { useLifecycle } from '@react-custom-hooks/use-lifecycle'
import { BaseComponent } from './base-component'

export const CoolComponent = ({
  children,
  className,
  lifecycle: { onMount, onRender } = {},
  ...props
}) => {
  const ref = useRef()
  props.lifecycle = useLifecycle({ onMount })

  props.lifecycle.onMount = (element) => {
    ref.current = element
    console.log('[CoolComponent]: onMount()')

    return () => console.log('[CoolComponent]: onUnmount()')
  }

  useEffect(() => {
    onRender?.(ref.current)
  })

  return (
    <BaseComponent
      className={['CoolComponent', className].join(' ')}
      {...props}
    >
      {children}
    </BaseComponent>
  )
}
```

**App.js**

```js
import { useRef, useEffect } from 'react'
import { useLifecycle } from '@react-custom-hooks/use-lifecycle'
import { CoolComponent } from './cool-component'

const CoolerComponent = ({
  children,
  className,
  lifecycle: { onMount, onRender } = {},
  ...props
}) => {
  props.lifecycle = useLifecycle({ onMount, onRender })

  props.lifecycle.onMount = (element) => {
    console.log('[CoolerComponent]: onMount()')

    return () => console.log('[CoolerComponent]: onUnmount()')
  }

  props.lifecycle.onRender = (element) => {
    console.log('[CoolerComponent]: onRender()')
  }

  return (
    <CoolComponent
      className={['CoolerComponent', className].join(' ')}
      {...props}
    >
      {children}
    </CoolComponent>
  )
}

export const App = () => {
  const onMount = (element) => {
    console.log('Component was mounted')

    return () => console.log('Component was unmounted')
  }
  const onRender = (element) => {
    console.log('Component was rendered')
  }

  return <CoolerComponent lifecycle={{ onMount, onRender }} />
}
```

## Comparison To Classic/Manual Method

The one below achieves the same goal with the example above. This is what you'd usually do when manually implementing lifecycle handlers.

### Classic/Manual Method

**cool-component.js**

```js
import { useRef, useEffect } from 'react'
import { BaseComponent } from './base-component'

export const CoolComponent = ({
  children,
  className,
  lifecycle: { onMount, onRender } = {},
  ...props
}) => {
  const ref = useRef()

  const handleMount = (element) => {
    ref.current = element
    console.log('[CoolComponent]: onMount()')

    const onUnmount = onMount?.(element)

    return () => {
      onUnmount?.(element)

      console.log('[CoolComponent]: onUnmount()')
    }
  }

  useEffect(() => {
    onRender?.(ref.current)
  })

  return (
    <BaseComponent
      className={['CoolComponent', className].join(' ')}
      lifecycle={{ onMount: handleMount }}
      {...props}
    >
      {children}
    </BaseComponent>
  )
}
```

**App.js**

```js
import { useRef, useEffect } from 'react'
import { CoolComponent } from './cool-component'

const CoolerComponent = ({
  children,
  className,
  lifecycle: { onMount, onRender } = {},
  ...props
}) => {
  const handleMount = (element) => {
    console.log('[CoolerComponent]: onMount()')

    const onUnmount = onMount?.(element)

    return () => {
      onUnmount?.(element)

      console.log('[CoolerComponent]: onUnmount()')
    }
  }

  const handleRender = (element) => {
    console.log('[CoolerComponent]: onRender()')

    onRender?.(element)
  }

  return (
    <CoolComponent
      className={['CoolerComponent', className].join(' ')}
      lifecycle={{ onMount, onRender }}
      {...props}
    >
      {children}
    </CoolComponent>
  )
}

export const App = () => {
  const onMount = (element) => {
    console.log('Component was mounted')

    return () => console.log('Component was unmounted')
  }
  const onRender = (element) => {
    console.log('Component was rendered')
  }

  return <CoolerComponent lifecycle={{ onMount, onRender }} />
}
```

You can also run this example, which is included in the repository:

```bash
git clone https://github.com/A-G-D/use-lifecycle.git
cd use-lifecycle
cd examples
yarn start
```

## Contributing

Pull Requests are Welcome.

## License

This repository is released under [MIT License](LICENSE).
