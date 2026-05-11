// Internal dirty/equality utilities extracted from form.svelte.ts
// Phase 1 incremental refactor

export function isDirty(a: unknown, b: unknown) {
	return JSON.stringify(a) !== JSON.stringify(b);
}
