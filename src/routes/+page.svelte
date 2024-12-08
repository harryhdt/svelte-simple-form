<script lang="ts">
	import { useForm } from '$lib/index.ts';
	import { z } from 'zod';

	const schema = z.object({
		name: z.string().min(1),
		age: z.number().positive(),
		hobbies: z.array(z.string()),
		tags: z
			.array(
				z.object({
					key: z.string(),
					label: z.string()
				})
			)
			.default([]),
		nested: z.object({
			a: z.string().min(1),
			b: z.string(),
			c: z.object({
				c1: z.string(),
				c2: z.string().min(1, 'c2 is required, this is custom message')
			})
		})
	});

	type DataType = z.infer<typeof schema>;

	const { form, enhance } = useForm<DataType>({
		initialValue: {
			name: 'Harry',
			age: 18,
			hobbies: [],
			tags: [],
			nested: {
				a: '',
				b: '',
				c: {
					c1: '',
					c2: ''
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
		svelte-simple-form <pre style="font-size: 10px;">{JSON.stringify(form, null, 2)}</pre>
		<br /><br />
		<hr />
		<br /><br />
		Form
		<br />
		<br />
		<div>
			<input type="text" bind:value={form.data.name} />
			{#if form.errors?.name}
				<p style="font-size: 12px;color: red">{form.errors?.name?.join(', ')}</p>
			{/if}
		</div>
		<div>
			<input type="number" bind:value={form.data.age} />
			{#if form.errors?.age}
				<p style="font-size: 12px;color: red">{form.errors?.age?.join(', ')}</p>
			{/if}
		</div>
		<span>Hobbies</span>
		<label for="coding">
			<input
				type="checkbox"
				value="Coding"
				id="coding"
				checked={form.arrayField('hobbies').have('Coding')}
				onchange={(e) => {
					const elm = e.target as HTMLInputElement;
					const value = elm.value;
					if (elm.checked) {
						form.arrayField('hobbies').add(value, 10);
					} else {
						form.arrayField('hobbies').remove(value);
					}
				}}
			/>
			<span>Coding</span>
		</label>
		<label for="running">
			<input
				type="checkbox"
				value="Running"
				id="running"
				checked={form.arrayField('hobbies').have('Running')}
				onchange={(e) => {
					const elm = e.target as HTMLInputElement;
					const value = elm.value;
					if (elm.checked) {
						form.arrayField('hobbies').add(value);
					} else {
						form.arrayField('hobbies').remove(value);
					}
				}}
			/>
			<span>Running</span>
		</label>
		<br /><br />
		<span>Tags</span>
		<label for="human">
			<input
				type="checkbox"
				id="human"
				checked={form.arrayField('tags').have({ key: 'human', label: 'Human' })}
				onchange={(e) => {
					const elm = e.target as HTMLInputElement;
					const value = {
						key: 'human',
						label: 'Human'
					};
					if (elm.checked) {
						form.arrayField('tags').add(value);
					} else {
						form.arrayField('tags').remove(value);
					}
				}}
			/>
			<span>Human</span>
		</label>
		<label for="man">
			<input
				type="checkbox"
				id="man"
				checked={form.arrayField('tags').have({ key: 'man', label: 'Man' })}
				onchange={(e) => {
					const elm = e.target as HTMLInputElement;
					const value = {
						key: 'man',
						label: 'Man'
					};
					if (elm.checked) {
						form.arrayField('tags').add(value);
					} else {
						form.arrayField('tags').remove(value);
					}
				}}
			/>
			<span>Man</span>
		</label>
		<br />
		<br />
		<div>
			<input type="text" bind:value={form.data.nested.c.c2} placeholder="c2" />
			{#if form.errors?.nested.c.c2}
				<p style="font-size: 12px;color: red">{form.errors?.nested.c.c2?.join(', ')}</p>
			{/if}
		</div>
		<br />
		<br />
		<button type="button" onclick={() => form.reset()}>Reset</button>
		<button type="submit">Submit</button>
	</form>
</div>
