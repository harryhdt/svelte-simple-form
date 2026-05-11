// Extracted type system from form.svelte.ts
// Real split-engine preparation phase

export type Primitive =
	| string
	| number
	| boolean
	| symbol
	| null
	| undefined
	| bigint
	| File
	| Blob
	| FileList
	| Date
	| RegExp
	| ArrayBuffer
	| DataView
	| Int8Array
	| Uint8Array
	| Uint8ClampedArray
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Float32Array
	| Float64Array
	| BigInt64Array
	| BigUint64Array
	| Map<any, any>
	| Set<any>
	| WeakMap<any, any>
	| WeakSet<any>;

export type Paths<T, Prev extends string = ''> = T extends Primitive
	? Prev
	: T extends readonly (infer U)[] | (infer U)[]
		? [U] extends [never]
			? Prev | `${Prev}.${number}`
			: U extends Primitive
				? Prev | `${Prev}.${number}`
				: Prev | `${Prev}.${number}` | Paths<U, `${Prev}.${number}`>
		: T extends object
			? string extends keyof T
				? any
				: number extends keyof T
					? any
					: {
							[K in keyof T & string]: Prev extends ''
								? Paths<T[K], K>
								: Paths<T[K], `${Prev}.${K}`>;
						}[keyof T & string]
			: Prev;

export type FlatPaths<T> =
	Exclude<Paths<T, ''>, ''> extends infer P
		? [P] extends [never]
			? string
			: Extract<P, string>
		: string;

export type IsArrayLike<T> = T extends readonly (infer _I)[]
	? true
	: NonNullable<T> extends readonly (infer _I)[]
		? true
		: false;

export type Split<S extends string> = S extends `${infer A}.${infer B}`
	? [A, ...Split<B>]
	: [S];

export type _ValueFromParts<T, Parts extends readonly string[]> = Parts extends []
	? T
	: Parts extends [infer Head extends string, ...infer Rest extends string[]]
		? Head extends `${number}`
			? T extends readonly (infer U)[] | (infer U)[]
				? _ValueFromParts<U, Rest>
				: never
			: Head extends keyof T
				? _ValueFromParts<T[Head], Rest>
				: never
		: never;

export type ValueFromPath<T, P extends FlatPaths<T>> = _ValueFromParts<T, Split<P>>;

export type ArrayPaths<T> = {
	[P in FlatPaths<T>]: IsArrayLike<ValueFromPath<T, P>> extends true ? P : never;
}[FlatPaths<T>];

export type ArrayItem<T, P extends FlatPaths<T>> =
	NonNullable<ValueFromPath<T, P>> extends readonly (infer I)[] ? I : never;

export type ControlDataProps = {
	field?: string;
	valueAsNumber?: boolean;
	setValueAs?: (v: any) => Promise<void> | void;
};

export type Validator<T = any> = {
	validateField(
		field: FlatPaths<T>,
		form: FormControlContext<T>,
		force?: boolean,
		config?: {
			validateOn?: string[];
			validateAfter?: string;
			validateDebounce?: number;
		}
	): boolean | Promise<boolean>;

	validateForm(form: FormControlContext<T>): boolean | Promise<boolean>;
};

export type FormContext<T = Record<string, any>> = {
	initialValues: T;
	data: T;
	reset: () => void;
	submit: (callback?: (data: T) => any) => Promise<void>;
};

export type FormControlContext<T = Record<string, any>> = {
	initialValues: T;
	data: T;
	errors: Record<FlatPaths<T>, string[] | undefined>;
	touched: Record<FlatPaths<T>, boolean | undefined>;
	dirty: Record<FlatPaths<T>, boolean | undefined>;
	isValid: boolean;
	isValidating: boolean;
	isSubmitting: boolean;
	isDirty: boolean;
	reset: () => void;
	resetField: (path: FlatPaths<T>) => void;
	submit: (callback?: (data: T) => any) => Promise<void>;
	setInitialValues: (values: T, props?: { reset?: boolean }) => void;
	setData: {
		(values: T, props?: { shouldValidate?: boolean }): void;
		<P extends FlatPaths<T>>(
			field: P,
			value: ValueFromPath<T, P>,
			props?: FieldOptions
		): void;
	};
	setIsValid: (isValid: boolean) => void;
	setIsValidating: (isValidating: boolean) => void;
	setTouched: (field: FlatPaths<T>, value?: boolean) => void;
	removeTouched: (field: FlatPaths<T>) => void;
	setDirty: (field: FlatPaths<T>, value?: boolean) => void;
	removeDirty: (field: FlatPaths<T>) => void;
	control: <P extends FlatPaths<T>>(
		path: P,
		props?: ControlDataProps
	) => (node: HTMLElement & Record<string, any>) => {
		update?: () => void;
		destroy?: () => void;
	};
	arrayAdd: <P extends ArrayPaths<T>>(
		path: P,
		value: NonNullable<ValueFromPath<T, P>> extends readonly (infer I)[] ? I : never,
		idx?: number | undefined,
		opts?: FieldOptions
	) => void;
	arrayRemove: <P extends ArrayPaths<T>>(path: P, index: number, opts?: FieldOptions) => void;
	arraySwap: <P extends ArrayPaths<T>>(path: P, i: number, j: number, opts?: FieldOptions) => void;
	arrayMove: <P extends ArrayPaths<T>>(
		path: P,
		from: number,
		to: number,
		opts?: FieldOptions
	) => void;
	arrayRemoveBy: <P extends ArrayPaths<T>>(
		path: P,
		predicate: (item: ArrayItem<T, P>) => boolean,
		opts?: FieldOptions
	) => void;
	arrayUpdateBy: <P extends ArrayPaths<T>>(
		path: P,
		predicate: (item: ArrayItem<T, P>) => boolean,
		value: ArrayItem<T, P> | ((prev: ArrayItem<T, P>) => ArrayItem<T, P>),
		opts?: FieldOptions
	) => void;
	setErrors: (errors: Record<string, string[] | undefined>) => void;
	setError: (field: FlatPaths<T>, error: string | string[]) => void;
	removeError: (field: FlatPaths<T>) => void;
	validateField: (field: FlatPaths<T>) => Promise<boolean>;
	validate: () => Promise<boolean>;
	handler: (node: HTMLFormElement) => {
		destroy?: () => void;
	};
};

export type FormProps<T> = {
	initialValues: T;
	onSubmit?: (data: T) => Promise<void>;
	onReset?: () => void;
};

export type FormControlProps<T> = FormProps<T> & {
	validator?: Validator<T>;
	validateOn?: ('change' | 'blur' | 'submit')[];
	validateAfter?: 'touched' | 'dirty' | 'touched-or-dirty' | 'touched-and-dirty';
	validateDebounce?: number;
};

export type FieldOptions = {
	shouldTouch?: boolean;
	shouldDirty?: boolean;
	shouldValidate?: boolean;
};
