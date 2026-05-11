// Internal dirty/equality utilities extracted from form.svelte.ts
// Preparation-only phase

export function isPathDirty(initial: unknown, value: unknown) {
	return JSON.stringify(initial) !== JSON.stringify(value);
}
