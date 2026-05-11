// Extracted control orchestration layer from form.svelte.ts
// Phase 7D-A - control foundation

import { readValue, writeValue } from './dom';
import { safeValidateField } from './validation';

import type { FlatPaths } from './types';

export type CreateControlProps<T> = {
	form: any;
	validationContext?: any;
};

export function createControl<T>({ form, validationContext }: CreateControlProps<T>) {
	return function control(path: FlatPaths<T>) {
		return function (node: HTMLElement & Record<string, any>) {
			let mounted = true;

			const syncFromForm = () => {
				if (!mounted) return;

				const value = form.data
					? path.split('.').reduce((acc: any, key: string) => acc?.[key], form.data)
					: undefined;

				writeValue(node, value);
			};

			const syncToForm = () => {
				const value = readValue(node, form.data, path);

				form.setData(path as any, value, {
					shouldTouch: true,
					shouldDirty: true,
					shouldValidate: true
				});
			};

			const handleInput = () => {
				syncToForm();
			};

			const handleChange = () => {
				syncToForm();
			};

			const handleBlur = () => {
				form.setTouched(path, true);

				if (validationContext) {
					safeValidateField(validationContext, path, true);
				}
			};

			node.addEventListener('input', handleInput);
			node.addEventListener('change', handleChange);
			node.addEventListener('blur', handleBlur);

			syncFromForm();

			const interval = setInterval(syncFromForm, 50);

			return {
				update() {
					syncFromForm();
				},

				destroy() {
					mounted = false;

					clearInterval(interval);

					node.removeEventListener('input', handleInput);
					node.removeEventListener('change', handleChange);
					node.removeEventListener('blur', handleBlur);
				}
			};
		};
	};
}
