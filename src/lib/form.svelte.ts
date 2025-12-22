// =====================
// type
// =====================

type Primitive =
	| string
	| number
	| boolean
	| symbol
	| null
	| undefined
	| bigint
	| File
	| Blob
	| FileList
	| Date
	| RegExp
	| ArrayBuffer
	| DataView
	| Int8Array
	| Uint8Array
	| Uint8ClampedArray
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Float32Array
	| Float64Array
	| BigInt64Array
	| BigUint64Array
	| Map<any, any>
	| Set<any>
	| WeakMap<any, any>
	| WeakSet<any>;

type Paths<T, Prev extends string = ''> = T extends Primitive
	? Prev
	: T extends (infer U)[]
		? [U] extends [never]
			? Prev | `${Prev}.${number}`
			: U extends Primitive
				? Prev | `${Prev}.${number}`
				: Prev | `${Prev}.${number}` | Paths<U, `${Prev}.${number}`>
		: T extends object
			? {
					[K in keyof T & string]: Prev extends '' ? Paths<T[K], K> : Paths<T[K], `${Prev}.${K}`>;
				}[keyof T & string]
			: Prev;

type FlatPaths<T> = Exclude<Paths<T>, ''>;

type IsArrayLike<T> = T extends readonly (infer _I)[]
	? true
	: NonNullable<T> extends readonly (infer _I)[]
		? true
		: false;

type Split<S extends string> = S extends `${infer A}.${infer B}` ? [A, ...Split<B>] : [S];

type _ValueFromParts<T, Parts extends readonly string[]> = Parts extends []
	? T
	: Parts extends [infer Head extends string, ...infer Rest extends string[]]
		? Head extends `${number}`
			? T extends readonly (infer U)[] | (infer U)[]
				? _ValueFromParts<U, Rest>
				: never
			: Head extends keyof T
				? _ValueFromParts<T[Head], Rest>
				: never
		: never;

type ValueFromPath<T, P extends FlatPaths<T>> = _ValueFromParts<T, Split<P>>;

type ArrayPaths<T> = {
	[P in FlatPaths<T>]: IsArrayLike<ValueFromPath<T, P>> extends true ? P : never;
}[FlatPaths<T>];

export type FormContext<T = Record<string, any>> = {
	initialValues: T;
	data: T;
	reset: () => void;
	submit: (callback?: (data: T) => any) => Promise<void>;
};

export type FormControlContext<T = Record<string, any>> = {
	initialValues: T;
	data: T;
	errors: Record<FlatPaths<T>, string[] | undefined>;
	touched: Record<FlatPaths<T>, boolean | undefined>;
	dirty: Record<FlatPaths<T>, boolean | undefined>;
	isValid: boolean;
	isValidating: boolean;
	isSubmitting: boolean;
	isDirty: boolean;
	reset: () => void;
	submit: (callback?: (data: T) => any) => Promise<void>;
	setData: (field: FlatPaths<T>, value: any) => void;
	setErrors: (errors: Record<string, string[] | undefined>) => void;
	setError: (field: FlatPaths<T>, errors: string[]) => void;
	removeError: (field: FlatPaths<T>) => void;
	setIsValidating: (isValidating: boolean) => void;
};

type FormProps<T> = {
	initialValues: T;
	onSubmit?: (data: T) => Promise<void>;
	onReset?: () => void;
};

type FormControlProps<T> = FormProps<T> & {
	validator?: {
		validateField: (
			field: FlatPaths<T>,
			form: FormControlContext<T>,
			force?: boolean
		) => boolean | Promise<boolean>;
		validateForm: (form: FormControlContext<T>) => boolean | Promise<boolean>;
	};
	validateOn?: ('change' | 'blur' | 'submit')[];
};

type FieldOptions = {
	shouldTouch?: boolean;
	shouldDirty?: boolean;
	shouldValidate?: boolean;
};

// =====================
// helper
// =====================

