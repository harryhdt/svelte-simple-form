import { getValueByPath, setByPath } from './path';
import { updateFieldDirty, setTouched } from './state';
import { safeValidateField } from './validation';
import type { FormControlContext, Validator } from './types';

export type UseFormControlOptions<T> = {
	initialValues: T;
	validator?: Validator<T>;
	validateOn?: ('change' | 'blur' | 'submit')[];
	validateAfter?: 'touched' | 'dirty' | 'touched-or-dirty' | 'touched-and-dirty';
	validateDebounce?: number;
};

export function useFormControl<T extends Record<string, any>>(
	options: UseFormControlOptions<T>
): FormControlContext<T> {
	const initialValues = $state(structuredClone(options.initialValues));

	const validateOn = options.validateOn ?? ['change', 'blur', 'submit'];
	const validateAfter = options.validateAfter ?? 'touched-and-dirty';
	const validateDebounce = options.validateDebounce ?? 100;

	const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
	const activeRequests = { value: 0 };
	const resetGeneration = { value: 0 };

	const form = $state({
		data: structuredClone(options.initialValues),
		initialValues,
		errors: {} as Record<string, string[] | undefined>,
		touched: {} as Record<string, boolean | undefined>,
		dirty: {} as Record<string, boolean | undefined>,
		isDirty: false,
		isSubmitting: false,
		isValidating: false,
		isValid: true
	});

	function setIsValidating(value: boolean) {
		form.isValidating = value;
	}

	function validateField(path: string, force = false) {
		if (!options.validator) return;

		return safeValidateField(
			{
				form,
				validator: options.validator,
				validateOn,
				validateAfter,
				validateDebounce,
				debounceTimers,
				activeRequests,
				resetGeneration,
				setIsValidating
			},
			path,
			force
		);
	}

	async function validate() {
		if (!options.validator) return true;

		form.isValidating = true;

		try {
			return await options.validator.validateForm(form);
		} finally {
			form.isValidating = false;
		}
	}

	function getData(path?: string) {
		if (!path) return form.data;
		return getValueByPath(form.data, path);
	}

	function setData(path: string, value: unknown) {
		setByPath(form.data, path, value);
		setTouched(form.touched, path, true);
		updateFieldDirty(form, path);

		if (validateOn.includes('change')) {
			validateField(path);
		}
	}

	function reset() {
		resetGeneration.value++;

		form.data = structuredClone(form.initialValues);
		form.errors = {};
		form.touched = {};
		form.dirty = {};
		form.isDirty = false;
		form.isValid = true;
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
		resetField,
		validate,
		validateField
	} as FormControlContext<T>;
}
