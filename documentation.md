# Svelte Simple Form

A `lightweight`, `type-safe` and `reactive` form utility built on **Svelte Runes**, focused on predictable form state and explicit control.

The library exposes two primary hooks:

- `useForm` — minimal form state and submission handling
- `useFormControl` — full form control with validation, state tracking, and field bindings

### This library is designed for:

- SvelteKit and Svelte 5 applications
- Client-side form handling
- Controlled and semi-controlled inputs
- Internal or application-level form management

It does not introduce schemas, runtime models, or implicit abstractions.

## Features

- Simply usage
- **Zero dependencies**
- Nested field paths support (`a.b.0.c`)
- Built on Svelte 5 primitives: `$state`, `$effect`, and `untrack`
- Directly operates on your existing data shape
- Field-level control via actions
- Array helpers (add, remove, move, swap)
- Optional, externalized validation

---

## Installation

with npm:

```bash
npm install svelte-simple-form
```

or with pnpm:

```bash
pnpm add svelte-simple-form
```

or with yarn:

```bash
yarn add svelte-simple-form
```

---

## useForm

### Purpose

`useForm` is intended for simple usage of forms

### Usage

```ts
const { form } = useForm({
	initialValues: {
		email: '',
		password: ''
	},
	onSubmit: async (data) => {
		console.log(data);
	}
});
```

### Returned API

```ts
form: {
	initialValues: T;
	data: T;
	isSubmitting: boolean;
	reset(): void;
	submit(callback?): Promise<void>;
	handler(node: HTMLFormElement): void;
}
```

### Example (Svelte)

```svelte
<form use:form.handler>
	<input bind:value={form.data.email} />
	<input type="password" bind:value={form.data.password} />
	<button disabled={form.isSubmitting}>Submit</button>
</form>
```

---

## useFormControl

### Purpose

`useFormControl` provides a fully controlled form system including validation, dirty/touched tracking, and field-level bindings.

Unlike plain Svelte bindings, `useFormControl` establishes a **two-way contract** between form state and DOM fields, allowing the library to track and react to user interactions at the field level.

---

### Usage

```ts
const { form, control } = useFormControl({
	initialValues: {
		users: [{ name: '' }]
	},
	validator, // optional
	// validateOn: ['change', 'blur', 'submit'] // optional
	onSubmit: async (data) => {
		console.log(data);
	}
});
```

---

### Returned API

```ts
form: {
	// core data
	initialValues: T;
	data: T;

	// state flags
	isValid: boolean;
	isValidating: boolean;
	isSubmitting: boolean;
	isDirty: boolean;

	// field state maps
	errors: Record<string, string[] | undefined>;
	touched: Record<string, boolean | undefined>;
	dirty: Record<string, boolean | undefined>;

	// lifecycle
	reset(): void;
	resetField(path: string): void;
	submit(callback?): Promise<void>;

	// data mutation
	setData(values: T): void;
	setData(field: string, value: unknown): void;

	// validation state
	setIsValid(isValid: boolean): void;
	setIsValidating(isValidating: boolean): void;

	// touched state
	setTouched(field: string, value: boolean): void;
	removeTouched(field: string): void;

	// dirty state
	setDirty(field: string, value: boolean): void;
	removeDirty(field: string): void;

	// error handling
	setErrors(errors: Record<string, string[] | undefined>): void;
	setError(field: string, error: string | string[]): void;
	removeError(field: string): void;

	// validation
	validate(): boolean | Promise<boolean>;
	validateField(field: string): boolean | Promise<boolean>;

	// array helpers
	arrayAdd(
		path: string,
		value: unknown,
		index?: number,
		options?: {
			shouldTouch?: boolean;
			shouldDirty?: boolean;
			shouldValidate?: boolean;
		}
	): void;

	arrayRemove(
		path: string,
		index: number,
		options?: {
			shouldTouch?: boolean;
			shouldDirty?: boolean;
			shouldValidate?: boolean;
		}
	): void;

	arraySwap(
		path: string,
		i: number,
		j: number,
		options?: {
			shouldTouch?: boolean;
			shouldDirty?: boolean;
			shouldValidate?: boolean;
		}
	): void;

	arrayMove(
		path: string,
		from: number,
		to: number,
		options?: {
			shouldTouch?: boolean;
			shouldDirty?: boolean;
			shouldValidate?: boolean;
		}
	): void;

	// form binding
	handler(node: HTMLFormElement): void;
}
```

---

## Field Control

In Svelte, you can bind input values directly:

```svelte
<input bind:value={form.data.name} />
```

This updates `form.data.name`, **but nothing else**.

- No dirty tracking
- No touched state
- No validation trigger
- No synchronization with `errors`, `isDirty`, or `isValid`

---

### Why `use:control` exists

`use:control` turns a field into a **controlled input** that participates in the full form system.

When you use:

