import { tick, untrack } from 'svelte';
import { checkPath, getByPath, getChangedPaths, parseValidationResult, setByPath } from './helper.js';
import { type StandardObjectSchema, type Path } from './$types.ts';

type FormProps<T extends Record<string, unknown>> = {
	initialValues: T;
	validation?:
	| {
		/** @deprecated This property is deprecated and will be removed in a future release. */
		zod?: StandardObjectSchema<T>;
		schema?: StandardObjectSchema<T>;
		relatedFields?: Record<string, string[]>;
	};
	onSubmit?: (data: T) => Promise<void>;
	onChange?: (field: Path<T>, value: any) => void;
	onReset?: () => void;
};

export default function useForm<T extends Record<string, unknown>>({
	initialValues,
	validation,
	onSubmit,
	onChange,
	onReset
}: FormProps<T>) {
	if (Object.keys(initialValues || {}).some((k) => k.includes('.'))) {
		throw new Error('Nested paths are not supported');
	}

	/* The Standard Schema from either validation.schema or validation.zod */
	const schema = validation?.schema || validation?.zod;

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
		setError: (field: Path<T>, error: string | string[]) => {
			form.errors[field] = Array.isArray(error) ? error : [error];
		},
		validate: async (field?: Path<T> | Path<T>[]) => {
			if (schema) {
				let fields = Array.isArray(field) ? field : [field];
				const related = validation.relatedFields || {};

				const extraFields = fields.map((f) => related[f as string] || []).flat();

				fields = [...new Set([...fields, ...extraFields])] as Path<T>[];

				// Clear current errors for those fields
				for (const f of fields) {
					// @ts-ignore
					delete form.errors[f];
				}

				// Validate form using the Standard Schema function
				const validationResult = await schema['~standard'].validate(form.data);

				// Parse the Standard Schema validation result into a flat object
				const allFormErrors = parseValidationResult(validationResult);

				// Filter out fields that aren't desired to have errors
				const filteredErrors = Object.fromEntries(
					Object.entries(
						allFormErrors
					).filter(
						([key]) => fields.includes(key as Path<T>)
					)
				);

				// Update the form errors with the filtered errors
				form.errors = {
					...form.errors,
					...filteredErrors
				};
			}
			return (
				Object.keys(form.errors).length === 0 ||
				// @ts-expect-error
				Object.keys(form.errors).every((key) => (form.errors[key]?.length || 0) === 0)
			);
		},
		submit: async (callback?: (data: T) => any) => {
			if (form.isSubmitting) return;
			if (validation) {
				await form.validate();
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
				await form.validate(changedFields as Path<T>[]);
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
