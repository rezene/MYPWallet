
export function formatDate(isoString:string) {
    const date = new Date(isoString);

    // Get the components of the date
    const year = date.getUTCFullYear().toString();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    // Format the year to replace the first '2' with '2o'
    const formattedYear = year.replace(/^2/, '2');

    // Return the formatted date
    return `${formattedYear}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}