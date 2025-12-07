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
	form.data;
</script>

<div>
	<h1>Svelte Simple Form</h1>
	<p>A simple yet powerful, lightweight form handling library for Svelte 5</p>
	<a href="https://svelte-simple.harryhdt.dev/svelte-simple-form/introduction" target="_blank">
		Check docs
	</a>
	-
	<a href="https://github.com/harryhdt/svelte-simple-form" target="_blank">Github</a>
</div>
