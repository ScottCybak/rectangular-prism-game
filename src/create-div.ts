export const createDiv = (id: string) => {
    const div = document.createElement('div');
    div.id = id;
    return div;
}