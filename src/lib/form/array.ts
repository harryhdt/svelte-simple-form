// Internal array utilities extracted from form.svelte.ts
// Phase 1 incremental refactor

export function arrayInsert<T>(array: T[], index: number, item: T) {
	const clone = [...array];
	clone.splice(index, 0, item);
	return clone;
}

export function arrayRemove<T>(array: T[], index: number) {
	const clone = [...array];
	clone.splice(index, 1);
	return clone;
}

export function arraySwap<T>(array: T[], from: number, to: number) {
	const clone = [...array];
	[clone[from], clone[to]] = [clone[to], clone[from]];
	return clone;
}

export function arrayMove<T>(array: T[], from: number, to: number) {
	const clone = [...array];
	const [item] = clone.splice(from, 1);
	clone.splice(to, 0, item);
	return clone;
}
