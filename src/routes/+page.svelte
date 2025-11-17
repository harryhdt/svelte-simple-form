<script lang="ts">
	import useForm from '$lib/form.svelte.ts';

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

<div>
	<h1>Svelte Simple Form</h1>
	<p>A simple yet powerful, lightweight form handling library for Svelte 5</p>
	<a href="https://svelte-simple.harryhdt.dev" target="_blank"> Check docs </a> -
	<a href="https://github.com/harryhdt/svelte-simple-form" target="_blank">Github</a>
</div>
<div>
	<h2>Examples</h2>
	<p>
		<a
			href="https://github.com/harryhdt/svelte-simple-form/tree/main/src/routes/+page.svelte"
			target="_blank"
		>
			Check code
		</a>
	</p>
	<form use:form.handler style="display: flex; flex-direction: column;max-width: 400px; gap: 10px">
		<input type="text" bind:value={form.data.name} placeholder="Name" />
		<input type="email" bind:value={form.data.email} placeholder="email" />
		<input type="number" bind:value={form.data.age} placeholder="Age" />
		<button type="submit" disabled={form.isSubmitting}>
			{form.isSubmitting ? 'Submitting...' : 'Submit'}
		</button>
		<button type="button" onclick={() => form.reset()}> Reset </button>
	</form>
	<div style="margin-top: 24px;">
		Examples with validation:
		<br />
		<a
			href="https://github.com/harryhdt/svelte-simple-form/tree/main/src/routes/examples/basic/+page.svelte"
			target="_blank"
		>
			Basic
		</a>
		-
		<a
			href="https://github.com/harryhdt/svelte-simple-form/tree/main/src/routes/examples/password/+page.svelte"
			target="_blank"
		>
			Password
		</a>
	</div>
	<div style="margin-top: 24px;">
		&copy; {new Date().getFullYear() || '2026'}
		<a href="https://harryhdt.dev" target="_blank">harryhdt.dev</a>
	</div>
</div>
