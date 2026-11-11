/**
 * Generic utility function for streaming results from a collection of promises
 * Yields each result as soon as it completes, without waiting for all promises
 *
 * @param promises Array of promises to process in parallel
 */
export async function* streamPromiseResults<R>(promises: Promise<R | null>[]): AsyncGenerator<R, void, unknown> {
  const remaining = [...promises];

  while (remaining.length > 0) {
    try {
      const nextPromiseIndex = await Promise.race(
        remaining.map((promise, index) =>
          promise
            .then(() => index)
            .catch(() => {
              console.error(`Error processing an item, skipping.`);
              return index;
            }),
        ),
      );

      const result = await remaining[nextPromiseIndex];
      remaining.splice(nextPromiseIndex, 1);

      if (result) yield result;
    } catch (err) {
      console.error("Error in streamPromiseResults:", err);
    }
  }
}
