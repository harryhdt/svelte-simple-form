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

	const form = useForm({
		initialValue: { name: '', age: 0 },
		onSubmit: async (data) => {
			console.log(data);
		},
		schema
	});
</script>

<form use:form.enhance>
	<input type="text" bind:value={form.data.name} />
	<input type="number" bind:value={form.data.age} />
	<input type="text" oninput={(e) => setField('example', e.target.value)} />
	<button>Submit</button>
</form>
```

## Props

- **`initialValue`**: Initial form values
- **`onSubmit`**: Callback for form submission
- **`onChange`**: Callback for form state change
- **`schema`**: Zod validation schema

## State

- **`data`**: Form data
- **`errors`**: Error messages, organized as an object `{ fieldName: string[] }`
- **`isValid`**: Boolean indicating if the form is valid
- **`isSubmitting`**: Boolean indicating if the form is being submitted
- **`isDirty`**: Boolean indicating if any field has been modified

## Methods

- **`setField(field, value)`**: Set the value of a form field dynamically
- **`reset()`**: Reset all form fields to their initial values
- **`resetField(field)`**: Reset a specific form field
- **`arrayField(field)`**: Manage array fields `{add, remove, have}`
  - **`add(value)`**: Add an item to the array field
  - **`remove(value)`**: Remove an item from the array field
  - **`have(value)`**: Check if a value exists in the array
- **`submit()`**: Manual trigger the form submission
- **`validate()`**: Validate the form all fields
- **`validate(field)`**: Validate the form specific field

## License

MIT
