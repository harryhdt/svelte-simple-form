<script lang="ts">
	import useForm from '$lib/form.svelte.ts';
	import { manualValidator } from '../validators/manual.ts';
	import { z } from 'zod';
	import { zodValidator } from '../validators/zod.ts';

	const schema = z
		.object({
			name: z.string().min(1, 'Required'),
			password: z.string().min(6, 'Min 6 chars'),
			confirmPassword: z.string().min(6, 'Min 6 chars')
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: 'Passwords do not match',
			path: ['confirmPassword']
		});
	const validator = zodValidator(schema, {
		dependencies: {
			password: ['confirmPassword'],
			confirmPassword: ['password']
		}
	});

	// const validator = manualValidator(
	// 	{
	// 		name: (v) => {
	// 			if (!v) return 'Required';
	// 			if (v.length < 1) return 'Required';
	// 		},
	// 		password: (v) => {
	// 			if (!v) return 'Required';
	// 			if (v.length < 6) return 'Min 6 chars';
	// 		},
	// 		confirmPassword: (v, all) => {
	// 			if (!v) return 'Required';
	// 			if (v !== all.password) return 'Passwords do not match';
	// 		}
	// 	},
	// 	{
	// 		dependencies: {
	// 			password: ['confirmPassword'],
	// 			confirmPassword: ['password']
	// 		}
	// 	}
	// );

	const { form } = useForm({
		initialValues: { name: '', password: '', confirmPassword: '' },
		validator,
		onSubmit: async (values) => {
			console.log('submitted', values);
		}
	});
</script>

<form use:form.handler style="display: flex; flex-direction: column;max-width: 400px; gap: 10px">
	<input type="text" bind:value={form.data.name} placeholder="Name" />
	<input type="password" bind:value={form.data.password} placeholder="Password" />
	<input type="password" bind:value={form.data.confirmPassword} placeholder="Confirm Password" />
	<button type="submit" disabled={form.isSubmitting || !form.isValid}>
		{form.isSubmitting ? 'Submitting...' : 'Submit'}
	</button>
</form>
<div style="white-space: wrap;font-size: 12px; margin-top: 16px">
	{JSON.stringify(form.errors, null, 2)}
</div>
