
const BASE_URL = 'https://dummyjson.com';

async function fetchJSON(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);
    if (!respuesta.ok) {
        const texto = await respuesta.text().catch(() => '');
        throw new Error(`Error ${respuesta.status}: ${texto || respuesta.statusText}`);
    }
    return respuesta.json();
}

/**
 * @param {number} pagina  - Número de página (desde 1)
 * @param {number} limite  - Cantidad de posts por página
 * @returns {{ posts: Array, total: number, skip: number, limit: number }}
 */
async function obtenerPosts(pagina = 1, limite = 10) {
    const skip = (pagina - 1) * limite;
    return fetchJSON(`${BASE_URL}/posts?limit=${limite}&skip=${skip}`);
}

/**
 * @param {number|string} id
 */
async function obtenerPostPorId(id) {
    return fetchJSON(`${BASE_URL}/posts/${id}`);
}

/**
 * @param {string} query
 */
async function buscarPosts(query) {
    return fetchJSON(`${BASE_URL}/posts/search?q=${encodeURIComponent(query)}`);
}

/**
 * @param {number|string} userId
 */
async function obtenerPostsPorUsuario(userId) {
    return fetchJSON(`${BASE_URL}/posts/user/${userId}`);
}

async function obtenerTags() {
    return fetchJSON(`${BASE_URL}/posts/tags`);
}

/**
 * @param {string} tag 
 */
async function obtenerPostsPorTag(tag) {
    return fetchJSON(`${BASE_URL}/posts/tag/${encodeURIComponent(tag)}`);
}

/**
 * @param {{ title: string, body: string, userId: number, tags: string[] }} datosPost
 */
async function crearPost(datosPost) {
    return fetchJSON(`${BASE_URL}/posts/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosPost),
    });
}

/**
 * @param {number|string} id
 * @param {{ title?: string, body?: string, tags?: string[] }} datosActualizados
 */
async function actualizarPost(id, datosActualizados) {
    return fetchJSON(`${BASE_URL}/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados),
    });
}

/**
 * @param {number|string} id
 */
async function eliminarPost(id) {
    return fetchJSON(`${BASE_URL}/posts/${id}`, {
        method: 'DELETE',
    });
}

async function obtenerTodosLosPosts() {
    return fetchJSON(`${BASE_URL}/posts?limit=0`);
}

export {
    obtenerPosts,
    obtenerPostPorId,
    buscarPosts,
    obtenerPostsPorUsuario,
    obtenerTags,
    obtenerPostsPorTag,
    crearPost,
    actualizarPost,
    eliminarPost,
    obtenerTodosLosPosts,
};
