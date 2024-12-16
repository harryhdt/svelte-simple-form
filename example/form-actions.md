# Example Svelte Kit Form Actions

```ts
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		console.log(data);
		//
		// Simulate error
		if (Math.random() >= 0.5) {
			return fail(400, {
				success: false,
				data: { name: { value: data.get('name'), errors: ['Incorrect name'] } }
			});
		}
		return { success: true, data: { name: data.get('name') } };
	}
};
```

```svelte
<script lang="ts">
	import useForm from '$lib/form.svelte.ts';
	import { applyAction, enhance } from '$app/forms';
	import { z } from 'zod';
	import type { ActionData } from './$types.js';

	interface Props {
		form: ActionData;
	}
	const { form: formResult }: Props = $props();

	const schema = z.object({
		name: z.string().min(1)
	});
	type DataType = z.infer<typeof schema>;
	const { form } = useForm<DataType>({
		initialValue: {
			name: ''
		},
		schema
	});
</script>

Form actions result: <pre style="background: #ddd;display: inline-block;">{JSON.stringify(
		formResult
	)}</pre>
<br />
<form
	use:enhance={(evt) => {
		form.setIsSubmitting();
		// validate on client side
		if (!form.validate()) evt.cancel(); // cancel form submission
		return async ({ result }) => {
			if (result.type === 'redirect') {
				// goto(result.location);
			} else {
				await applyAction(result);
				if (result.type === 'success') {
					// handle success
					form.setIsDirty(false);
					// whatever you want
				}
				if (result.type === 'failure') {
					// whatever you want
					// handle errors when failure from server
					const errors = Object.fromEntries(
						Object.entries(formResult?.data!).map(([key, value]) => [key, value.errors])
					);
					form.setErrors(errors); // set errors
				}
			}
			//
			form.setIsSubmitting(false);
		};
	}}
	method="post"
>
	<input type="text" name="name" placeholder="name..." bind:value={form.data.name} />
	{#if form.errors.name?.length}
		<p style="font-size: 12px;color: red">
			{form.errors.name.join(', ')}
		</p>
	{:else}
		<br />
	{/if}
	<pre style="background: #ddd;display: inline-block;">{JSON.stringify({
			isSubmitting: form.isSubmitting,
			isValid: form.isValid,
			isDirty: form.isDirty
		})}</pre>
	<br />
	<button type="submit">Submit</button>
</form>
```
