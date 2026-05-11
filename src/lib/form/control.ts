// Extracted control orchestration layer from form.svelte.ts
// Phase 7D-A - control foundation

import { getValueByPath } from './path';
import { readValue, writeValue } from './dom';
import { safeValidateField } from './validation';

import type { ControlDataProps } from './dom';
import type { FlatPaths } from './types';

export type CreateControlProps<T> = {
	form: any;
	validationContext?: any;
};

export function createControl<T>({ form, validationContext }: CreateControlProps<T>) {
	return function control(path: FlatPaths<T>, props?: ControlDataProps) {
		return function (node: HTMLElement & Record<string, any>) {
			const value = getValueByPath(form.data, path);
			writeValue(node, value);

			const updateValue = async () => {
				let value = readValue(node, form.data, path);

				if (props?.valueAsNumber) {
					value = value === '' ? undefined : Number(value);
				}

				if (props?.setValueAs) {
					await props.setValueAs(value);
				}

				form.setData(path as any, value, {
					shouldTouch: true,
					shouldDirty: true,
					shouldValidate: true
				});
			};

			const handleInput = () => {
				updateValue();
			};

			const handleChange = () => {
				updateValue();
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

			return {
				update() {
					const nextValue = getValueByPath(form.data, path);
					writeValue(node, nextValue);
				},

				destroy() {
					node.removeEventListener('input', handleInput);
					node.removeEventListener('change', handleChange);
					node.removeEventListener('blur', handleBlur);
				}
			};
		};
	};
}
