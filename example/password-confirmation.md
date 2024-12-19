# Example Password Confirmation

```svelte
<script lang="ts">
	import { useForm } from '$lib/index.ts';
	import { z } from 'zod';

	const schema = z
		.object({
			name: z.string().min(1),
			password: z.string().min(8),
			confirmPassword: z.string()
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords don't match",
			path: ['confirmPassword']
		});

	type DataType = z.infer<typeof schema>;

	const { form, enhance } = useForm<DataType>({
		initialValue: {
			name: 'Harry',
			password: '',
			confirmPassword: ''
		},
		schema,
		onSubmit: async (data) => {
			await new Promise((r) => setTimeout(r, 500));
			console.log(data);
			form.setInitialValue(data);
		},
		onChange: (f) => {
			// f is the form itself
		}
	});
</script>

<div style="font-size: 15px;font-family: Verdana, Geneva, Tahoma, sans-serif;margin: 20px 10px;">
	<form use:enhance>
		svelte-simple-form <pre
			style="font-size: 10px;max-height: 300px;overflow:auto;background-color: #f5f5f5;padding:10px;">{JSON.stringify(
				form,
				null,
				2
			)}</pre>
		<br /><br />
		<hr />
		<br /><br />
		Form
		<br />
		<br />
		<div>
			<input type="text" bind:value={form.data.name} />
			{#if form.errors.name?.length}
				<p style="font-size: 12px;color: red">{form.errors.name.join(', ')}</p>
			{/if}
		</div>
		<br />
		<div>
			<input
				type="text"
				bind:value={form.data.password}
				placeholder="password..."
				oninput={() => {
					form.validate(['password', 'confirmPassword']);
				}}
			/>
			{#if form.errors.password?.length}
				<p style="font-size: 12px;color: red">{form.errors.password.join(', ')}</p>
			{/if}
		</div>
		<div>
			<input
				type="text"
				bind:value={form.data.confirmPassword}
				placeholder="password confirmation..."
				oninput={() => {
					form.validate(['password', 'confirmPassword']);
				}}
			/>
			{#if form.errors.confirmPassword?.length}
				<p style="font-size: 12px;color: red">{form.errors.confirmPassword.join(', ')}</p>
			{/if}
		</div>
		<br />
		<br />
		<button type="button" onclick={() => form.setError('name', ['Change name :)'])}
			>Set name error</button
		>
		<button type="button" onclick={() => form.setIsDirty()}>Set is dirty</button>
		<button
			type="button"
			onclick={() => {
				form.setTouched({
					name: true,
					password: true,
					confirmPassword: true
				});
			}}>Set is touched</button
		>
		<button type="button" onclick={() => form.validate()}>Validate</button>
		<button type="button" onclick={() => form.reset()}>Reset</button>
		<button type="submit" disabled={!form.isValid}
			>Submit {form.isValid ? '' : '(disabled when isValid: false)'}</button
		>
	</form>
</div>
```
