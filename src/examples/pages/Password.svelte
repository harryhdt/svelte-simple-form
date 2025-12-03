<script lang="ts">
	import useForm from '$lib/form.svelte.ts';
	// import { manualValidator } from '../validators/manual.ts';
	import { z } from 'zod';
	import { zodValidator } from '../validators/zod.ts';

	const schema = z
		.object({
			password: z.string().min(6, 'Min 6 chars'),
			confirmPassword: z.string().min(6, 'Min 6 chars')
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: 'Passwords do not match',
			path: ['confirmPassword']
		});
	const validator = zodValidator(schema);

	// const validator = manualValidator({
	// 	password: (v) => {
	// 		if (!v) return 'Required';
	// 		if (v.length < 6) return 'Min 6 chars';
	// 	},
	// 	confirmPassword: (v, all) => {
	// 		if (!v) return 'Required';
	// 		if (v !== all.password) return 'Passwords do not match';
	// 	}
	// });

	const { form } = useForm({
		initialValues: { password: '', confirmPassword: '' },
		onChange: (field) => {
			const err = validator.validateField(field, form.data);
			if (err) form.setError(field, err);
			else form.removeError(field);
			if (field === 'password') {
				const newField = 'confirmPassword';
				if (!form.touched.confirmPassword) return;
				const err = validator.validateField(newField, form.data);
				if (err) form.setError(newField, err);
				else form.removeError(newField);
			}
		},
		onSubmit: async (values) => {
			const errors = validator.validateForm(values);

			if (Object.keys(errors).length) {
				form.errors = errors;
				return;
			}

			console.log('submitted', values);
		}
	});
</script>

<form use:form.handler style="display: flex; flex-direction: column;max-width: 400px; gap: 10px">
	<input type="password" bind:value={form.data.password} placeholder="Password" />
	<input type="password" bind:value={form.data.confirmPassword} placeholder="Confirm Password" />
	<button type="submit" disabled={form.isSubmitting || !form.isValid}>
		{form.isSubmitting ? 'Submitting...' : 'Submit'}
	</button>
</form>
<div style="white-space: wrap;font-size: 12px; margin-top: 16px">
	{JSON.stringify(form.errors, null, 2)}
</div>
