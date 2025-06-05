<script lang="ts">
	import { useForm } from '$lib/index.ts';
	import Calendar from '@lucide/svelte/icons/calendar';
	import User from '@lucide/svelte/icons/user';
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
			console.log(`Submitted: ${JSON.stringify(data)}`);
		},
		onChange: (field, value) => {
			submitJson = '';
			console.log(`Field ${field} changed to`, value);
		},
		onReset: () => {
			console.log('Form was reset');
		}
	});

	function setEmailError() {
		form.setError('email', 'Email really exit in db');
	}
</script>

<div>
	<form use:form.handler class="mx-auto max-w-md space-y-6 rounded bg-white p-6 shadow">
		<!-- user name input -->
		<div>
			<label for="name" class="mb-1 block text-sm font-medium text-gray-700">Name</label>
			<div class="relative">
				<User class="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
				<input
					type="text"
					bind:value={form.data.name}
					placeholder="Name"
					class="w-full rounded border py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
			{#if form.errors['name']?.length}
				<p class="mt-1 text-sm text-red-600">{form.errors['name'].join(', ')}</p>
			{/if}
		</div>

		<!-- user email input -->
		<div>
			<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
			<div class="relative">
				<User class="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
				<input
					type="email"
					bind:value={form.data.email}
					placeholder="email"
					class="w-full rounded border py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
			{#if form.errors['email']?.length}
				<p class="mt-1 text-sm text-red-600">{form.errors['email'].join(', ')}</p>
			{/if}
		</div>

		<!-- user age input -->
		<div>
			<label for="age" class="mb-1 block text-sm font-medium text-gray-700">Age</label>
			<div class="relative">
				<Calendar class="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
				<input
					type="number"
					bind:value={form.data.age}
					placeholder="Age"
					class="w-full rounded border py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
			{#if form.errors.age}
				<p class="mt-1 text-sm text-red-600">{form.errors.age[0]}</p>
			{/if}
		</div>

		<div class="flex flex-wrap gap-3">
			<button
				type="submit"
				class="rounded border bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200"
				disabled={form.isSubmitting}
			>
				{form.isSubmitting ? 'Submitting...' : 'Submit'}
			</button>

			<button
				type="button"
				onclick={() => form.reset()}
				class="rounded border bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200"
			>
				Reset
			</button>
			<button
				type="button"
				onclick={() => setEmailError()}
				class="rounded border bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200"
			>
				setEmailError
			</button>
		</div>
	</form>
	<div class="mt-14">
		{#if submitJson}
			<pre>
			{submitJson}
		  </pre>
		{/if}
	</div>
</div>
