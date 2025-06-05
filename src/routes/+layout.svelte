<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<main class="mt-12">
	{@render children()}
</main>
