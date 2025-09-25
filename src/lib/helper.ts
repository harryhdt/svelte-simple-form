import type { Path, StandardObjectSchemaResult } from "./$types.ts";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function checkPath(obj: any, path: string): boolean {
	const keys = path.split('.');

	let current = obj;
	for (const key of keys) {
		if (current == null) return false;

		// Convert numeric keys for arrays
		const prop = Array.isArray(current) && !isNaN(Number(key)) ? Number(key) : key;

		if (!(prop in current)) return false;

		current = current[prop];
	}

	return true;
}

export function getByPath(obj: any, path: string): any {
	return path.split('.').reduce((o, key) => (o ? o[key] : undefined), obj);
}

export function setByPath(obj: any, path: string, value: any) {
	const keys = path.split('.');
	const lastKey = keys.pop()!;
	const lastObj = keys.reduce((o, key) => (o[key] ??= {}), obj);
	if (value === undefined) {
		delete lastObj[lastKey];
	} else {
		lastObj[lastKey] = value;
	}
}

export function getChangedPaths(obj1: any, obj2: any, basePath = ''): string[] {
	const changed = new Set<string>();

	function collect(path: string) {
		const parts = path.split('.');
		while (parts.length > 0) {
			changed.add(parts.join('.'));
			parts.pop();
		}
	}

	function traverse(o1: any, o2: any, path: string) {
		if (typeof o1 !== 'object' || typeof o2 !== 'object' || o1 === null || o2 === null) {
			if (o1 !== o2) collect(path);
			return;
		}

		if (Array.isArray(o1) && Array.isArray(o2)) {
			const length = Math.max(o1.length, o2.length);
			for (let i = 0; i < length; i++) {
				traverse(o1[i], o2[i], path ? `${path}.${i}` : `${i}`);
			}
			return;
		}

		const keys = new Set([...Object.keys(o1 || {}), ...Object.keys(o2 || {})]);
		for (const key of keys) {
			traverse(o1?.[key], o2?.[key], path ? `${path}.${key}` : key);
		}
	}

	traverse(obj1, obj2, basePath);
	return [...changed];
}

export function parseValidationResult<
	T extends Record<string, unknown>
>(
	validationResult: StandardObjectSchemaResult<T>
) {
	const issues = validationResult.issues || [];
	return issues.reduce((acc, issue) => {
		const path: Path<T> = issue.path?.map((p) => {
			if (typeof p === "object" && "key" in p) {
				return p.key;
			}
			return p;
		}).join('.') as Path<T> ?? '';
		acc[path] = [...(acc[path] || []), issue.message];
		return acc;
	}, {} as Record<Path<T> | '', string[]>);
}