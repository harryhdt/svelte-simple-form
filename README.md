# 📝 Svelte Simple Form

A lightweight, **type-safe**, and **reactive** form state management hook for **Svelte 5**, featuring:

- Simply usage
- Zero dependencies
- Nested field paths support
- Dirty tracking, touched fields, and submission state
- Designed for **Svelte 5’s new reactive primitives**

---

## 🚀 Installation

```bash
npm install svelte-simple-form
```

**Note:** This hook is built to work seamlessly with **Svelte 5's reactive system**, using `$state`, `$effect`, and `tick`. Make sure your project is on Svelte 5 or later.

## Guide & Documentation

Check [Svelte Simple Form docs](https://svelte-simple.harryhdt.dev/
svelte-simple-form/introduction)
<br>
Check [Svelte Simple Form Examples](https://svelte-simple-form-examples.harryhdt.dev)

## 🧑‍💻 Example Usage

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
