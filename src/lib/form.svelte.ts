import { tick, untrack } from 'svelte';
import { checkPath, getByPath, getChangedPaths, setByPath } from './helper.js';

type Primitive = string | number | boolean | null | undefined;

type ArrayKey = `${number}`;

type Prev = [never, 0, 1, 2, 3, 4, 5];

type Path<T, D extends number = 5> = [D] extends [never]
	? never
	: T extends Primitive
		? ''
		: {
				[K in keyof T]: K extends string
					? T[K] extends Array<infer U>
						? `${K}` | `${K}.${ArrayKey}` | `${K}.${ArrayKey}.${Path<U, Prev[D]>}`
						: T[K] extends object
							? `${K}` | `${K}.${Path<T[K], Prev[D]>}`
							: `${K}`
					: never;
			}[keyof T];

type FormProps<T> = {
	initialValues: T;
	validator?: {
		validateField: (field: Path<T>, form: ReturnType<typeof useForm<T>>['form']) => boolean;
		validateForm: (form: ReturnType<typeof useForm<T>>['form']) => boolean;
	};
	onSubmit?: (data: T) => Promise<void>;
	onChange?: (field: Path<T>, value: any) => void;
	onReset?: () => void;
};

export type FormContext<T extends Record<string, any> = Record<string, any>> = {
	data: T;
	errors: Record<Path<T>, string[] | undefined>;
	initialValues: T;
	isValid: boolean;
	isSubmitting: boolean;
	isDirty: boolean;
	touched: Record<Path<T>, boolean | undefined>;
	handler: (node: HTMLFormElement) => void;
	setErrors: (errors: Record<Path<T>, string[]>) => void;
	setError: (field: Path<T>, error: string | string[]) => void;
	removeError: (field: Path<T>) => void;
	setInitialValues: (values: T, options?: { reset?: boolean }) => void;
	setIsDirty: (dirty: boolean) => void;
	setIsSubmitting: (submitting: boolean) => void;
	reset: () => void;
	resetField: (field: Path<T>) => void;
	submit: (callback?: (data: T) => any) => Promise<void>;
};

export default function useForm<T>({
	initialValues,
	validator,
	onSubmit,
	onChange,
	onReset
}: FormProps<T>) {
	if (Object.keys(initialValues || {}).some((k) => k.includes('.'))) {
		throw new Error('Nested paths are not supported');
	}

	const form = $state({
		initialValues,
		data: initialValues,
		errors: {} as Record<Path<T>, string[] | undefined>,
		isValid: true,
		isSubmitting: false,
		isDirty: false,
		touched: {} as Record<Path<T>, boolean | undefined>,
		setInitialValues: (values: T, { reset = false }: { reset?: boolean } = {}) => {
			const v = structuredClone($state.snapshot({ ...values })) as any;
			form.initialValues = v;
			if (reset) form.reset();
		},
		setIsDirty: (dirty: boolean = true) => {
			form.isDirty = dirty;
		},
		setIsSubmitting: (submitting: boolean = true) => {
			form.isSubmitting = submitting;
		},
		reset: () => {
			form.data = structuredClone($state.snapshot(form.initialValues)) as T;
			tick().then(() => {
				form.errors = {} as any;
				form.touched = {} as any;
				form.isValid = true;
				form.isSubmitting = false;
				form.isDirty = false;
				onReset?.();
			});
		},
		resetField: (field: Path<T>) => {
			if (checkPath(form.initialValues, field)) {
				const val = getByPath(structuredClone($state.snapshot(form.initialValues)), field);
				setByPath(form.data, field, val);
			} else {
				console.warn(`Field ${field} does not exist on initial values`);
				setByPath(form.data, field, undefined);
			}
			tick().then(() => {
				Object.keys(form.touched).forEach((key) => {
					// @ts-ignore
					if (key.includes('.') && key.startsWith(field)) form.touched[key] = undefined;
				});
			});
		},
		setErrors: (errors: Record<Path<T>, string[]>) => {
			form.errors = structuredClone(errors);
		},
		setError: (field: Path<T>, error: string | string[]) => {
			form.errors[field] = Array.isArray(error) ? error : [error];
		},
		removeError: (field: Path<T>) => {
			delete form.errors[field];
		},
		submit: async (callback?: (data: T) => any) => {
			if (validator) {
				if (!validator.validateForm(form)) return;
			}
			//
			if (form.isSubmitting) return;
			if (!form.isValid) return;
			form.isSubmitting = true;
			if (callback) await callback(form.data);
			// @ts-ignore
			else if (onSubmit) await onSubmit($state.snapshot(form.data));
			await tick();
			form.isSubmitting = false;
		},
		handler: (node: HTMLFormElement) => {
			node.addEventListener('submit', (event) => {
				event.preventDefault();
				form.submit();
			});
		}
	});

	$effect(() => {
		const equal = Object.keys(form.data!).every((key) => {
			// @ts-ignore
			const eq = JSON.stringify(form.data[key]) === JSON.stringify(form.initialValues[key]);
			return eq;
		});
		form.isDirty = !equal;
	});

	let prevData = $state.snapshot(form.data);
	$effect(() => {
		JSON.stringify(form.data);
		untrack(async () => {
			const currentData = structuredClone($state.snapshot(form.data));
			const changedFields = getChangedPaths(prevData, currentData);

			// debug
			// console.log('Changed fields:', changedFields);

			for (const path of changedFields) {
				form.touched[path as Path<T>] = true;
				const v = $state.snapshot(getByPath(form.data, path));
				if (onChange) {
					onChange(path as Path<T>, v);
				}
				//
				if (validator) {
					validator.validateField(path as Path<T>, form);
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
				// @ts-ignore
				Object.keys(form.errors).every((key) => (form.errors[key]?.length || 0) === 0);
		});
	});

	return { form };
}
