// Internal path utilities extracted from form.svelte.ts
// Preparation-only phase

export type Path = string;

export function setByPath(obj: any, path: string, value: any) {
	const parts = path.split('.');
	let current = obj;

	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i];

		if (/^\d+$/.test(part)) {
			const index = Number(part);
			if (!Array.isArray(current)) throw new Error(`Expected array at "${part}"`);
			if (!current[index]) current[index] = {};
			current = current[index];
		} else {
			if (current[part] === undefined) current[part] = {};
			current = current[part];
		}
	}

	const last = parts[parts.length - 1];
	if (/^\d+$/.test(last)) current[Number(last)] = value;
	else current[last] = value;
}

export function getValueByPath(obj: any, path: string) {
	const parts = path.split('.');
	let current = obj;

	for (const part of parts) {
		const isIndex = /^\d+$/.test(part);

		if (isIndex) {
			if (!Array.isArray(current)) return undefined;
			current = current[Number(part)];
		} else {
			if (current == null || !(part in current)) return undefined;
			current = current[part];
		}
	}

	return current;
}
