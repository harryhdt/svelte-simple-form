// Extracted useFormControl engine from form.svelte.ts
// Phase 7A - core runtime extraction

import { tick } from 'svelte';

import { getValueByPath, setByPath } from './path';
import {
	removeDirty,
	removeTouched,
	setDirty,
	setTouched,
	updatePathDirty
} from './state';

import type {
	FieldOptions,
	FlatPaths,
	FormControlProps,
	ValueFromPath,
	Split,
	Paths,
	_ValueFromParts
} from './types';

export function useFormControl<T>(props: FormControlProps<T>) {
	const {
		initialValues,
		validator,
		validateOn = ['change', 'blur', 'submit'],
		validateAfter = 'touched-and-dirty',
		validateDebounce = 100,
		onSubmit,
		onReset
	} = props;

	let resetGeneration = $state(0);
	const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
	let activeRequests = $state(0);

	const form = $state({
		initialValues,
		data: initialValues,

		errors: {} as Record<FlatPaths<T>, string[] | undefined>,
		touched: {} as Record<FlatPaths<T>, boolean | undefined>,
		dirty: {} as Record<FlatPaths<T>, boolean | undefined>,

		isValid: true,
		isValidating: false,
		isSubmitting: false,
		isDirty: false,

		reset() {
			(async () => {
				resetGeneration++;

				form.data = structuredClone($state.snapshot(form.initialValues)) as T;
				await tick();

				form.errors = {} as Record<FlatPaths<T>, string[] | undefined>;
				form.touched = {} as Record<FlatPaths<T>, boolean | undefined>;
				form.dirty = {} as Record<FlatPaths<T>, boolean | undefined>;
				form.isValid = true;
				form.isDirty = false;
				form.isSubmitting = false;

				await tick();
				onReset?.();
			})();
		},

		resetField(path: FlatPaths<T>) {
			setByPath(form.data, path, getValueByPath(initialValues, path));
			form.touched[path] = false;
			form.dirty[path] = false;
		},

		async submit(callback?: (data: T) => any) {
			if (validator && validateOn.includes('submit')) {
				// @ts-ignore
				if (!(await validator.validateForm(form))) return;
			}

			if (form.isSubmitting) return;
			if (!form.isValid) return;

			form.isSubmitting = true;

			if (callback) {
				await callback(form.data);
			} else if (onSubmit) {
				await onSubmit($state.snapshot(form.data) as T);
			}

			await tick();
			form.isSubmitting = false;
		},

		setInitialValues: (values: T, props: { reset?: boolean } = {}) => {
			const { reset = false } = props;
			const v = structuredClone($state.snapshot({ ...values })) as any;
			form.initialValues = v;

			if (reset) {
				form.reset();
			}
		},

		setData: createSetData<T>(),

		setIsValid(isValid: boolean) {
			form.isValid = isValid;
		},

		setIsValidating(isValidating: boolean) {
			form.isValidating = isValidating;
		},

		setTouched(field: FlatPaths<T>, value = true) {
			setTouched(form.touched, field, value);
		},

		removeTouched(field: FlatPaths<T>) {
			removeTouched(form.touched, field);
		},

		setDirty(field: FlatPaths<T>, value = true) {
			setDirty(form.dirty, field, value);
		},

		removeDirty(field: FlatPaths<T>) {
			removeDirty(form.dirty, field);
		},

		setErrors(errors: Record<FlatPaths<T>, string[] | undefined>) {
			form.errors = structuredClone(errors);
		},

		setError(field: FlatPaths<T>, error: string | string[]) {
			form.errors[field] = Array.isArray(error) ? error : [error];
		},

		removeError(field: FlatPaths<T>) {
			delete form.errors[field];
		},

		async validateField() {
			return true;
		},

		async validate() {
			if (validator) return await validator.validateForm(form);
			return true;
		}
	});

	function createSetData<T>() {
		function setData(values: T, props?: { shouldValidate?: boolean }): void;
		function setData<P extends FlatPaths<T>>(
			field: P,
			value: ValueFromPath<T, P>,
			props?: FieldOptions
		): void;

		function setData(arg1: any, arg2?: any, arg3?: any) {
			if (typeof arg1 === 'object') {
				const { shouldValidate = false } = (arg2 || {}) as {
					shouldValidate?: boolean;
				};

				form.data = structuredClone($state.snapshot({ ...arg1 }));

				if (validator && shouldValidate) {
					validator.validateForm(form);
				}
			} else {
				const {
					shouldTouch = true,
					shouldDirty = true,
					shouldValidate = true
				} = (arg3 || {}) as FieldOptions;

				setByPath(form.data, arg1, arg2);

				if (shouldTouch) {
					setByPath(form.touched, arg1, true);
				}

				if (shouldDirty) {
					updatePathDirty(form, arg1, arg2);
				}

				if (validator && shouldValidate) {
					// validation wiring added in phase 7C
				}
			}
		}

		return setData;
	}

	return {
		form,
		internal: {
			resetGeneration,
			debounceTimers,
			activeRequests,
			validateAfter,
			validateOn,
			validateDebounce
		}
	};
}
