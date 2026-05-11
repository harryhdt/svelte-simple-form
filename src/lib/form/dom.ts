// Extracted DOM/control helpers from form.svelte.ts
// Real split-engine preparation phase

import { getValueByPath } from './path';

export function readValue(el: any, formData: any, path: string) {
	const type = el.type;
	const tag = el.tagName.toLowerCase();

	if (type === 'file') {
		if (el.multiple) return Array.from(el.files || []);
		return el.files?.[0] ?? null;
	}

	if (tag === 'select') {
		if (el.multiple) {
			return Array.from(el.selectedOptions).map((o: any) => o.value);
		}
		return el.value;
	}

	if (type === 'checkbox') {
		const val = getValueByPath(formData, path);

		if (Array.isArray(val)) {
			if (el.checked) {
				return val.includes(el.value) ? val : [...val, el.value];
			} else {
				return val.filter((v: any) => v !== el.value);
			}
		}

		return el.checked;
	}

	if (type === 'radio') {
		return el.checked ? el.value : getValueByPath(formData, path);
	}

	if (tag === 'div' && el.isContentEditable) {
		return el.innerText;
	}

	return el.value;
}

export function writeValue(el: any, value: any) {
	const type = el.type;
	const tag = el.tagName.toLowerCase();

	if (type === 'file') return;

	if (tag === 'select') {
		if (el.multiple && Array.isArray(value)) {
			Array.from(el.options).forEach((opt: any) => {
				opt.selected = value.includes(opt.value);
			});
		} else {
			el.value = value ?? '';
		}

		return;
	}

	if (type === 'checkbox') {
		if (Array.isArray(value)) el.checked = value.includes(el.value);
		else el.checked = Boolean(value);
		return;
	}

	if (type === 'radio') {
		el.checked = el.value === value;
		return;
	}

	if (tag === 'div' && el.isContentEditable) {
		if (el.innerText !== value) {
			el.innerText = value ?? '';
		}

		return;
	}

	el.value = value ?? '';
}

export type ControlDataProps = {
	field: string;
	valueAsNumber?: boolean;
	setValueAs?: (v: any) => Promise<void> | void;
};
