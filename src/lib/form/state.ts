// Extracted state helpers from form.svelte.ts
// Real split-engine preparation phase

import { getValueByPath } from './path';

export function updatePathDirty(
	form: {
		initialValues: any;
		dirty: Record<string, boolean | undefined>;
	},
	path: string,
	value: any
) {
	const initial = getValueByPath(form.initialValues, path);
	const isPathDirty = JSON.stringify(initial) !== JSON.stringify(value);

	if (isPathDirty) {
		form.dirty[path] = true;
	} else {
		delete form.dirty[path];
	}
}

export function setTouched(
	touched: Record<string, boolean | undefined>,
	field: string,
	value = true
) {
	touched[field] = value;
}

export function removeTouched(
	touched: Record<string, boolean | undefined>,
	field: string
) {
	delete touched[field];
}

export function setDirty(
	dirty: Record<string, boolean | undefined>,
	field: string,
	value = true
) {
	dirty[field] = value;
}

export function removeDirty(
	dirty: Record<string, boolean | undefined>,
	field: string
) {
	delete dirty[field];
}
