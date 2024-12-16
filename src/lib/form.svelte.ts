/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { untrack } from 'svelte';
import type { z } from 'zod';

type FormProps<T> = {
	initialValue: T;
	onSubmit?: (data: T) => Promise<void>;
	onChange?: (form: ReturnType<typeof useForm<T>>) => void;
	schema?: z.ZodObject<any>;
};

type ArrayKeys<T> = keyof {
	[K in keyof T as T[K] extends Array<any> ? K : never]: T[K];
};

type ZodError<T, V> = {
	[K in keyof T]?: T[K] extends Array<infer U>
		? U extends object
			? { [index: string | number]: ZodError<U, V> }
			: { [index: string | number]: V }
		: T[K] extends Record<string | number, unknown>
			? ZodError<T[K], V>
			: V;
};

export default function useForm<T>({ initialValue, onSubmit, onChange, schema }: FormProps<T>) {
	const initialErrors: ZodError<typeof initialValue, string[] | undefined> = JSON.parse(
		JSON.stringify(initialValue, (_, value) =>
			typeof value === 'object' && !Array.isArray(value) ? value : []
		)
	);
	const initialTouched = Object.keys(initialValue!).reduce((acc, key) => {
		// @ts-ignore
		acc[key] = false;
		return acc;
	}, {}) as Record<keyof T, boolean>;

	const form = $state({
		initialValue,
		data: initialValue,
		errors: initialErrors,
		isValid: true,
		isSubmitting: false,
		isDirty: false,
		touched: initialTouched,
		setInitialValue: (value: T) => {
			form.initialValue = structuredClone(value);
		},
		setField: <K extends keyof T>(field: K, value: T[K]) => {
			form.data[field] = structuredClone(value);
		},
		setError: <K extends keyof T>(field: K, error: (typeof initialErrors)[K]) => {
			form.errors[field] = structuredClone(error);
		},
		setErrors: (errors: typeof initialErrors) => {
			form.errors = structuredClone($state.snapshot(errors)!);
		},
		setIsDirty: (dirty: boolean = true) => {
			form.isDirty = dirty;
		},
		setTouched: <K extends keyof T>(field: K | typeof initialTouched, touched: boolean = true) => {
			if (typeof field === 'object') {
				form.touched = structuredClone(field);
			} else {
				form.touched[field] = touched;
			}
		},
		setIsSubmitting: (submitting: boolean = true) => {
			form.isSubmitting = submitting;
		},
		reset: () => {
			form.data = structuredClone($state.snapshot(form.initialValue)) as T;
			form.errors = structuredClone(initialErrors);
			form.isValid = true;
			form.isDirty = false;
			form.touched = structuredClone(initialTouched);
		},
		resetField: (field: keyof T) => {
			form.data[field] = structuredClone(form.initialValue[field]);
		},
		arrayField: <K extends ArrayKeys<T>>(field: K) => {
			type V = [T[K]] extends [never[]] ? any : T[K] extends (infer U)[] ? U : any;
			return {
				add: (value: V, index?: number) => {
					if (Number.isInteger(index) && index! >= 0) {
						(form.data[field] as any[]).splice(index!, 0, value);
					} else {
						(form.data[field] as any[]).push(value);
					}
				},
				remove: (value: V) => {
					form.data[field] = (form.data[field] as any[]).filter(
						(item: any) => JSON.stringify(item) !== JSON.stringify(value)
					) as T[K];
				},
				have: (value: V) => {
					return (form.data[field] as any[]).some(
						(item: any) => JSON.stringify(item) === JSON.stringify(value)
					);
				}
			};
		},
		submit: async (callback?: (data: T) => any) => {
			form.validate();
			if (!form.isValid) return;
			form.isSubmitting = true;
			if (callback) await callback(form.data);
			// @ts-ignore
			else if (onSubmit) await onSubmit($state.snapshot(form.data));
			form.isSubmitting = false;
		},
		validate: (field?: keyof T) => {
			if (schema) {
				const areAllErrorsEmpty = (errors: any) => {
					for (const key in errors) {
						const value = errors[key];

						if (Array.isArray(value)) {
							// Check if the array is not empty
							if (value.length > 0) {
								return false;
							}
						} else if (typeof value === 'object' && value !== null) {
							// Recursively check nested objects
							if (!areAllErrorsEmpty(value)) {
								return false;
							}
						}
					}
					return true;
				};
				const transformToErrorArrays = (obj: any) => {
					const result = {};
					for (const key in obj) {
						if (key === '_errors') {
							continue; // Skip the top-level _errors key
						}
						if (obj[key]._errors && obj[key]._errors.length > 0) {
							// @ts-ignore
							result[key] = obj[key]._errors;
						} else if (typeof obj[key] === 'object' && obj[key] !== null) {
							// @ts-ignore
							result[key] = transformToErrorArrays(obj[key]);
						} else {
							// @ts-ignore
							result[key] = [];
						}
					}
					return result;
				};
				if (field) {
					const validation = schema
						// @ts-ignore
						.pick({ [field]: true })
						.safeParse({ [field]: form.data[field] });
					if (!validation.success) form.isValid = false;
					const result = transformToErrorArrays(validation.error?.format() ?? {});
					if (!Array.isArray(initialErrors[field])) {
						// @ts-ignore
						result[field] = {
							...initialErrors[field],
							// @ts-ignore
							...result[field]
						};
					}
					form.errors = {
						...form.errors,
						// @ts-ignore
						[field]: result[field] ?? []
					};
					//
					const noErrors = areAllErrorsEmpty(form.errors);
					if (noErrors) form.isValid = true;
				} else {
					const validation = schema.safeParse(form.data);
					form.isValid = validation.success;
					form.errors = transformToErrorArrays(
						validation.error?.format() ?? {}
					) as typeof initialErrors;
				}
			}
			return form.isValid;
		}
	});

	$effect(() => {
		const equal = Object.keys(form.data!).every((key) => {
			// @ts-ignore
			const eq = JSON.stringify(form.data[key]) === JSON.stringify(form.initialValue[key]);
			return eq;
		});
		form.isDirty = !equal;
		untrack(() => (onChange ? onChange(form as any) : null));
	});

	Object.keys(form.data!).forEach((key) => {
		$effect(() => {
			// @ts-ignore
			if (JSON.stringify(form.data[key]) !== JSON.stringify(form.initialValue[key])) {
				// @ts-ignore
				form.touched[key] = true;
			}
			untrack(() => {
				// @ts-ignore
				if (form.touched[key]) form.validate(key);
			});
		});
	});

	const enhance = (node: HTMLFormElement) => {
		node.addEventListener('submit', (event) => {
			event.preventDefault();
			form.submit();
		});
	};

	return { form, enhance };
}
