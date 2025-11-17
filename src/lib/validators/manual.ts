export function manualValidator(
	rules: Record<string, (value: any, values: any) => string[] | string | undefined>
) {
	return {
		validateForm(values: any) {
			const errors: Record<string, string[]> = {};

			for (const field in rules) {
				const res = rules[field](values[field], values);

				if (res) {
					errors[field] = Array.isArray(res) ? res : [res];
				}
			}

			return errors;
		},

		validateField(field: string, values: any) {
			const rule = rules[field];
			if (!rule) return undefined;

			const res = rule(values[field], values);
			if (!res) return undefined;

			return Array.isArray(res) ? res : [res];
		}
	};
}
