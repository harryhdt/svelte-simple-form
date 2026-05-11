// Simplified state helpers aligned closer to form.svelte.ts

import { getValueByPath } from './path';

export function updateFieldDirty(
	form: {
		initialValues: any;
		data: any;
		dirty: Record<string, boolean | undefined>;
		isDirty: boolean;
	},
	path: string
) {
	const initial = getValueByPath(form.initialValues, path);
	const current = getValueByPath(form.data, path);

	const isDirty = JSON.stringify(initial) !== JSON.stringify(current);

	if (isDirty) {
		form.dirty[path] = true;
	} else {
		delete form.dirty[path];
	}

	form.isDirty = Object.keys(form.dirty).length > 0;

	return isDirty;
}

export function setTouched(
	touched: Record<string, boolean | undefined>,
	field: string,
	value = true
) {
	if (value) {
		touched[field] = true;
	} else {
		delete touched[field];
	}
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
	if (value) {
		dirty[field] = true;
	} else {
		delete dirty[field];
	}
}

export function removeDirty(
	dirty: Record<string, boolean | undefined>,
	field: string
) {
	delete dirty[field];
}
