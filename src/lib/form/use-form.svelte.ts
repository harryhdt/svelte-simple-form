// Extracted useForm engine from form.svelte.ts
// Real split-engine preparation phase

import { tick } from 'svelte';

import type { FormProps } from './types';

export function useForm<T>(props: FormProps<T>) {
	const { initialValues, onSubmit, onReset } = props;

	const form = $state({
		initialValues,
		data: initialValues,
		isSubmitting: false,

		reset() {
			(async () => {
				form.data = structuredClone($state.snapshot(form.initialValues)) as T;
				await tick();
				form.isSubmitting = false;
				await tick();
				onReset?.();
			})();
		},

		async submit(callback?: (data: T) => any) {
			form.isSubmitting = true;

			if (callback) {
				await callback(form.data);
			} else if (onSubmit) {
				await onSubmit($state.snapshot(form.data) as T);
			}

			await tick();
			form.isSubmitting = false;
		},

		handler(node: HTMLFormElement) {
			const handleSubmit = (e: Event) => {
				e.preventDefault();
				form.submit();
			};

			node.addEventListener('submit', handleSubmit);

			return {
				destroy() {
					node.removeEventListener('submit', handleSubmit);
				}
			};
		}
	});

	return { form };
}
