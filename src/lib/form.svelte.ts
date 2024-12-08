/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z, ZodIssue } from 'zod';

type FormProps<T> = {
	initialValue: T;
	onSubmit?: (data: T) => Promise<void>;
	onChange?: (form: ReturnType<typeof useForm<T>>) => void;
	schema?: z.ZodObject<any>;
};

type ArrayKeys<T> = keyof {
	[K in keyof T as T[K] extends Array<any> ? K : never]: T[K];
};

type ConvertToEmptyArrays<T> = {
	[K in keyof T]: T[K] extends any[]
		? string[]
		: T[K] extends object
			? ConvertToEmptyArrays<T[K]>
			: string[];
};

export default function useForm<T>({ initialValue, onSubmit, onChange, schema }: FormProps<T>) {
	const initialErrors: ConvertToEmptyArrays<typeof initialValue> = JSON.parse(
		JSON.stringify(initialValue, (_, value) =>
			typeof value === 'object' && !Array.isArray(value) ? value : []
		)
	);

	const form = $state({
		initialValue,
		data: initialValue,
		errors: initialErrors,
		isValid: true,
		isSubmitting: false,
		isDirty: false,
		setInitialValue: (value: T) => {
			form.initialValue = value;
		},
		setField: <K extends keyof T>(field: K, value: T[K]) => {
			form.data[field] = value;
		},
		reset: () => {
			form.data = form.initialValue;
		},
		resetField: (field: keyof T) => {
			form.data[field] = form.initialValue[field];
		},
		arrayField: <K extends ArrayKeys<T>>(field: K) => {
			type V = T[K] extends (infer U)[] ? U : any;
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
			form.isSubmitting = true;
			if (callback) await callback(form.data);
			// @ts-ignore
			else if (onSubmit) await onSubmit($state.snapshot(form.data));
			form.isSubmitting = false;
		},
		validate: (field?: keyof T) => {
			if (schema) {
				const mergeErrors = (initialErrors: any, result: any) => {
					for (const key in result) {
						if (Array.isArray(result[key])) {
							if (result[key].length > 0) {
								initialErrors[key] = result[key];
							}
						} else if (typeof result[key] === 'object' && result[key] !== null) {
							if (initialErrors[key]) {
								initialErrors[key] = mergeErrors(initialErrors[key], result[key]);
							} else {
								initialErrors[key] = result[key];
							}
						}
					}
					return initialErrors;
				};
				const mappedZodErrors = (issues: ZodIssue[] | undefined) => {
					const result: Record<string, any> = {};
					issues?.forEach((issue) => {
						const path = issue.path;
						let current = result;
						for (let i = 0; i < path.length; i++) {
							const key = path[i];
							if (i === path.length - 1) {
								if (!current[key]) current[key] = [];
								current[key].push(issue.message);
							} else {
								if (!current[key]) current[key] = {};
								current = current[key];
							}
						}
					});
					return result;
				};
				if (field) {
					const validation = schema
						// @ts-ignore
						.pick({ [field]: true })
						.safeParse({ [field]: form.data[field] });
					if (!validation.success) form.isValid = false;
					const result = mappedZodErrors(validation.error?.issues);
					form.errors = mergeErrors(JSON.parse(JSON.stringify(initialErrors)), result);
				} else {
					const validation = schema.safeParse(form.data);
					form.isValid = validation.success;
					const result = mappedZodErrors(validation.error?.issues);
					form.errors = mergeErrors(JSON.parse(JSON.stringify(initialErrors)), result);
				}
			}
		}
	});

	$effect(() => {
		const equal = Object.keys(form.initialValue!).every(
			// @ts-ignore
			(key) => JSON.stringify(form.data[key]) === JSON.stringify(form.initialValue[key])
		);
		form.isDirty = !equal;
		if (onChange) onChange(form as any);
		//
		if (schema) form.validate();
	});

	const enhance = (node: HTMLFormElement) => {
		node.addEventListener('submit', (event) => {
			event.preventDefault();
			form.submit();
		});
	};

	return { form, enhance };
}
