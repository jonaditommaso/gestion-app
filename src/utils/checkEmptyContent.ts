export const checkEmptyContent = (html: string | undefined | null): boolean | undefined => {
    if (!html) return true;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Elimina todos los espacios en blanco y saltos de línea en texto plano
    const textContent = tempDiv.textContent?.replace(/\s|\u00A0/g, '') ?? '';

    // Si hay texto real, hay contenido
    if (textContent.length > 0) return false;

    // Si hay imágenes, videos o embeds, también hay contenido
    const hasMedia = tempDiv.querySelector('img, video, iframe, embed, object');
    if (hasMedia) return false;

    // Si no hay texto ni medios, se considera vacío
    return true;
};