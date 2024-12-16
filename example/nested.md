# Example Nested

```svelte
<script lang="ts">
	import { useForm } from '$lib/index.ts';
	import { z } from 'zod';

	const schema = z.object({
		name: z.string().min(1),
		nested: z.object({
			a: z.string().min(1),
			b: z.string(),
			c: z.object({
				c1: z.string(),
				c2: z.string().min(1, 'c2 is required, this is custom message'),
				c3: z.object({
					c31: z.string().min(1, 'c31 is required, this is custom message')
				})
			})
		})
	});

	type DataType = z.infer<typeof schema>;

	const { form, enhance } = useForm<DataType>({
		initialValue: {
			name: 'Harry',
			nested: {
				a: '',
				b: '',
				c: {
					c1: '',
					c2: '',
					c3: {
						c31: ''
					}
				}
			}
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
			<input type="text" bind:value={form.data.name} oninput={() => form.validate('name')} />
			{#if form.errors.name}
				<p style="font-size: 12px;color: red">{form.errors.name.join(', ')}</p>
			{/if}
		</div>
		<br />
		Nested: a, c.c2, c.c3.c31
		<br />
		<br />
		<div>
			<input type="text" bind:value={form.data.nested.a} placeholder="a" />
			{#if form.errors.nested?.a?.length}
				<p style="font-size: 12px;color: red">{form.errors?.nested.a?.join(', ')}</p>
			{/if}
		</div>
		<div>
			<input type="text" bind:value={form.data.nested.c.c2} placeholder="c2" />
			{#if form.errors.nested?.c?.c2?.length}
				<p style="font-size: 12px;color: red">{form.errors?.nested.c.c2?.join(', ')}</p>
			{/if}
		</div>
		<div>
			<input type="text" bind:value={form.data.nested.c.c3.c31} placeholder="c31" />
			{#if form.errors.nested?.c?.c3?.c31?.length}
				<p style="font-size: 12px;color: red">{form.errors?.nested.c.c3.c31?.join(', ')}</p>
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
					nested: true
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
