// Internal path utilities extracted from form.svelte.ts
// Phase 1 incremental refactor

export type Path = string;

export function getValueByPath(obj: unknown, path: Path) {
	if (!path) return obj;

	return path.split('.').reduce((acc: any, key) => {
		if (acc == null) return undefined;
		return acc[key];
	}, obj as any);
}

export function setByPath(obj: any, path: Path, value: unknown) {
	const keys = path.split('.');
	const lastKey = keys.pop();

	if (!lastKey) return obj;

	let current = obj;

	for (const key of keys) {
		if (current[key] == null || typeof current[key] !== 'object') {
			current[key] = {};
		}

		current = current[key];
	}

	current[lastKey] = value;

	return obj;
}
