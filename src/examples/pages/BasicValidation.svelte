<script lang="ts">
	import useForm from '$lib/form.svelte.ts';
	import { z } from 'zod';
	import { manualValidator } from '../validators/manual.ts';
	import { zodValidator } from '../validators/zod.ts';

	// const schema = z.object({
	// 	name: z.string().min(1, 'Name is required'),
	// 	email: z.string().email("This isn't an email"),
	// 	age: z.number().min(18, 'Must be at least 18')
	// });
	// const validator = zodValidator(schema);

	const validator = manualValidator({
		name: (v) => {
			if (!v) return 'Name is required';
			if (v.length < 1) return 'Name is required';
		},
		email: (v) => {
			if (!v) return 'Email is required';
			if (!v.includes('@')) return "This isn't an email";
		},
		age: (v) => {
			if (!v) return 'Age is required';
			if (v < 18) return 'Must be at least 18';
		}
	});

	const { form } = useForm({
		initialValues: { name: 'John', email: '', age: 10 },
		validator,
		onSubmit: async (values) => {
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
