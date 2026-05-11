import { readValue, writeValue } from './dom';
import { getValueByPath } from './path';

import type { ControlDataProps, FlatPaths } from './types';

export type CreateControlOptions<T> = {
	form: {
		data: T;
		setData: (path: string, value: unknown) => void;
		setTouched?: (path: string, value?: boolean) => void;
		validateField?: (path: string, force?: boolean) => void;
	};
};

export function createControl<T>({ form }: CreateControlOptions<T>) {
	return function control(path: FlatPaths<T>, props: ControlDataProps = {}) {
		return function (node: HTMLElement & Record<string, any>) {
			function syncNodeValue() {
				const value = getValueByPath(form.data, path);
				writeValue(node, value);
			}

			async function updateValue() {
				let value = readValue(node, form.data, path);

				if (props.valueAsNumber) {
					const str = String(value).trim();

					if (str === '' || str === '-') {
						value = str;
					} else {
						const parsed = Number(str);
						value = Number.isNaN(parsed) ? str : parsed;
					}
				}

				if (props.setValueAs) {
					await props.setValueAs(value);
				}

				form.setData(path, value);
			}

			const type = node.type;
			const tag = node.tagName?.toLowerCase?.();

			const useChangeEvent =
				type === 'checkbox' ||
				type === 'radio' ||
				type === 'file' ||
				(tag === 'select' && node.multiple);

			let composing = false;

			function handleCompositionStart() {
				composing = true;
			}

			function handleCompositionEnd() {
				composing = false;
				updateValue();
			}

			function handleInput() {
				if (composing) return;

				if (!useChangeEvent) {
					updateValue();
				}
			}

			function handleChange() {
				updateValue();
			}

			function handleBlur() {
				form.setTouched?.(path, true);

				form.validateField?.(path, true);
			}

			syncNodeValue();

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
					syncNodeValue();
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
