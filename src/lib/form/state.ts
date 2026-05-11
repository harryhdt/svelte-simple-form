// Extracted state helpers from form.svelte.ts
// Compatibility parity runtime

import { getValueByPath } from './path';

export function recomputeFieldDirty(
	form: {
		initialValues: any;
		data: any;
		dirty: Record<string, boolean | undefined>;
	},
	path: string
) {
	const initial = getValueByPath(form.initialValues, path);
	const current = getValueByPath(form.data, path);

	const isPathDirty = JSON.stringify(initial) !== JSON.stringify(current);

	if (isPathDirty) {
		form.dirty[path] = true;
	} else {
		delete form.dirty[path];
	}

	return isPathDirty;
}

export function recomputeDirtyState(
	form: {
		initialValues: any;
		data: any;
		isDirty: boolean;
	}
) {
	const equal = Object.keys(form.data || {}).every((key) => {
		return (
			JSON.stringify(form.data[key]) === JSON.stringify(form.initialValues[key])
		);
	});

	form.isDirty = !equal;

	return form.isDirty;
}

export function updatePathDirty(
	form: {
		initialValues: any;
		data: any;
		dirty: Record<string, boolean | undefined>;
		isDirty: boolean;
	},
	path: string
) {
	recomputeFieldDirty(form, path);
	recomputeDirtyState(form);
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
