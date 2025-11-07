export const getJson = async <T>(path: string): Promise<T> => {
    const r = await fetch(path, {
        method: 'get',
    });
    if (!r.ok) {
        console.warn('unable to fetch', path);
        throw new Error(r.statusText);
    }
    return await r.json();
}