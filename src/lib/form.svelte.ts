import type { z } from 'zod';

type FormProps<T> = {
	initialValue: T;
	onSubmit?: (data: T) => Promise<void>;
	onChange?: (form: any) => void;
	schema?: z.ZodObject<any>;
};

type ArrayKeys<T> = {
	[K in keyof T]: T[K] extends any[] ? K : never;
}[keyof T];

export default function useForm<T>({ initialValue, onSubmit, onChange, schema }: FormProps<T>) {
	const initialErrors = Object.keys(initialValue!).reduce((acc, key) => {
		// @ts-ignore
		acc[key] = [];
		return acc;
	}, {});
	//
	const form = $state({
		enhance: (node: HTMLFormElement) => {
			node.addEventListener('submit', (event) => {
				event.preventDefault();
				form.submit();
			});
		},
		data: initialValue,
		errors: <{ [K in keyof T]: string[] }>initialErrors,
		isValid: true,
		isSubmitting: false,
		isDirty: false,
		setField: <K extends keyof T>(field: K, value: T[K]) => {
			form.data[field] = value;
		},
		reset: () => {
			form.data = initialValue;
		},
		resetField: (field: keyof T) => {
			form.data[field] = initialValue[field];
		},
		arrayField: <K extends ArrayKeys<T>>(field: K) => {
			type V = T[K] extends (infer U)[] ? U : never;
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
				if (field) {
					const validation = schema
						// @ts-ignore
						.pick({ [field]: true })
						.safeParse({ [field]: form.data[field] });
					if (!validation.success) form.isValid = false;
					const result = validation.error?.issues
						?.filter((x: any) => x.path[0] === field)
						.map((x: any) => x.message);
					if (result) {
						form.errors[field] = result;
					}
				} else {
					const validation = schema.safeParse(form.data);
					form.isValid = validation.success;
					const result = validation.error?.issues?.reduce((acc: any, x: any) => {
						const field = x.path[0];
						if (!acc[field]) {
							acc[field] = [];
						}
						acc[field].push(x.message);
						return acc;
					}, {});
					form.errors = {
						...initialErrors,
						...result
					};
				}
			}
		}
	});

	$effect(() => {
		// @ts-ignore
		const equal = Object.keys(initialValue).every((key) => form.data[key] === initialValue[key]);
		form.isDirty = !equal;
		if (onChange) onChange(form);
		//
		if (schema) form.validate();
	});

	return form;
}
