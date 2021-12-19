import React from 'react'
import { BaseComponent, BaseComponentPropTypes } from './base-component'
import { useLifecycle } from 'use-lifecycle'

export interface CoolComponentProps extends BaseComponentPropTypes {}

export const CoolComponent = ({
  children,
  className,
  ...props
}: CoolComponentProps) => {
  props.lifecycle = useLifecycle(props.lifecycle)

  props.lifecycle.onMount = (element: HTMLElement) => {
    console.log('[CoolComponent]: onMount()', element)
  }

  props.lifecycle.onUnmount = (element: HTMLElement) => {
    console.log('[CoolComponent]: onUnmount()', element)
  }

  props.lifecycle.onRender = (element: HTMLElement) => {
    console.log('[CoolComponent]: onRender()', element)
  }

  return (
    <BaseComponent
      className={['CoolComponent', className].join(' ')}
      {...props}
    >
      {children}
    </BaseComponent>
  )
}
