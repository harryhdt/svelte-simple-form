# Internal Form Engine Modules

This folder contains the ongoing internal refactor of `form.svelte.ts`.

Goals:

- Preserve backward compatibility
- Keep `form.svelte.ts` as the public facade
- Incrementally extract internal modules
- Reduce maintenance complexity
- Improve long-term scalability

Planned modules:

- `path.ts`
- `array.ts`
- `dirty.ts`
- `validation.ts`
- `dom.ts`
- `types.ts`
- `use-form.svelte.ts`
- `use-form-control.svelte.ts`
