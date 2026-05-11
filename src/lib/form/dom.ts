// Extracted DOM/control helpers from form.svelte.ts
// Real split-engine preparation phase

import { getValueByPath } from './path';

export function readValue(el: any, formData: any, path: string) {
	const type = el.type;
	const tag = el.tagName.toLowerCase();

	if (type === 'file') {
		if (el.multiple) {
			return Array.from(el.files || []);
		}

		return el.files?.[0] ?? null;
	}

	if (tag === 'select') {
		if (el.multiple) {
			return Array.from(el.selectedOptions).map((o: any) => o.value);
		}

		return el.value;
	}

	if (type === 'checkbox') {
		const current = getValueByPath(formData, path);

		if (Array.isArray(current)) {
			if (el.checked) {
				return current.includes(el.value) ? current : [...current, el.value];
			}

			return current.filter((v: any) => v !== el.value);
		}

		return Boolean(el.checked);
	}

	if (type === 'radio') {
		return el.checked ? el.value : getValueByPath(formData, path);
	}

	if (tag === 'div' && el.isContentEditable) {
		return el.innerText;
	}

	if (type === 'number') {
		return el.value;
	}

	return el.value;
}

export function writeValue(el: any, value: any) {
	const type = el.type;
	const tag = el.tagName.toLowerCase();

	if (type === 'file') {
		return;
	}

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
		if (Array.isArray(value)) {
			el.checked = value.includes(el.value);
		} else {
			el.checked = Boolean(value);
		}

		return;
	}

	if (type === 'radio') {
		el.checked = el.value === value;
		return;
	}

	if (tag === 'div' && el.isContentEditable) {
		const nextValue = value ?? '';

		if (el.innerText !== nextValue) {
			const selection = window.getSelection?.();
			const active = document.activeElement === el;

			el.innerText = nextValue;

			if (active && selection && el.lastChild) {
				const range = document.createRange();
				range.selectNodeContents(el);
				range.collapse(false);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}

		return;
	}

	el.value = value ?? '';
}
