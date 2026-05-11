// Extracted validation helpers from form.svelte.ts
// Real split-engine preparation phase

import type { Validator } from './types';

export type ValidationContext<T = any> = {
	form: any;
	validator?: Validator<T>;
	validateOn: ('change' | 'blur' | 'submit')[];
	validateAfter: 'touched' | 'dirty' | 'touched-or-dirty' | 'touched-and-dirty';
	validateDebounce: number;
	debounceTimers: Record<string, ReturnType<typeof setTimeout>>;
	activeRequests: {
		value: number;
	};
	resetGeneration: {
		value: number;
	};
	setIsValidating: (value: boolean) => void;
};

export function safeValidateField<T>(
	ctx: ValidationContext<T>,
	path: string,
	force = false
) {
	const {
		form,
		validator,
		validateOn,
		validateAfter,
		validateDebounce,
		debounceTimers
	} = ctx;

	if (!validator) return;

	const rules = {
		dirty: () => form.dirty[path],
		touched: () => form.touched[path],
		'touched-or-dirty': () => form.touched[path] || form.dirty[path],
		'touched-and-dirty': () => form.touched[path] && form.dirty[path]
	};

	const rule = rules[validateAfter];
	const shouldValidate = force || (rule && rule());

	if (shouldValidate) {
		const isChangeEvent = validateOn.includes('change') && !force;
		const shouldDebounce = validateDebounce > 0 && isChangeEvent;

		if (shouldDebounce) {
			if (debounceTimers[path]) {
				clearTimeout(debounceTimers[path]);
			}

			debounceTimers[path] = setTimeout(() => {
				executeValidation(ctx, path);
				delete debounceTimers[path];
			}, validateDebounce);
		} else {
			executeValidation(ctx, path);
		}
	}
}

export function executeValidation<T>(ctx: ValidationContext<T>, path: string) {
	const {
		form,
		validator,
		validateOn,
		validateAfter,
		validateDebounce,
		activeRequests,
		resetGeneration,
		setIsValidating
	} = ctx;

	if (!validator) return;

	const currentResetGen = resetGeneration.value;

	activeRequests.value++;
	setIsValidating(true);

	Promise.resolve(
		validator.validateField(path as any, form, true, {
			validateOn,
			validateAfter,
			validateDebounce
		})
	).then(() => {
		activeRequests.value = Math.max(0, activeRequests.value - 1);

		if (resetGeneration.value !== currentResetGen) {
			form.errors = {} as any;
		}

		setIsValidating(activeRequests.value > 0);
	});
}
