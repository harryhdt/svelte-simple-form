import type { StandardSchemaV1 } from "@standard-schema/spec";

type Primitive = string | number | boolean | null | undefined;

type ArrayKey = `${number}`;

type Prev = [never, 0, 1, 2, 3, 4, 5];

export type Path<T, D extends number = 5> = [D] extends [never]
	? never
	: T extends Primitive
		? ''
		: {
				[K in keyof T]: K extends string
					? T[K] extends Array<infer U>
						? `${K}` | `${K}.${ArrayKey}` | `${K}.${ArrayKey}.${Path<U, Prev[D]>}`
						: T[K] extends object
							? `${K}` | `${K}.${Path<T[K], Prev[D]>}`
							: `${K}`
					: never;
			}[keyof T];

export type StandardObjectSchema<
    Input extends Record<string, unknown>, Output = Input
> = StandardSchemaV1<Input, Output>;

export type StandardObjectSchemaResult<T extends Record<string, unknown>> = StandardSchemaV1.Result<T>;
