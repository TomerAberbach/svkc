/**
 * A {@link Map} with
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness | SameValue}
 * semantics.
 */
export class SameValueMap<K, V> extends Map<K, V> {}

/**
 * A {@link Set} with
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness | SameValue}
 * semantics.
 */
export class SameValueSet<T> extends Set<T> {}
