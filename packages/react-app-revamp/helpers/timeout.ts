export const MAX_TIME_TO_WAIT_FOR_RPC = 10000;

// https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value
export const MAX_MS_TIMEOUT = 2147483647;

export class TimeoutError extends Error {}

export async function executeWithTimeout<T>(timeoutDuration: number, targetPromise: Promise<T>): Promise<T> {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(
      () => reject(new TimeoutError(`Promise timed out after ${timeoutDuration}ms.`)),
      timeoutDuration,
    );
  });

  try {
    return await Promise.race([targetPromise, timeoutPromise]);
  } finally {
    clearTimeout(timerId);
  }
}
