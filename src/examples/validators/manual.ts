/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormContext } from '$lib/form.svelte.ts';

export function manualValidator<
	T extends Record<string, (value: any, allValues: any) => string | undefined>
>(
	rules: T,
	options?:
		| {
				dependencies?: Partial<Record<keyof T & string, (keyof T & string)[]>>;
		  }
		| undefined
) {
	function mapErrors(values: any) {
		const errors: Record<string, string[]> = {};

		for (const key in rules) {
			const rule = rules[key];
			const message = rule(values[key], values);
			if (message) {
				(errors[key] ??= []).push(message);
			}
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
			}
			return true;
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
