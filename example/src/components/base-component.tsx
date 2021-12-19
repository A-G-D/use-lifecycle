import React, { useRef, useEffect, MutableRefObject } from 'react'

/*
 *	All app components supposedly inherits this component
 */
export interface BaseComponentPropTypes {
  children?: JSX.Element | JSX.Element[]
  className?: string
  lifecycle?: { onMount?: Function; onUnmount?: Function; onRender?: Function }
}

export const BaseComponent = ({
  children,
  className,
  lifecycle: { onMount, onUnmount, onRender } = {},
  ...props
}: BaseComponentPropTypes) => {
  const ref: MutableRefObject<HTMLDivElement> = useRef()
  const onMountRef: MutableRefObject<Function> = useRef()
  const onUnmountRef: MutableRefObject<Function> = useRef()

  onMountRef.current = onMount
  onUnmountRef.current = onUnmount

  useEffect(() => {
    const element = ref.current
    onMountRef.current?.(element)
    return () => onUnmountRef.current?.(element)
  }, [])

  useEffect(() => {
    onRender?.(ref.current)
  })

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
