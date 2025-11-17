# 📝 Svelte Simple Form

A lightweight, **type-safe**, and **reactive** form state management hook for **Svelte 5**, featuring:

- Simply usage
- Zero dependencies
- Nested field paths support
- Dirty tracking, touched fields, and submission state
- Designed for **Svelte 5’s new reactive primitives**

---

## 🚀 Installation

```bash
npm install svelte-simple-form
```

**Note:** This hook is built to work seamlessly with **Svelte 5's reactive system**, using `$state`, `$effect`, and `tick`. Make sure your project is on Svelte 5 or later.

## Guide & Documentation

Check [Svelte Simple Form docs](https://svelte-simple.pages.dev/svelte-simple-form)

---

## 🎯 `useForm<T>(props: FormProps<T>)`

Creates and returns the reactive `form` object managing form state and events.

### Parameters

| Name            | Type                    | Description                         |
| --------------- | ----------------------- | ----------------------------------- |
| `initialValues` | `T` Automatically       | Initial values for the form fields. |
| `onSubmit`      | Optional async callback | Called on successful submission.    |
| `onChange`      | Optional callback       | Called on any field update.         |
| `onReset`       | Optional callback       | Called when form resets.            |

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

    setError(field: Path<T>, error: string | string[]): void;
	removeError(field: Path<T>): void;

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

### `setError(field: Path<T>, error: string | string[])`

- Manually set an error for a specific field.
- Like server from check email really exit in db

### `removeError(field: Path<T>)`

- Manually remove an error from a specific field.

### `submit(callback?: (data: T) => any)`

- Trigger submit form
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

## 🧑‍💻 Example Usage

```svelte
<script lang="ts">
	import useForm from 'svelte-simple-form';

	const { form } = useForm({
		initialValues: {
			name: 'John',
			email: '',
			age: 10
		},
		onSubmit: async (values) => {
			await new Promise((resolve) => setTimeout(resolve, 2000));
			console.log(values);
		}
	});
</script>

<form use:form.handler>
	<input type="text" bind:value={form.data.name} placeholder="Name" />
	<input type="email" bind:value={form.data.email} placeholder="email" />
	<input type="number" bind:value={form.data.age} placeholder="Age" />
	<button type="submit" disabled={form.isSubmitting}>
		{form.isSubmitting ? 'Submitting...' : 'Submit'}
	</button>
	<button type="button" onclick={() => form.reset()}> Reset </button>
</form>
```

---

## 💬 Tips & Notes

- Designed specifically for **Svelte 5**, leveraging its reactive primitives (`$state`, `$effect`, `tick`).
- Supports deeply nested objects and arrays with full type safety via `Path<T>`.
- Validation is _unopinionated_ — you can use manual validation or any library you prefer.
- `onChange` is triggered for every changed field with path and new value, you can use it for validate field.
- Use `form.isDirty` to track if the user has modified the form.
- `resetField` allows fine-grained reset of individual nested fields.
- `setError` and `removeError` allows manual setting of errors for specific fields.
- Use `form.handler` directive to bind submit event easily.
- Use `form.{state} = value` for manually change state value
- Use `form.{data|errors|touched}.{field} = value` for manually change state field value
- `initialValues` does not support nested string paths (like "body.height"), use objects instead.
