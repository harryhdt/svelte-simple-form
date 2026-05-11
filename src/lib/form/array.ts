// Internal array utilities extracted from form.svelte.ts
// Preparation-only phase

export function arrayInsert<T>(arr: T[], index: number, value: T): T[] {
	const clone = arr.slice();
	clone.splice(index, 0, value);
	return clone;
}

export function arrayRemove<T>(arr: T[], index: number): T[] {
	const clone = arr.slice();
	clone.splice(index, 1);
	return clone;
}

export function arraySwap<T>(arr: T[], i: number, j: number): T[] {
	const clone = arr.slice();
	const tmp = clone[i];
	clone[i] = clone[j];
	clone[j] = tmp;
	return clone;
}

export function arrayMove<T>(arr: T[], from: number, to: number): T[] {
	const clone = arr.slice();
	const item = clone.splice(from, 1)[0];
	clone.splice(to, 0, item);
	return clone;
}

export function shiftRecordKeys(
	record: Record<string, any>,
	path: string,
	shiftFn: (index: number) => number | null
): Record<string, any> {
	const prefix = path + '.';
	const out: Record<string, any> = {};

	for (const key of Object.keys(record)) {
		if (!key.startsWith(prefix)) {
			out[key] = record[key];
			continue;
		}

		const remainder = key.slice(prefix.length);
		const match = remainder.match(/^(\d+)(.*)$/);

		if (!match) {
			out[key] = record[key];
			continue;
		}

		const oldIndex = Number(match[1]);
		const tail = match[2];

		const newIndex = shiftFn(oldIndex);
		if (newIndex === null) continue;

		const newKey = prefix + newIndex + tail;
		out[newKey] = record[key];
	}

	return out;
}
