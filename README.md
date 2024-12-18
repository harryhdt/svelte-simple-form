# Svelte Simple Form

A simple yet powerful, lightweight form handling library for Svelte 5, designed with flexibility in mind giving you full control without being opinionated. It integrates seamlessly with Zod for validation. With built-in TypeScript autocompletion, error prevention, and a straightforward API, you can create forms that are both robust and easy to manage.

## Features

- **TypeScript Support**: Enjoy smart autocompletion, making form handling effortless.
- **State Management**: Track `isValid`, `isSubmitting`, and `isDirty` states.
- **Data Management**: Easily manage form data and errors.
- **Zod Validation**: Automatically handle errors with Zod schema validation.
- **Dynamic Field Handling**: Dynamically set and reset form fields.
- **Array Field Management**: Add, remove, and check values in arrays.
- **Form Validation**: Validate all fields or a specific field easily.
- **SvelteKit Form Actions** Seamless integration into SvelteKit's form actions

## Installation

```bash
npm install svelte-simple-form zod
```

## Usage

```svelte
<script lang="ts">
	import useForm from 'svelte-simple-form';
	import { z } from 'zod';

	const schema = z.object({
		name: z.string().min(1, 'Name is required'),
		age: z.number().min(18, 'You must be at least 18'),
		example: z.string().min(1, 'Name is required')
	});

	const { form, enhance } = useForm({
		initialValue: { name: '', age: 0, example: '' },
		schema,
		onSubmit: async (data) => {
			await new Promise((r) => setTimeout(r, 500)); // simulate fetch server
			console.log(data);
			form.setInitialValue(data); // refresh form, isDirty will be false again
		}
	});
</script>

<form use:enhance>
	<input type="text" bind:value={form.data.name} />
	<input type="number" bind:value={form.data.age} />
	<input type="text" oninput={(e) => form.setField('example', e.target.value)} />
	<p>Error name: {form.errors.name.join(', ')}</p>
	<button type="button" onclick={() => form.reset()}>Reset</button>
	<button>Submit</button>
</form>
```

## Examples

- **[Simple](https://github.com/harryhdt/svelte-simple-form/blob/main/example/simple.md)**
- **[Array](https://github.com/harryhdt/svelte-simple-form/blob/main/example/array.md)**
- **[Nested](https://github.com/harryhdt/svelte-simple-form/blob/main/example/nested.md)**
- **[File](https://github.com/harryhdt/svelte-simple-form/blob/main/example/file.md)**
- **[Form Actions](https://github.com/harryhdt/svelte-simple-form/blob/main/example/form-actions.md)**

## API Overview

- **`form`**: Represents the form state, including values, errors, and form-specific status (e.g., isValid, isSubmitting).
- **`enhance`**: A function or utility for use form functionality.

## Props

- **`initialValue`**: Initial form values
- **`onSubmit`**: Callback for form submission
- **`onChange`**: Callback for form state change
- **`schema`**: Zod validation schema

## State `form.{state}`

- **`data`**: Form data value
- **`initialValue`**: Form initial value
- **`errors`**: Error messages, organized as an object `{ fieldName: string[] }`
- **`isValid`**: Boolean indicating if the form is valid
- **`isSubmitting`**: Boolean indicating if the form is being submitted
- **`isDirty`**: Boolean indicating if any field has been modified
- **`touched`**: Touched field, organized as an object `{ fieldName: boolean }`

## Methods `form.{method()}`

- **`setInitialValue(value)`**: Set the initial value of a form
- **`setData(field or object, fieldValue?)`**: Set data for a specific field or multiple fields at once
- **`setField(field, value)`**: Set the value of a form field dynamically
- **`setError(field, value)`**: Set an error message for a specific field
- **`setErrors(value)`**: Set multiple error messages at once by passing an object
- **`setIsDirty(value?)`**: Set form isDirty, with optional value
- **`setTouched(field or object, fieldValue?)`**: Mark a specific field(with optional value) or set multiple fields as touched
- **`setIsSubmitting(value?)`** Set form isSubmitting, with optinal value
- **`reset()`**: Reset all form fields to their initial values
- **`resetField(field)`**: Reset a specific form field
- **`arrayField(field)`**: Manage array fields `{add, remove, have}`
  - **`add(value)`**: Add an item to the array field
  - **`remove(value)`**: Remove an item from the array field
  - **`have(value)`**: Check if a value exists in the array
- **`submit()`**: Manual trigger the form submission
- **`validate()`**: Validate the form all fields
- **`validate(field)`**: Validate the form specific field
- **`capture()`**: Retrieve all form data in its current state, commonly stored in svelte `store` or `$state`
- **`populate(value)`**: Populate the form with previously saved data `form.capture()`

## License

MIT