function setByPath(obj: any, path: string, value: any) {
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

function getValueByPath(obj: any, path: string) {
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

function arrayInsert<T>(arr: T[], index: number, value: T): T[] {
	const clone = arr.slice();
	clone.splice(index, 0, value);
	return clone;
}

function arrayRemove<T>(arr: T[], index: number): T[] {
	const clone = arr.slice();
	clone.splice(index, 1);
	return clone;
}

function arraySwap<T>(arr: T[], i: number, j: number): T[] {
	const clone = arr.slice();
	const tmp = clone[i];
	clone[i] = clone[j];
	clone[j] = tmp;
	return clone;
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
	const clone = arr.slice();
	const item = clone.splice(from, 1)[0];
	clone.splice(to, 0, item);
	return clone;
}

function shiftRecordKeys(
	record: Record<string, any>,
	path: string,
	shiftFn: (index: number) => number | null
): Record<string, any> {
	const prefix = path + '.';
	const out: Record<string, any> = {};

	for (const key of Object.keys(record)) {
		if (!key.startsWith(prefix)) {
			out[key] = record[key];
			continue;
		}

		const remainder = key.slice(prefix.length);
		const match = remainder.match(/^(\d+)(.*)$/);

		if (!match) {
			out[key] = record[key];
			continue;
		}

		const oldIndex = Number(match[1]);
		const tail = match[2];

		const newIndex = shiftFn(oldIndex);
		if (newIndex === null) continue;

		const newKey = prefix + newIndex + tail;
		out[newKey] = record[key];
	}

	return out;
}

// =====================
// core
// =====================

import { tick, untrack } from 'svelte';

// ---------- useForm ----------

export function useForm<T>(props: FormProps<T>) {
	const { initialValues, onSubmit, onReset } = props;

	const form = $state({
		initialValues,
		data: initialValues,
		isSubmitting: false,

		reset() {
			(async () => {
				form.data = structuredClone($state.snapshot(form.initialValues)) as T;
				await tick();
				form.isSubmitting = false;
				await tick();
				onReset?.();
			})();
		},

		async submit(callback?: (data: T) => any) {
			form.isSubmitting = true;
			if (callback) await callback(form.data);
			else if (onSubmit) await onSubmit($state.snapshot(form.data) as T);
			await tick();
			form.isSubmitting = false;
		},

		handler(node: HTMLFormElement) {
			node.addEventListener('submit', (e) => {
				e.preventDefault();
				form.submit();
			});
		}
	});

	return { form };
}

// ---------- useFormControl ----------

export function useFormControl<T>(props: FormControlProps<T>) {
	const {
		initialValues,
		validator,
		validateOn = ['change', 'blur', 'submit'],
		onSubmit,
		onReset
	} = props;

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
			if (callback) await callback(form.data);
			else if (onSubmit) await onSubmit($state.snapshot(form.data) as T);
			await tick();
			form.isSubmitting = false;
		},

		setData: createSetData<T>(),

		setIsValid(isValid: boolean) {
			form.isValid = isValid;
		},

		setIsValidating(isValidating: boolean) {
			form.isValidating = isValidating;
		},

		setTouched(field: FlatPaths<T>, value: boolean) {
			form.touched[field] = value;
		},

		removeTouched(field: FlatPaths<T>) {
			delete form.touched[field];
		},

		setDirty(field: FlatPaths<T>, value: boolean) {
			form.dirty[field] = value;
		},

		removeDirty(field: FlatPaths<T>) {
			delete form.dirty[field];
		},

		arrayAdd<P extends ArrayPaths<T>>(
			path: P,
			value: NonNullable<ValueFromPath<T, P>> extends readonly (infer I)[] ? I : never,
			idx: number | undefined = undefined,
			opts: FieldOptions = {}
		) {
			const { shouldTouch = true, shouldDirty = true, shouldValidate = false } = opts;
			const arr = getValueByPath(form.data, path) as any[];
			const index = idx !== undefined ? idx : arr.length;

			setByPath(form.data, path, arrayInsert(arr, index, value));
			if (shouldTouch) setByPath(form.touched, path, true);
			if (shouldDirty) setByPath(form.dirty, path, true);
			if (validator && shouldValidate) validator.validateField(path, form, true);

			form.touched = shiftRecordKeys(form.touched, path, (old) => (old >= index ? old + 1 : old));
			form.dirty = shiftRecordKeys(form.dirty, path, (old) => (old >= index ? old + 1 : old));
			form.errors = shiftRecordKeys(form.errors, path, (old) => (old >= index ? old + 1 : old));
		},

		arrayRemove<P extends ArrayPaths<T>>(path: P, index: number, opts: FieldOptions = {}) {
			const { shouldTouch = true, shouldDirty = true, shouldValidate = false } = opts;
			const arr = getValueByPath(form.data, path) as any[];

			setByPath(form.data, path, arrayRemove(arr, index));
			if (shouldTouch) setByPath(form.touched, path, true);
			if (shouldDirty) setByPath(form.dirty, path, true);
			if (validator && shouldValidate) validator.validateField(path, form, true);

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

		arraySwap<P extends ArrayPaths<T>>(path: P, i: number, j: number, opts: FieldOptions = {}) {
			const { shouldTouch = true, shouldDirty = true, shouldValidate = false } = opts;
			const arr = getValueByPath(form.data, path) as any[];

			setByPath(form.data, path, arraySwap(arr, i, j));
			if (shouldTouch) setByPath(form.touched, path, true);
			if (shouldDirty) setByPath(form.dirty, path, true);
			if (validator && shouldValidate) validator.validateField(path, form, true);

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

		arrayMove<P extends ArrayPaths<T>>(path: P, from: number, to: number, opts: FieldOptions = {}) {
			if (from === to) return;
			const { shouldTouch = true, shouldDirty = true, shouldValidate = false } = opts;
			const arr = getValueByPath(form.data, path) as any[];

			setByPath(form.data, path, arrayMove(arr, from, to));
			if (shouldTouch) setByPath(form.touched, path, true);
			if (shouldDirty) setByPath(form.dirty, path, true);
			if (validator && shouldValidate) validator.validateField(path, form, true);

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

		setErrors(errors: Record<FlatPaths<T>, string[] | undefined>) {
			form.errors = structuredClone(errors);
		},

		setError(field: FlatPaths<T>, error: string | string[]) {
			form.errors[field] = Array.isArray(error) ? error : [error];
		},

		removeError(field: FlatPaths<T>) {
			delete form.errors[field];
		},

		validateField(field: FlatPaths<T>) {
			if (validator) return validator.validateField(field, form);
			return true;
		},

		validate() {
			if (validator) return validator.validateForm(form);
			return true;
		},

		handler(node: HTMLFormElement) {
			node.addEventListener('submit', (e) => {
				e.preventDefault();
				form.submit();
			});
		}
	});

	// =====================
	// internal helper
	// =====================

	function createSetData<T>() {
		function setData(values: T): void;
		function setData<P extends FlatPaths<T>>(field: P, value: ValueFromPath<T, P>): void;

		function setData(arg1: any, arg2?: any) {
			if (arg2 === undefined) {
				form.data = structuredClone(arg1);
			} else {
				setByPath(form.data, arg1, arg2);
			}
		}

		return setData;
	}

	function readValue(el: any, path: string) {
		const type = el.type;
		const tag = el.tagName.toLowerCase();

		if (type === 'file') {
			if (el.multiple) return Array.from(el.files || []);
			return el.files?.[0] ?? null;
		}

		if (tag === 'select') {
			if (el.multiple) {
				return Array.from(el.selectedOptions).map((o: any) => o.value);
			}
			return el.value;
		}

		if (type === 'checkbox') {
			const val = getValueByPath(form.data, path);
			if (Array.isArray(val)) {
				if (el.checked) {
					return val.includes(el.value) ? val : [...val, el.value];
				} else {
					return val.filter((v) => v !== el.value);
				}
			}
			return el.checked;
		}

		if (type === 'radio') {
			return el.checked ? el.value : getValueByPath(form.data, path);
		}

		if (tag === 'div' && el.isContentEditable) {
			return el.innerText;
		}

		return el.value;
	}

	function writeValue(el: any, value: any) {
		const type = el.type;
		const tag = el.tagName.toLowerCase();

		if (type === 'file') return;

		if (tag === 'select') {
			if (el.multiple && Array.isArray(value)) {
				Array.from(el.options).forEach((opt: any) => {
					opt.selected = value.includes(opt.value);
				});
			} else {
				el.value = value ?? '';
			}
			return;
		}

		if (type === 'checkbox') {
			if (Array.isArray(value)) el.checked = value.includes(el.value);
			else el.checked = Boolean(value);
			return;
		}

		if (type === 'radio') {
			el.checked = el.value === value;
			return;
		}

		if (tag === 'div' && el.isContentEditable) {
			if (el.innerText !== value) {
				el.innerText = value ?? '';
			}
			return;
		}

		el.value = value ?? '';
	}

	type ControlDataProps = {
		field: FlatPaths<T>;
		valueAsNumber?: boolean;
		setValueAs?: (v: any) => Promise<void> | void;
	};

	const control = (node: any, data: ControlDataProps | FlatPaths<T>) => {
		const {
			field: path,
			valueAsNumber = false,
			setValueAs = undefined
		} = (typeof data === 'string' ? { field: data } : data) as ControlDataProps;

		if (!path) return;

		const handleOnInput = async () => {
			let value = readValue(node, path);
			if (valueAsNumber) value = Number(value);

			if (setValueAs) {
				setValueAs(value);
				await tick();
				value = getValueByPath(form.data, path);
			} else {
				setByPath(form.data, path, value);
			}

			tick().then(async () => {
				const initial = getValueByPath(form.initialValues, path);
				const isPathDirty = JSON.stringify(initial) !== JSON.stringify(value);

				if (isPathDirty) form.dirty[path] = true;
				else delete form.dirty[path];

				form.isDirty = JSON.stringify(form.data) !== JSON.stringify(form.initialValues);

				await tick();

				if (
					node.type === 'radio' ||
					node.type === 'checkbox' ||
					node.type === 'select' ||
					node.type === 'file'
				) {
					form.touched[path] = true;
				}

				await tick();

				if (validator && validateOn.includes('change')) {
					validator.validateField(path, form);
				}
			});
		};

		const handleOnBlur = () => {
			form.touched[path] = true;
			tick().then(() => {
				if (validator && validateOn.includes('blur')) {
					validator.validateField(path, form);
				}
			});
		};

		const addListeners = () => {
			const tag = node.tagName?.toLowerCase();
			const type = (node.type ?? '').toLowerCase();

			const useChange =
				tag === 'select' || type === 'file' || type === 'checkbox' || type === 'radio';

			const useInput =
				tag === 'input' ||
				tag === 'textarea' ||
				(!useChange && tag === 'div' && node.isContentEditable);

			if (useInput) node.addEventListener('input', handleOnInput);
			if (useChange) node.addEventListener('change', handleOnInput);
			node.addEventListener('blur', handleOnBlur);

			return () => {
				if (useInput) node.removeEventListener('input', handleOnInput);
				if (useChange) node.removeEventListener('change', handleOnInput);
				node.removeEventListener('blur', handleOnBlur);
			};
		};

		const cleanup = addListeners();

		$effect(() => {
			const value = getValueByPath(form.data, path);
			untrack(() => {
				writeValue(node, value);
			});
		});

		return {
			destroy() {
				cleanup();
			}
		};
	};

	$effect(() => {
		JSON.stringify(form.errors);
		untrack(() => {
			form.isValid = Object.values(form.errors).every((v) => !v);
		});
	});

	return { form, control } as const;
}
