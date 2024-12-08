<script lang="ts">
	import { useForm } from '$lib/index.ts';
	import { untrack } from 'svelte';
	import { string, z } from 'zod';

	const schema = z.object({
		name: z.string().min(1),
		age: z.number().positive(),
		nickname: z.string().min(1),
		hobbies: z.array(z.string()),
		tags: z
			.array(
				z.object({
					key: z.string({ message: 'key is should string' }),
					label: z.string({ message: 'label is should string' })
				})
			)
			.default([]),
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
			nickname: '',
			age: 18,
			hobbies: [],
			tags: [],
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
			{#if form.errors?.name}
				<p style="font-size: 12px;color: red">{form.errors?.name?.join(', ')}</p>
			{/if}
		</div>
		<div>
			<input type="text" bind:value={form.data.nickname} placeholder="nickname..." />
			{#if form.errors?.nickname}
				<p style="font-size: 12px;color: red">{form.errors?.nickname?.join(', ')}</p>
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
		<label for="hiking">
			<input
				type="checkbox"
				value="2"
				id="hiking"
				checked={form.arrayField('hobbies').have(2 as any)}
				onchange={(e) => {
					const elm = e.target as HTMLInputElement;
					const value = parseInt(elm.value);
					if (elm.checked) {
						form.arrayField('hobbies').add(value as any);
					} else {
						form.arrayField('hobbies').remove(value as any);
					}
				}}
			/>
			<span>Hiking (error)</span>
		</label>
		<p style="font-size: 12px;color: red">
			{Object.keys(form.errors.hobbies || {}).length
				? Object.values(form.errors.hobbies || {}).join(', ')
				: ''}
		</p>
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
		<label for="woman">
			<input
				type="checkbox"
				id="woman"
				checked={form.arrayField('tags').have({ key: 2 as any, label: 2 as any })}
				onchange={(e) => {
					const elm = e.target as HTMLInputElement;
					const value = {
						key: 2,
						label: 2
					};
					if (elm.checked) {
						form.arrayField('tags').add(value as any);
					} else {
						form.arrayField('tags').remove(value as any);
					}
				}}
			/>
			<span>Woman (error)</span>
		</label>
		<p style="font-size: 12px;color: red">
			{Object.keys(form.errors.tags || {}).length ? JSON.stringify(form.errors.tags) : ''}
		</p>
		<br />
		<br />
		Nested: a, c.c2, c.c3.c31
		<br />
		<br />
		<div>
			<input type="text" bind:value={form.data.nested.a} placeholder="a" />
			{#if form.errors?.nested?.a}
				<p style="font-size: 12px;color: red">{form.errors?.nested.a?.join(', ')}</p>
			{/if}
		</div>
		<div>
			<input type="text" bind:value={form.data.nested.c.c2} placeholder="c2" />
			{#if form.errors?.nested?.c?.c2}
				<p style="font-size: 12px;color: red">{form.errors?.nested.c.c2?.join(', ')}</p>
			{/if}
		</div>
		<div>
			<input type="text" bind:value={form.data.nested.c.c3.c31} placeholder="c31" />
			{#if form.errors?.nested?.c?.c3?.c31}
				<p style="font-size: 12px;color: red">{form.errors?.nested.c.c3.c31?.join(', ')}</p>
			{/if}
		</div>
		<br />
		<br />
		<button type="button" onclick={() => form.validate()}>Validate</button>
		<button type="button" onclick={() => form.reset()}>Reset</button>
		<button type="submit" disabled={!form.isValid}
			>Submit {form.isValid ? '' : '(disabled when isValid: false)'}</button
		>
	</form>
</div>
