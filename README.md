# useLifecycle React Hook

[![NPM](https://img.shields.io/npm/v/use-lifecycle.svg)](https://www.npmjs.com/package/use-lifecycle) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This custom hook allows easy creation of custom lifecycle events and callbacks for your react component.

## Install

```bash
npm install --save @react-custom-hooks/use-lifecycle
```
or
```bash
yarn add @react-custom-hooks/use-lifecycle
```

## Example

**base-component.js**
```js
import {useRef, useEffect} from "react";

/*
*	All app components supposedly inherits this component
*/
export function BaseComponent({
	children,
	className,
	lifecycle: {onMount, onUnmount, onRender} = {},
	...props
}) {
	const ref = useRef();
	const onMountRef = useRef();
	const onUnmountRef = useRef();

	onMountRef.current = onMount; 
	onUnmountRef.current = onUnmount;

	useEffect(() => {
		const element = ref.current;
		onMountRef.current?.(element);
		return () => onUnmountRef.current?.(element);
	}, []);

	useEffect(() => {
		onRender?.(ref.current);
	});

	return (
		<div
			ref={ref}
			className={["BaseComponent", className].join(" ")}
			{...props}
		>
			{children}
		</div>
	);
}
```

**cool-component.js**
```js
import {useRef, useEffect} from "react";
import {useLifecycle} from "@react-custom-hooks/use-lifecycle";
import {BaseComponent} from "./base-component"

function CoolComponent({
	children,
	className,
	lifecycle: {onMount, onUnmount, onRender} = {},
	...props
}) {
	lifecycle = useLifecycle(lifecycle);

	lifecycle.onMount = (element) => {
		console.log("[CoolComponent]: onMount()");
	};

	lifecycle.onUnmount = (element) => {
		console.log("[CoolComponent]: onUnmount()");
	};

	lifecycle.onRender = (element) => {
		console.log("[CoolComponent]: onRender()");
	};

	return (
		<BaseComponent
			className={["CoolComponent", className].join(" ")}
			{...props}
		>
			{children}
		</BaseComponent>
	)
}
```

## Comparison To Classic/Manual Method

### Classic/Manual Method

**base-component.js**
```js
import {useRef, useEffect} from "react";

/*
*	All app components supposedly inherits this component
*/
export function BaseComponent({
	children,
	className,
	lifecycle: {onMount, onUnmount, onRender} = {},
	...props
}) {
	const ref = useRef();
	const onMountRef = useRef();
	const onUnmountRef = useRef();
	
	onMountRef.current = onMount; 
	onUnmountRef.current = onUnmount;

	useEffect(() => {
		const element = ref.current;
		onMountRef.current?.(element);
		return () => onUnmountRef.current?.(element);
	}, []);
	
	useEffect(() => {
		onRender?.(ref.current);
	});
	
	return (
		<div
			ref={ref}
			className={["BaseComponent", className].join(" ")}
			{...props}
		>
			{children}
		</div>
	);
}
```

**cool-component.js**
```js
import {useRef, useEffect} from "react";
import {BaseComponent} from "./base-component"

function CoolComponent({
	children,
	className,
	lifecycle: {onMount, onUnmount, onRender} = {},
	...props
}) {
	const handleMount = (element) => {
		console.log("[CoolComponent]: onMount()");
		onMount?.(element);
	};

	const handleUnmount = (element) => {
		console.log("[CoolComponent]: onUnmount()");
		onUnmount?.(element);
	};

	const handleRender = (element) => {
		console.log("[CoolComponent]: onRender()");
		onRender?.(element);
	};

	return (
		<BaseComponent
			className={["CoolComponent", className].join(" ")}
			lifecycle={{
				onMount: handleMount,
				onUnmount: handleUnmount,
				onRender: handleRender,
			}}
			{...props}
		>
			{children}
		</BaseComponent>
	)
}
```

## License

This repository is released under [MIT License](LICENSE).
