import React from 'react'
import { CoolComponent } from './components/cool-component'

const App = () => {
  const onMount: Function = (element: HTMLElement) =>
    console.log('[App]: onMount(): ', element)
  const onUnmount: Function = (element: HTMLElement) =>
    console.log('[App]: onUnmount(): ', element)
  const onRender: Function = (element: HTMLElement) =>
    console.log('[App]: onRender(): ', element)
  return (
    <CoolComponent lifecycle={{ onMount, onUnmount, onRender }}>
      <>Create React Library Example 😄</>
    </CoolComponent>
  )
}

export default App
