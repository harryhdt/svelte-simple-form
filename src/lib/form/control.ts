// Extracted control orchestration layer from form.svelte.ts
// Compatibility parity runtime

import { getValueByPath } from './path';
import { readValue, writeValue } from './dom';

import type { ControlDataProps } from './dom';
import type { FlatPaths } from './types';

export type CreateControlProps<T> = {
	form: any;
	validationContext?: any;
};

export function createControl<T>({ form }: CreateControlProps<T>) {
	return function control(path: FlatPaths<T>, props?: ControlDataProps) {
		return function (node: HTMLElement & Record<string, any>) {
			const syncFromForm = () => {
				const value = getValueByPath(form.data, path);
				writeValue(node, value);
			};

			syncFromForm();

			const updateValue = async () => {
				let value = readValue(node, form.data, path);

				if (props?.valueAsNumber) {
					value = value === '' ? undefined : Number(value);
				}

				if (props?.setValueAs) {
					await props.setValueAs(value);
				}

				form.setData(path as any, value);
			};

			const type = node.type;
			const tag = node.tagName?.toLowerCase?.();

			const useChangeEvent =
				type === 'checkbox' ||
				type === 'radio' ||
				type === 'file' ||
				(tag === 'select' && node.multiple);

			let composing = false;

			const handleCompositionStart = () => {
				composing = true;
			};

			const handleCompositionEnd = () => {
				composing = false;
				updateValue();
			};

			const handleInput = () => {
				if (composing) return;

				if (!useChangeEvent) {
					updateValue();
				}
			};

			const handleChange = () => {
				updateValue();
			};

			const handleBlur = () => {
				form.setTouched(path, true);
			};

			node.addEventListener('input', handleInput);
			node.addEventListener('change', handleChange);
			node.addEventListener('blur', handleBlur);
			node.addEventListener('compositionstart', handleCompositionStart);
			node.addEventListener('compositionend', handleCompositionEnd);

			if (tag === 'div' && node.isContentEditable) {
				node.addEventListener('keyup', handleInput);
			}

			return {
				update() {
					syncFromForm();
				},

				destroy() {
					node.removeEventListener('input', handleInput);
					node.removeEventListener('change', handleChange);
					node.removeEventListener('blur', handleBlur);
					node.removeEventListener('compositionstart', handleCompositionStart);
					node.removeEventListener('compositionend', handleCompositionEnd);

					if (tag === 'div' && node.isContentEditable) {
						node.removeEventListener('keyup', handleInput);
					}
				}
			};
		};
	};
}
