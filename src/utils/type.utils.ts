export function isDefined<T>(elem?: T | null): elem is T {
    return elem !== null && elem !== undefined;
}
