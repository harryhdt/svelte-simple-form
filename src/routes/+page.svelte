<script lang="ts">
	import { useFormControl } from '$lib/index.ts';

	const { form, control } = useFormControl({
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
	<p></p>
	<br />
	...
	<br />
	<p></p>
	<div>
		<form use:form.handler>
			<p>useForm</p>
			<input type="text" use:control={'name'} />
			<button type="submit" disabled={form.isSubmitting}>
				{form.isSubmitting ? 'Submitting...' : 'Submit'}
			</button>
			<button type="button" onclick={() => form.reset()}> Reset </button>
			<div>
				<pre>
					{JSON.stringify(form, null, 2)}
				</pre>
			</div>
		</form>
	</div>
</div>
