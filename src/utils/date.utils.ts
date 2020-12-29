export function getYearFromDateString(dateString?: string): string {
    if (!dateString) {
        return '';
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return `${date.getFullYear()}`;
}
