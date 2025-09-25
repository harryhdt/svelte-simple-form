<script lang="ts">
	import Eye from '@lucide/svelte/icons/eye';
	import CodeBlock from 'shiki-block-svelte';
	import CodeIcon from '@lucide/svelte/icons/code';
	import FromBox from '../components/fromBox.svelte';
	import { onMount } from 'svelte';

	let activeTab = $state('code');

	let formComponetSourceCode = $state('');
	onMount(async () => {
		const code = await import('../components/fromBox.svelte?raw');
		formComponetSourceCode = code.default;
	});
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
					code={formComponetSourceCode}
				/>
			</div>
		{:else if activeTab === 'preview'}
			<div>
				<FromBox />
			</div>
		{/if}
	</div>
</div>
