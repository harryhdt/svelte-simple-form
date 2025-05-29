# 📝 Svelte Simple Form

A lightweight, **type-safe**, and **reactive** form state management hook for **Svelte 5**, featuring:

- Nested field paths support
- Validation integration with [Zod](https://github.com/colinhacks/zod)
- Dirty tracking, touched fields, and submission state
- Minimal dependencies & boilerplate — designed for **Svelte 5’s new reactive primitives**

---

## 🚀 Installation

```bash
npm install svelte-simple-form
```

Optionally use Zod for validation

```bash
npm install zod
```

**Note:** This hook is built to work seamlessly with **Svelte 5's reactive system**, using `$state`, `$effect`, and `tick`. Make sure your project is on Svelte 5 or later.

---

## 🎯 `useForm<T>(props: FormProps<T>)`

Creates and returns the reactive `form` object managing form state, validation, and events.

### Parameters

| Name            | Type                                                       | Description                            |
| --------------- | ---------------------------------------------------------- | -------------------------------------- |
| `initialValues` | `T` Automatically                                          | Initial values for the form fields.    |
| `validation`    | `{ zod: schema, relatedFields: Record<string, string[]> }` | Zod schema & related field validation. |
| `onSubmit`      | Optional async callback                                    | Called on successful submission.       |
| `onChange`      | Optional callback                                          | Called on any field update.            |
| `onReset`       | Optional callback                                          | Called when form resets.               |

### Returns

```ts
{
  form: {
    initialValues: T;
    data: T;
    errors: Record<Path<T>, string[] | undefined>;
    isValid: boolean;
    isSubmitting: boolean;
    isDirty: boolean;
    touched: Record<Path<T>, boolean | undefined>;

    setInitialValues(values: T, options?: { reset?: boolean }): void;
    setIsDirty(dirty?: boolean): void;
    setIsSubmitting(submitting?: boolean): void;

    reset(): void;
    resetField(field: Path<T>): void;

    validate(field?: Path<T> | Path<T>[]): boolean;

    submit(callback?: (data: T) => any): Promise<void>;

    handler(node: HTMLFormElement): void;
  }
}
```

---

## 🛠️ Methods & Usage Details

### `setInitialValues(values: T, options?: { reset?: boolean })`

- Set new initial values for the form.
- Optionally reset the current form data to the new initial values.

### `setIsDirty(dirty?: boolean)`

- Manually mark the form as dirty or clean.

### `setIsSubmitting(submitting?: boolean)`

- Manually set submitting state (e.g., show spinner).

### `reset()`

- Reset form data to initial values.
- Clear errors and touched fields.
- Calls `onReset` callback if provided.

### `resetField(field: Path<T>)`

- Reset a single field (and its nested children) to its initial value.
- Clears touched state for the reset field.

### `validate(field?: Path<T> | Path<T>[])`

- Run validation on the entire form or specific fields using Zod.
- Clears errors on validated fields and sets new errors if any.
- Returns `true` if form is valid; `false` otherwise.

### `submit(callback?: (data: T) => any)`

- Perform validation (if configured).
- If valid, calls provided callback or `onSubmit`.
- Manages `isSubmitting` state during async submission.

### `handler(node: HTMLFormElement)`

- Attach a native submit event listener to a form element.
- Calls `submit()` automatically on submit event, preventing default browser submission.

---

## 💡 Reactive State (Bind these in your Svelte components)

| Property            | Type                                     | Description                                    |     |
| ------------------- | ---------------------------------------- | ---------------------------------------------- | --- |
| `form.data`         | `T`                                      | Current form data, bind inputs here.           |     |
| `form.errors`       | `Record<Path<T>, string[] or undefined>` | Validation errors keyed by path.               |
| `form.isValid`      | `boolean`                                | True if form has no validation errors.         |     |
| `form.isSubmitting` | `boolean`                                | True if form is currently submitting.          |     |
| `form.isDirty`      | `boolean`                                | True if form data differs from initial values. |     |
| `form.touched`      | `Record\<Path<T>, boolean or undefined>` | Tracks which fields have been modified.        |

---

## 🧑‍💻 Example Usage in Svelte 5

```svelte
<script lang="ts">
	import { useForm } from 'svelte-simple-form';
	import { z } from 'zod';

	const schema = z.object({
		name: z.string().min(1, 'Name is required'),
		age: z.number().min(18, 'Must be at least 18')
	});

	const { form } = useForm({
		initialValues: { name: '', age: 0 },
		validation: { zod: schema },
		onSubmit: async (data) => {
			alert(`Submitted: ${JSON.stringify(data)}`);
		},
		onChange: (field, value) => {
			console.log(`Field ${field} changed to`, value);
		},
		onReset: () => {
			console.log('Form was reset');
		}
	});
</script>

<form use:form.handler>
	<input type="text" bind:value={form.data.name} placeholder="Name" />
	{#if form.errors['name']?.length}
		<p style="color: red;">{form.errors['name'].join(', ')}</p>
	{/if}

	<input type="number" bind:value={form.data.age} placeholder="Age" />
	{#if form.errors.age}
		<p style="color: red;">{form.errors.age[0]}</p>
	{/if}

	<button type="submit" disabled={form.isSubmitting}>
		{form.isSubmitting ? 'Submitting...' : 'Submit'}
	</button>

	<button type="button" on:click={() => form.reset()}> Reset </button>
</form>
```

---

## 💬 Tips & Notes

- Designed specifically for **Svelte 5**, leveraging its reactive primitives (`$state`, `$effect`, `tick`).
- Supports deeply nested objects and arrays with full type safety via `Path<T>`.
- Validation is optional but highly recommended using [Zod](https://github.com/colinhacks/zod).
- `onChange` is triggered for every changed field with path and new value.
- Use `form.isDirty` to track if the user has modified the form.
- `resetField` allows fine-grained reset of individual nested fields.
- Use `form.handler` directive to bind submit event easily.
- Use `form.{state} = value` for manually change state value
- Use `form.{data|errors|touched}.{field} = value` for manually change state field value
