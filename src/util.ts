// Asynchronous sleep -- blocks if used with await
// https://flaviocopes.com/javascript-sleep/
export function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
