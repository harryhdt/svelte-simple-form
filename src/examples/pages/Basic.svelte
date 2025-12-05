<script lang="ts">
	import useForm from '$lib/form.svelte.ts';

	const { form } = useForm({
		initialValues: { name: 'John', email: '', age: 10 },
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
