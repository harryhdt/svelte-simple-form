/* eslint-disable @typescript-eslint/no-explicit-any */
import { getByPath } from '../helper.js';
import { z } from 'zod';

type FlatZodErrors = Record<string, string[]>;

function flattenZodErrors(obj: any, path = '', result: FlatZodErrors = {}): FlatZodErrors {
	for (const key in obj) {
		if (key === '_errors') {
			if (obj[key].length > 0 && path) {
				result[path] = obj[key];
			}
			continue;
		}
		const newPath = path ? `${path}.${key}` : key;
		if (typeof obj[key] === 'object' && obj[key] !== null) {
			flattenZodErrors(obj[key], newPath, result);
		}
	}
	return result;
}

function unwrapEffects(schema: z.ZodTypeAny): z.ZodTypeAny {
	while (schema instanceof z.ZodEffects) {
		schema = schema._def.schema;
	}
	return schema;
}

function getSchemaByPath(schema: z.ZodTypeAny, path: string): z.ZodTypeAny | null {
	const keys = path.split('.');
	let current: z.ZodTypeAny = unwrapEffects(schema);

	for (const key of keys) {
		if (current instanceof z.ZodObject) {
			current = unwrapEffects(current.shape[key]);
		} else if (current instanceof z.ZodArray) {
			const index = Number(key);
			if (isNaN(index)) return null;
			current = unwrapEffects(current._def.type);
		} else {
			return null;
		}
	}

	return current;
}

export function zodValidator<T>(
	schema: z.ZodTypeAny,
	formData: T,
	field?: string | string[]
): FlatZodErrors {
	const errors: FlatZodErrors = {};

	if (!field) {
		const result = schema.safeParse(formData);
		if (!result.success) {
			return flattenZodErrors(result.error.format());
		}
		return {}; // no errors
	}

	const fields = Array.isArray(field) ? field : [field];

	// Validate full form once (to catch cross-field refine errors)
	const fullResult = schema.safeParse(formData);
	const fullFlat = fullResult.success ? {} : flattenZodErrors(fullResult.error.format());

	for (const f of fields) {
		const fieldSchema = getSchemaByPath(schema, f);
		if (fieldSchema) {
			const value = getByPath(formData, f);
			const result = fieldSchema.safeParse(value);
			if (!result.success) {
				const flat = flattenZodErrors(result.error.format());
				if (flat[f]) errors[f] = flat[f];
			}
		}

		// Merge any errors from full schema (refine/cross-field)
		if (fullFlat[f]) {
			errors[f] = fullFlat[f];
		}
	}

	return errors;
}
