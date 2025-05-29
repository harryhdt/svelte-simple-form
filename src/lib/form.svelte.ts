/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { tick, untrack } from 'svelte';
import { z } from 'zod';
import { checkPath, getByPath, getChangedPaths, setByPath } from './helper.js';
import { zodValidator } from './validation/zod.js';

type Primitive = string | number | boolean | null | undefined;

type ArrayKey = `${number}`; // use string-number to make it work in paths

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
	validation?:
		| {
				zod?: z.ZodObject<any> | z.ZodEffects<any>;
				relatedFields?: Record<string, string[]>;
		  }
		| undefined;
	onSubmit?: (data: T) => Promise<void>;
	onChange?: (field: Path<T>, value: any) => void;
	onReset?: () => void;
};

export default function useForm<T>({
	initialValues,
	validation,
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
		validate: (field?: Path<T> | Path<T>[]) => {
			if (validation?.zod) {
				let fields = Array.isArray(field) ? field : [field];
				const related = validation.relatedFields || {};

				const extraFields = fields.map((f) => related[f as string] || []).flat();

				fields = [...new Set([...fields, ...extraFields])] as Path<T>[];

				// Clear current errors for those fields
				for (const f of fields) {
					// @ts-ignore
					delete form.errors[f];
				}

				const errors = zodValidator(
					validation.zod,
					form.data,
					field ? (fields as string | string[]) : undefined
				);
				form.errors = {
					...form.errors,
					...errors
				};
			}
			return (
				Object.keys(form.errors).length === 0 ||
				// @ts-ignore
				Object.keys(form.errors).every((key) => (form.errors[key]?.length || 0) === 0)
			);
		},
		submit: async (callback?: (data: T) => any) => {
			if (form.isSubmitting) return;
			if (validation) {
				form.validate();
				await tick();
			}
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
				if (validation) {
					if (!checkPath(form.data, path)) {
						Object.keys(form.errors).forEach((key) => {
							// @ts-ignore
							if (key.includes('.') && key.startsWith(path)) form.errors[key] = undefined;
						});
						Object.keys(form.touched).forEach((key) => {
							// @ts-ignore
							if (key.includes('.') && key.startsWith(path)) form.touched[key] = undefined;
						});
					}
				}
			}
			if (validation) {
				form.validate(changedFields as Path<T>[]);
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
