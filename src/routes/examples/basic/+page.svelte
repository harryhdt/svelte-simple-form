<script lang="ts">
	import useForm from '$lib/form.svelte.ts';
	import { zodValidator } from '$lib/validators/zod.ts';
	import { z } from 'zod';

	const schema = z.object({
		name: z.string().min(1, 'Name is required'),
		email: z.string().email("This isn't an email"),
		age: z.number().min(18, 'Must be at least 18')
	});
	const validator = zodValidator(schema);

	const { form } = useForm({
		initialValues: { name: 'John', email: '', age: 10 },
		onChange: (field) => {
			const err = validator.validateField(field, form.data);
			if (err) form.setError(field, err);
			else form.removeError(field);
		},
		onSubmit: async (values) => {
			const errors = validator.validateForm(values);

			if (Object.keys(errors).length) {
				form.errors = errors;
			}

			console.log('submitted', values);
		}
	});
</script>

<form use:form.handler style="display: flex; flex-direction: column;max-width: 400px; gap: 10px">
	<input type="text" bind:value={form.data.name} placeholder="Name" />
	<input type="email" bind:value={form.data.email} placeholder="email" />
	<input type="number" bind:value={form.data.age} placeholder="Age" />
	<button type="submit" disabled={form.isSubmitting || !form.isValid}>
		{form.isSubmitting ? 'Submitting...' : 'Submit'}
	</button>
	<button type="button" onclick={() => form.reset()}> Reset </button>
</form>
<div style="white-space: wrap;font-size: 12px; margin-top: 16px">
	{JSON.stringify(form.errors, null, 2)}
</div>
