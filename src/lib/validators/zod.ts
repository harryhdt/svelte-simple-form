import type { ZodTypeAny } from 'zod';

export function zodValidator(schema: ZodTypeAny) {
	return {
		validateForm(values: any) {
			const res = schema.safeParse(values);
			if (res.success) return {};

			const errors: Record<string, string[]> = {};
			for (const issue of res.error.issues) {
				const key = issue.path.join('.') || '_form';
				if (!errors[key]) errors[key] = [];
				errors[key].push(issue.message);
			}
			return errors;
		},

		validateField(field: string, values: any) {
			const allErrors = this.validateForm(values);

			return allErrors[field];
		}
	};
}
