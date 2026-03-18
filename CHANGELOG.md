# Changelog

All notable changes to this project will documented in this file.

## [0.4.9] - 2026-03-18
### ✨ Features

- Added `arrayRemoveBy` and `arrayUpdateBy` helpers to remove or update array items via a predicate. These mirror existing array helpers (`arrayAdd`, `arrayRemove`, `arraySwap`, `arrayMove`) but operate by predicate for convenience.

### 🐛 Bug Fixes

- No bug fixes in this release.

### ⚠️ Breaking Changes

- Array manipulation helpers default `shouldValidate` changed from `false` to `true` when a validator is configured. Array operations (e.g. `arrayAdd`, `arrayRemove`, `arrayMove`, `arraySwap`, `arrayRemoveBy`, `arrayUpdateBy`) will now trigger validation by default. If you relied on the old behavior, pass `FieldOptions` with `shouldValidate: false` to opt out.

### ♻️ Code Quality

- Adjusted internal array helper implementations to centralize touch/dirty updates and validation triggering.

### 📚 Documentation

- Documented `arrayRemoveBy` and `arrayUpdateBy` in the Array Helpers section and clarified `FieldOptions` defaults for array operations.

### 🔄 Internal Changes

- Refactored array helper implementations to ensure touched/dirty state is set consistently during array operations.

### 🎯 Impact

- Improves ergonomics for array field operations and ensures array mutations participate in validation and state tracking by default.

## [0.4.8] - 2026-03-17

### 🐛 Bug Fixes

- **Validation Race Condition**: Introduced `resetGeneration` tracking to prevent async validation results from leaking into the state after a form `reset()` has been called.
- **Stale Async Results**: Implemented `activeRequests` counter to ensure `isValidating` accurately reflects in-flight promises across multiple fields.
- **Dirty State Logic**: Refactored `isDirty` to depend on the `form.dirty` record instead of a global `JSON.stringify` comparison of the entire data object, significantly improving performance for large forms.
- **Validation Over-triggering**: Added `validateDebounce` logic (default 100ms) to prevent "API hammering" when `validateOn: 'change'` is active.
- **Error Persistence**: Fixed logic in `control` action to automatically clear field errors when a value is manually reverted to its `initialValue`.

### ♻️ Code Quality

- **Modular Validation**: Extracted validation execution into a dedicated `executeValidation` helper to maintain consistency between debounced and immediate calls.
- **Internal State Management**: Added `debounceTimers` cleanup to prevent memory leaks from orphaned `setTimeout` calls when fields are updated rapidly.
- **Type Flexibility**: Updated `setError` signature to natively support both single `string` and `string[]` for easier manual error handling.

### 📚 Documentation

- **Debounce & Concurrency Section**: Added a new dedicated section explaining how `validateDebounce` works and how the library handles parallel validation requests.
- **Validator Signature Update**: Updated the `Validator` interface guide to include the new `force` and `config` parameters, explaining their role in granular validation control.
- **Race Condition Safety**: Added technical details regarding the _Generation Counter_ mechanism that prevents async validation results from leaking into the state after a form reset.
- **Improved Field Control**: Clarified the `use:control` documentation, specifically regarding the new auto-cleanup logic that removes errors when a field value is reverted to its original `initialValue`.

### ⚠️ Breaking Changes

- **Validator Interface**: The `validateField` method in the `Validator` type now accepts two additional arguments: `force: boolean` and a `config` object. Custom validator implementations must be updated to match this new signature.
- **FormControlContext Update**: Added `isValidating` and `validateDebounce` to the public context.

### 🔄 Internal Changes

- Replaced global `$effect` data-watch with a granular check on `form.dirty` values to determine `isDirty` status.
- Added `force` flag to `validateField` to distinguish between automatic event-driven validation and manual triggers.
- Wrapped validation calls in `Promise.resolve()` to safely handle both synchronous and asynchronous validator returns.

### 🎯 Impact

**High Reliability**: This release focuses on the "stability" of the form's internal state. By introducing generation tracking and debouncing, the library is now much more resilient to rapid user input and complex async validation workflows.

---

## [0.4.7] - 2026-02-11

- Initial Svelte 5 logic with `$state` and `$effect`.
- Support for complex nested paths and array manipulations (`arrayAdd`, `arrayRemove`, etc.).