```svelte
<input use:control={'name'} />
```

the field becomes reactive to:

- value changes
- dirty state
- touched state
- validation lifecycle
- programmatic data updates

In other words, `use:control` is **not just value binding** — it is a **field-level integration point** with the form state machine.

---

### Basic Input

```svelte
<input use:control={'name'} />
```

Equivalent to:

- reading value from `form.data.name`
- writing back on input/change
- marking `touched` and `dirty`
- triggering validation (based on `validateOn`)

---

### With Options

```svelte
<input
	use:control={{
		field: 'age',
		valueAsNumber: true
		// setValueAs: v => Number(v)
	}}
/>
```

Options allow you to control how values are interpreted and written back into form state, while still keeping dirty/touched/validation behavior consistent.

---

### Key Distinction (Important)

- `bind:value` → **data binding only**
- `use:control` → **data + behavior + lifecycle**

This distinction is **intentional** and is the core reason `useFormControl` exists.

---

### Supported Inputs

- input
- textarea
- select (single and multiple)
- checkbox
- radio
- file
- contenteditable

---

## Array Helpers

All array helpers automatically reindex:

- `errors`
- `dirty`
- `touched`

### Add

```ts
form.arrayAdd('users', { name: '' });
```

### Remove

```ts
form.arrayRemove('users', 0);
```

### Swap

```ts
form.arraySwap('users', 0, 1);
```

### Move

```ts
form.arrayMove('users', 0, 2);
```

---

No problem — here is the **corrected documentation section**, now accurately stating that **Standard Schema is one validator option**, and including your **example usage exactly as intended**, with no semantic changes.

---

### Official Validators Package

For common validation patterns, an official companion package is provided:

```
@svelte-simple-form/validators
```

Check [Documentation](https://github.com/harryhdt/svelte-simple-form-validators)

This package includes **multiple validator implementations**, one of which is based on the **Standard Schema** specification.
This allows integration with schema libraries such as:

- Zod
- Valibot
- ArkType

All validators conform to the same `validator` interface and are fully optional.

---

### Standard Schema Validator Example

The Standard Schema validator adapts compatible schema libraries to the `useFormControl` validation interface.

```ts
import { standardSchemaValidator } from '@svelte-simple-form/validators/standard-schema';
import { useFormControl } from 'svelte-simple-form';

const schema = z.object({
	name: z.string().min(3),
	email: z.email(),
	age: z.number().min(10)
});

const { form, control } = useFormControl({
	initialValues: {
		name: '',
		email: '',
		age: 0
	},
	validator: standardSchemaValidator(schema),
	onSubmit: async (values) => {
		await new Promise((r) => setTimeout(r, 2000));
		console.log(values);
	}
});
```

--

## When to Use Which

| Scenario            | Hook                        |
| ------------------- | --------------------------- |
| Simple submit/reset | `useForm`                   |
| Dynamic fields      | `useForm`, `useFormControl` |
| Array-heavy forms   | `useForm`, `useFormControl` |
| Validation required | `useFormControl`            |
| Tracking required   | `useFormControl`            |

---

## Breaking Changes (0.3.x -> v0.4.0)

### 1. `useForm` split into `useForm` and `useFormControl`

In `v0.3.x`, a single `useForm` hook handled both:

- basic form state
- validation
- touched/dirty tracking
- field-level logic

In `v0.4.0`, this responsibility is **explicitly split**:

- `useForm` — minimal form state and submission handling
- `useFormControl` — full form control (validation, touched/dirty state, field bindings, array helpers)

This separation is intentional to reduce overhead for simple forms and clarify intent.

**Migration**

- If you relied on validation, touched/dirty state, or field-level behavior, migrate to `useFormControl`
- If you only need submit/reset and form data, use `useForm`

---

### 2. `onChange(field, value)` removed from `useForm`

The `onChange(field, value)` callback has been **removed**.

---

### 3. Validation no longer exists in `useForm`

Validation logic has been **fully removed** from `useForm`.

In `v0.3.x`, `useForm` accepted a `validator` with:

- `validateField`
- `validateForm`

In `v0.4.0`:

- `useForm` has **no validation awareness**
- validation is exclusive to `useFormControl`

This ensures `useForm` remains lightweight and predictable.

**Migration**

- Replace `useForm` + `validator` with `useFormControl`
- Use new validator library

---

### 4. Touched and dirty tracking moved out of implicit effects

In `v0.3.x`, touched and dirty state were derived implicitly through deep comparisons and effects inside `useForm`.

In `v0.4.0`, these behaviors live only in `useFormControl`.

This avoids unnecessary effects when form control is not needed.

---

### Summary

`v0.4.0` is an **intentional API clarification release**:

- Smaller surface area per hook
- Fewer implicit side effects
- Clear separation between _form state_ and _form control_
- Better performance characteristics for simple forms
