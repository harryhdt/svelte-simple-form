// Extracted useFormControl engine from form.svelte.ts
// Compatibility parity runtime

import { tick, untrack } from 'svelte';

import { getValueByPath, setByPath } from './path';

import {
	arrayInsert,
	arrayMove,
	arrayRemove,
	arraySwap,
	shiftRecordKeys
} from './array';

import { createControl } from './control';

import {
	removeDirty,
	removeTouched,
	setDirty,
	setTouched,
	updatePathDirty,
	recomputeDirtyState
} from './state';

import { executeValidation } from './validation';

import type {
	ArrayItem,
	ArrayPaths,
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
		onReset,
		onChange
	} = props as FormControlProps<T> & {
		onChange?: (field: FlatPaths<T>, value: any) => void;
	};

	let resetGeneration = $state(0);
	const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
	let activeRequests = $state(0);

	let prevData = structuredClone($state.snapshot(initialValues));

	const validationContext = {
		form: null as any,
		validator,
		validateOn,
		validateAfter,
		validateDebounce,
		debounceTimers,
		activeRequests: {
			get value() {
				return activeRequests;
			},
			set value(v) {
				activeRequests = v;
			}
		},
		resetGeneration: {
			get value() {
				return resetGeneration;
			},
			set value(v) {
				resetGeneration = v;
			}
		},
		setIsValidating(value: boolean) {
			form.isValidating = value;
		}
	};

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

		setIsDirty(dirty: boolean = true) {
			form.isDirty = dirty;
		},

		setIsSubmitting(submitting: boolean = true) {
			form.isSubmitting = submitting;
		},

		reset() {
			(async () => {
				resetGeneration++;

				form.data = structuredClone($state.snapshot(form.initialValues)) as T;
				await tick();

				form.errors = {} as Record<FlatPaths<T>, string[] | undefined>;
				form.touched = {} as Record<FlatPaths<T>, boolean | undefined>;
				form.dirty = {} as Record<FlatPaths<T>, boolean | undefined>;
				form.isValid = true;
				form.isSubmitting = false;
				form.isDirty = false;

				prevData = structuredClone($state.snapshot(form.data));

				await tick();
				onReset?.();
			})();
		},

		resetField(path: FlatPaths<T>) {
			setByPath(form.data, path, getValueByPath(initialValues, path));
			form.touched[path] = false;
			form.dirty[path] = false;
			recomputeDirtyState(form);
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

		handler(node: HTMLFormElement) {
			const handleSubmit = (event: Event) => {
				event.preventDefault();
				form.submit();
			};

			node.addEventListener('submit', handleSubmit);

			return {
				destroy() {
					node.removeEventListener('submit', handleSubmit);
				}
			};
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

		control: createControl<T>({
			form,
			validationContext
		}),

		arrayAdd<P extends ArrayPaths<T>>(
			path: P,
			value: NonNullable<ValueFromPath<T, P>> extends readonly (infer I)[] ? I : never,
			idx: number | undefined = undefined,
			opts: FieldOptions = {}
		) {
			const arr = (getValueByPath(form.data, path) || []) as any[];
			const index = idx !== undefined ? idx : arr.length;

			setByPath(form.data, path, arrayInsert(arr, index, value));

			form.touched = shiftRecordKeys(form.touched, path, (old) =>
				old >= index ? old + 1 : old
			);

			form.dirty = shiftRecordKeys(form.dirty, path, (old) =>
				old >= index ? old + 1 : old
			);

			form.errors = shiftRecordKeys(form.errors, path, (old) =>
				old >= index ? old + 1 : old
			);
		},

		arrayRemove<P extends ArrayPaths<T>>(path: P, index: number) {
			const arr = getValueByPath(form.data, path) as any[];

			setByPath(form.data, path, arrayRemove(arr, index));

			form.touched = shiftRecordKeys(form.touched, path, (old) =>
				old === index ? null : old > index ? old - 1 : old
			);

			form.dirty = shiftRecordKeys(form.dirty, path, (old) =>
				old === index ? null : old > index ? old - 1 : old
			);

			form.errors = shiftRecordKeys(form.errors, path, (old) =>
				old === index ? null : old > index ? old - 1 : old
			);
		},

		arraySwap<P extends ArrayPaths<T>>(path: P, i: number, j: number) {
			const arr = getValueByPath(form.data, path) as any[];

			setByPath(form.data, path, arraySwap(arr, i, j));

			form.touched = shiftRecordKeys(form.touched, path, (old) =>
				old === i ? j : old === j ? i : old
			);

			form.dirty = shiftRecordKeys(form.dirty, path, (old) =>
				old === i ? j : old === j ? i : old
			);

			form.errors = shiftRecordKeys(form.errors, path, (old) =>
				old === i ? j : old === j ? i : old
			);
		},

		arrayMove<P extends ArrayPaths<T>>(path: P, from: number, to: number) {
			if (from === to) return;

			const arr = getValueByPath(form.data, path) as any[];

			setByPath(form.data, path, arrayMove(arr, from, to));

			const shiftFn = (old: number): number => {
				if (old === from) return to;
				if (from < to && old > from && old <= to) return old - 1;
				if (from > to && old >= to && old < from) return old + 1;
				return old;
			};

			form.touched = shiftRecordKeys(form.touched, path, shiftFn);
			form.dirty = shiftRecordKeys(form.dirty, path, shiftFn);
			form.errors = shiftRecordKeys(form.errors, path, shiftFn);
		},

		arrayRemoveBy<P extends ArrayPaths<T>>(
			path: P,
			predicate: (item: ArrayItem<T, P>) => boolean
		) {
			const arr = (getValueByPath(form.data, path) || []) as any[];
			const index = arr.findIndex(predicate);

			if (index !== -1) {
				this.arrayRemove(path, index);
			}
		},

		arrayUpdateBy<P extends ArrayPaths<T>>(
			path: P,
			predicate: (item: ArrayItem<T, P>) => boolean,
			value: ArrayItem<T, P> | ((prev: ArrayItem<T, P>) => ArrayItem<T, P>)
		) {
			const arr = (getValueByPath(form.data, path) || []) as any[];
			const index = arr.findIndex(predicate);

			if (index !== -1) {
				const currentItem = arr[index];

				const newValue =
					typeof value === 'function' ? (value as Function)(currentItem) : value;

				const newArr = arr.slice();
				newArr[index] = newValue;

				setByPath(form.data, path, newArr);
			}
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

		async validateField(field: FlatPaths<T>) {
			if (!validator) return true;

			executeValidation(validationContext, field);

			return true;
		},

		async validate() {
			if (validator) {
				return await validator.validateForm(form);
			}

			return true;
		}
	});

	validationContext.form = form;

	$effect(() => {
		JSON.stringify(form.data);

		untrack(async () => {
			const currentData = structuredClone($state.snapshot(form.data));
			const changedPaths: string[] = [];

			const walk = (prev: any, current: any, base = '') => {
				const keys = new Set([
					...Object.keys(prev || {}),
					...Object.keys(current || {})
				]);

				for (const key of keys) {
					const path = base ? `${base}.${key}` : key;

					const prevValue = prev?.[key];
					const currentValue = current?.[key];

					if (JSON.stringify(prevValue) !== JSON.stringify(currentValue)) {
						changedPaths.push(path);

						if (
							prevValue &&
							currentValue &&
							typeof prevValue === 'object' &&
							typeof currentValue === 'object'
						) {
							walk(prevValue, currentValue, path);
						}
					}
				}
			};

			walk(prevData, currentData);

			for (const path of changedPaths) {
				form.touched[path as FlatPaths<T>] = true;

				updatePathDirty(form, path);

				const value = $state.snapshot(getValueByPath(form.data, path));

				onChange?.(path as FlatPaths<T>, value);

				if (validator && validateOn.includes('change')) {
					executeValidation(validationContext, path as FlatPaths<T>);
				}
			}

			prevData = currentData;
		});
	});

	$effect(() => {
		JSON.stringify(form.errors);

		untrack(() => {
			form.isValid =
				Object.keys(form.errors).length === 0 ||
				Object.keys(form.errors).every(
					(key) => (form.errors[key as FlatPaths<T>]?.length || 0) === 0
				);
		});
	});

	function createSetData<T>() {
		function setData(values: T, props?: { shouldValidate?: boolean }): void;
		function setData<P extends FlatPaths<T>>(
			field: P,
			value: ValueFromPath<T, P>,
			props?: FieldOptions
		): void;

		function setData(arg1: any, arg2?: any) {
			if (typeof arg1 === 'object') {
				form.data = structuredClone($state.snapshot({ ...arg1 }));
			} else {
				setByPath(form.data, arg1, arg2);
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
