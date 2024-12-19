/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { tick, untrack } from 'svelte';
import { ZodEffects, type z } from 'zod';

type FormProps<T> = {
	initialValue: T;
	onSubmit?: (data: T) => Promise<void>;
	onChange?: (form: ReturnType<typeof useForm<T>>) => void;
	schema?: z.ZodObject<any> | z.ZodEffects<any>;
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
		capture: () => {
			const info = {
				initialValue: $state.snapshot(form.initialValue),
				data: $state.snapshot(form.data),
				errors: $state.snapshot(form.errors),
				touched: $state.snapshot(form.touched),
				isDirty: $state.snapshot(form.isDirty),
				isValid: $state.snapshot(form.isValid),
				isSubmitting: $state.snapshot(form.isSubmitting)
			};
			return structuredClone(info);
		},
		populate: (info: ReturnType<typeof form.capture>) => {
			form.data = structuredClone($state.snapshot(info.data)) as any;
			form.errors = structuredClone($state.snapshot(info.errors)) as any;
			form.touched = structuredClone($state.snapshot(info.touched)) as any;
			form.isDirty = info.isDirty;
			form.isValid = info.isValid;
			form.isSubmitting = info.isSubmitting;
		},
		setInitialValue: (value: T) => {
			form.initialValue = structuredClone({ ...value });
		},
		setField: <K extends keyof T>(field: K, value: T[K]) => {
			form.data[field] = structuredClone(value);
		},
		setData: <K extends keyof T>(...args: [K, T[K]] | [typeof initialValue]) => {
			if (args.length === 1) {
				const [field] = args;
				form.data = structuredClone({ ...field }) as T;
			} else {
				const [field, value] = args;
				form.data[field] = structuredClone(value);
			}
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
		validate: (field?: keyof T | (keyof T)[]) => {
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
				if (field && Array.isArray(field)) {
					const keys = field.reduce((acc, field) => {
						// @ts-ignore
						acc[field] = form.touched[field];
						return acc;
					}, {});
					const validation = schema.safeParse(form.data);
					// if (!validation.success) form.isValid = false;
					const result = transformToErrorArrays(validation.error?.format() ?? {});
					const filteredErrors = Object.keys(keys).reduce((acc, key) => {
						// @ts-ignore
						if (keys[key]) {
							// @ts-ignore
							acc[key] = result[key] ?? [];
						}
						return acc;
					}, {});
					tick().then(() => {
						form.errors = {
							...form.errors,
							...filteredErrors
						};
					});
				} else if (field) {
					const validation = (schema instanceof ZodEffects ? schema._def.schema : schema)
						.pick({
							[field]: true
						})
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
