import type { FormContext } from '$lib/form.svelte.ts';
import type { ZodType } from 'zod';

export function zodValidator<T extends ZodType<any>>(
	schema: T,
	options:
		| {
				dependencies?: Partial<Record<string, string[]>>;
		  }
		| undefined = undefined
) {
	function mapErrors(values: any) {
		const res = schema.safeParse(values);
		if (res.success) return {};
		const errors: Record<string, string[]> = {};
		for (const issue of res.error.issues) {
			const key = issue.path.join('.') || '_form';
			(errors[key] ??= []).push(issue.message);
		}
		return errors;
	}

	return {
		validateForm(form: FormContext) {
			form.setErrors({});
			const errors = mapErrors(form.data);
			if (Object.keys(errors).length) {
				form.setErrors(errors);
				return false;
			} else {
				return true;
			}
		},
		validateField(field: string, form: FormContext) {
			const allErrors = mapErrors(form.data);
			const deps = options?.dependencies?.[field] ?? [];
			const fieldsToCheck = [field, ...deps];
			let valid = true;
			for (const key of fieldsToCheck) {
				if (!form.touched[key]) continue;
				const errs = allErrors[key];
				if (errs && errs.length > 0) {
					valid = false;
					form.setError(key, errs);
				} else {
					form.removeError(key);
				}
			}
			return valid;
		}
	};
}
