import { getValueByPath, setByPath } from './path';
import { updateFieldDirty, setTouched } from './state';
import type { FormControlContext } from './types';

export type UseFormControlOptions<T> = {
	initialValues: T;
};

export function useFormControl<T extends Record<string, any>>(
	options: UseFormControlOptions<T>
): FormControlContext<T> {
	const initialValues = $state(structuredClone(options.initialValues));

	const form = $state({
		data: structuredClone(options.initialValues),
		initialValues,
		errors: {} as Record<string, string[] | undefined>,
		touched: {} as Record<string, boolean | undefined>,
		dirty: {} as Record<string, boolean | undefined>,
		isDirty: false,
		isSubmitting: false,
		isValidating: false
	});

	function getData(path?: string) {
		if (!path) return form.data;
		return getValueByPath(form.data, path);
	}

	function setData(path: string, value: unknown) {
		setByPath(form.data, path, value);
		setTouched(form.touched, path, true);
		updateFieldDirty(form, path);
	}

	function reset() {
		form.data = structuredClone(form.initialValues);
		form.errors = {};
		form.touched = {};
		form.dirty = {};
		form.isDirty = false;
	}

	function resetField(path: string) {
		const initialValue = getValueByPath(form.initialValues, path);

		setByPath(form.data, path, structuredClone(initialValue));

		delete form.errors[path];
		delete form.touched[path];
		delete form.dirty[path];

		form.isDirty = Object.keys(form.dirty).length > 0;
	}

	return {
		form,
		getData,
		setData,
		reset,
		resetField
	} as FormControlContext<T>;
}
