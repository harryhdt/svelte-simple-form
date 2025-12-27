<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface InputProps extends HTMLInputAttributes {
		use?: (node: HTMLElement) => void;
	}
	const { ...props }: InputProps = $props();

	function action(node: HTMLElement) {
		props.use?.(node);
	}
</script>

<input use:action {...props} />
