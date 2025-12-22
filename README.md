# 📝 Svelte Simple Form

A lightweight, **type-safe**, and **reactive** form state management hook for **Svelte 5**, featuring:

- Simply usage
- Zero dependencies
- Nested field paths support
- Dirty tracking, touched fields, and submission state
- Designed for **Svelte 5’s new reactive primitives**

The library exposes two primary hooks:

- `useForm` — minimal form state and submission handling
- `useFormControl` — full form control with validation, state tracking, and field bindings

---

## 🚀 Installation

```bash
npm install svelte-simple-form
```

## Guide & Documentation

Check [Svelte Simple Form docs](https://github.com/harryhdt/svelte-simple-form/blob/main/documentation.md)
<br>
Check [Svelte Simple Form Usages](https://svelte-simple-usages.harryhdt.dev/form)

## 🧑‍💻 Example Usage (useForm)

```svelte
<script lang="ts">
	import { useForm } from 'svelte-simple-form';

	const { form } = useForm({
		initialValues: {
			name: 'John',
			email: '',
			age: 10
		},
		onSubmit: async (values) => {
			await new Promise((resolve) => setTimeout(resolve, 2000));
			console.log(values);
		}
	});
</script>

<form use:form.handler>
	<input type="text" bind:value={form.data.name} placeholder="Name" />
	<input type="email" bind:value={form.data.email} placeholder="email" />
	<input type="number" bind:value={form.data.age} placeholder="Age" />
	<button type="submit" disabled={form.isSubmitting}>
		{form.isSubmitting ? 'Submitting...' : 'Submit'}
	</button>
	<button type="button" onclick={() => form.reset()}> Reset </button>
</form>
```

---

## 🧑‍💻 Example Usage (useFormControl / Form Control)

Use `useFormControl` when you need **field-level control**, such as validation, dirty/touched tracking, or array fields.

```svelte
<script lang="ts">
	import { useFormControl } from 'svelte-simple-form';

	const { form, control } = useFormControl({
		initialValues: {
			name: '',
			email: '',
			age: 0
		},
		onSubmit: async (values) => {
			await new Promise((resolve) => setTimeout(resolve, 2000));
			console.log(values);
		}
	});
</script>

<form use:form.handler>
	<input type="text" placeholder="Name" use:control={'name'} />

	<input type="email" placeholder="Email" use:control={'email'} />

	<input
		type="number"
		placeholder="Age"
		use:control={{
			field: 'age',
			valueAsNumber: true
		}}
	/>

	{#if form.errors.name}
		<p class="error">{form.errors.name?.join(', ')}</p>
	{/if}

	<button type="submit" disabled={form.isSubmitting || !form.isValid}>
		{form.isSubmitting ? 'Submitting...' : 'Submit'}
	</button>

	<button type="button" on:click={() => form.reset()}> Reset </button>
</form>
```

---

### When to use `useFormControl`

- You need **validation**
- You want to track **dirty / touched** fields
- You want inputs to react to **form state changes**
- You work with **nested or array fields**
- You want consistent behavior across all inputs

If you only need basic submit/reset handling, prefer `useForm`.
