<script lang="ts">
	import Eye from '@lucide/svelte/icons/eye';
	import CodeBlock from 'shiki-code-block-svelte';
	import CodeIcon from '@lucide/svelte/icons/code';
	import FromBox from '../components/fromBox.svelte';

	let activeTab = $state('code');

	const svelteComponentCode = `<script lang="ts">
	import { useForm } from 'svelte-simple-form';
	import { z } from 'zod';

	let submitJson = $state('');

	const schema = z.object({
		name: z.string().min(1, 'Name is required'),
		email: z.string().email("This isn't an email"),
		age: z.number().min(18, 'Must be at least 18')
	});

	const { form } = useForm({
		initialValues: { name: '', email: '', age: 0 },
		validation: { zod: schema },
		onSubmit: async (data) => {
			submitJson = JSON.stringify(data);
			console.log(\`Submitted: \${JSON.stringify(data)}\`);
		},
		onChange: (field, value) => {
			submitJson = '';
			console.log(\`Field \${field} changed to\`, value);
		},
		onReset: () => {
			console.log('Form was reset');
		}
	});

	function setEmailError() {
		form.setError('email', 'Email really exit in db');
	}
<\/script>

<div>
	<form use:form.handler>
		<!-- user name input -->
		<div>
			<input type="text" bind:value={form.data.name} placeholder="Name" />
			{#if form.errors['name']?.length}
				<p>{form.errors['name'][0]}</p>
			{/if}
		</div>

		<!-- user email input -->
		<div>
			<input type="email" bind:value={form.data.email} placeholder="email" />
			{#if form.errors['email']?.length}
				<p>{form.errors['email'][0]}</p>
			{/if}
		</div>

		<!-- user age input -->
		<div>
			<input type="number" bind:value={form.data.age} placeholder="Age" />
			{#if form.errors.age}
				<p>{form.errors.age[0]}</p>
			{/if}
		</div>

		<div>
			<button type="submit" disabled={form.isSubmitting}>
				{form.isSubmitting ? 'Submitting...' : 'Submit'}
			</button>

			<button type="button" onclick={() => form.reset()}> Reset </button>
			<button type="button" onclick={() => setEmailError()}> setEmailError </button>
		</div>
	</form>
	<div>
		{#if submitJson}
			<pre>
			{submitJson}
			</pre>
		{/if}
	</div>
</div>`;
</script>

<div class="mx-auto w-full max-w-4xl p-4">
	<!-- heading -->

	<h2 class="text-xl font-bold text-stone-700 sm:text-3xl">📝 Svelte Simple Form</h2>
	<a class="text-lg text-blue-600" href="https://github.com/harryhdt/svelte-simple-form">
		More Docs
	</a>

	<!-- Tab Buttons -->
	<div class="flex space-x-4 border-b-2 pt-8 pb-2">
		<button
			class="tab-button"
			class:active={activeTab === 'code'}
			onclick={() => (activeTab = 'code')}
		>
			<CodeIcon name="code" class="mr-2 inline-block h-5 w-5" />
			Code
		</button>
		<button
			class="tab-button"
			class:active={activeTab === 'preview'}
			onclick={() => (activeTab = 'preview')}
		>
			<Eye name="eye" class="mr-2 inline-block h-5 w-5" />
			Preview
		</button>
	</div>

	<!-- Tab Content -->
	<div class="tab-content">
		{#if activeTab === 'code'}
			<div class="overflow-x-auto rounded-md border border-stone-700 py-3 pl-3 text-xs">
				<CodeBlock
					lang="svelte"
					theme={{
						light: 'github-light'
					}}
					code={svelteComponentCode}
				/>
			</div>
		{:else if activeTab === 'preview'}
			<div>
				<FromBox />
			</div>
		{/if}
	</div>
</div>
