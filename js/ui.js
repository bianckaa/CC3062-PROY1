
const getApp = () => document.getElementById('app');

// ─── Loader / Skeleton ────────────────────────────────────────────────────────

export function mostrarLoader(mensaje = 'Cargando...') {
    getApp().innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
            <p class="loader-texto">${mensaje}</p>
        </div>
    `;
}

export function mostrarSkeletonListado(cantidad = 6) {
    const skeletons = Array.from({ length: cantidad }, () => `
        <div class="skeleton-card">
            <div class="post-card__cabecera">
                <div class="skeleton skeleton-avatar"></div>
                <div style="flex:1;display:flex;flex-direction:column;gap:6px">
                    <div class="skeleton skeleton-text-sm"></div>
                    <div class="skeleton skeleton-text-md" style="width:30%"></div>
                </div>
            </div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-title-2"></div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-top:4px">
                <div class="skeleton skeleton-body-1"></div>
                <div class="skeleton skeleton-body-2"></div>
                <div class="skeleton skeleton-body-3"></div>
            </div>
        </div>
    `).join('');
    getApp().innerHTML = `
        <div class="layout-listado">
            <div class="posts-grid">${skeletons}</div>
        </div>
    `;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export function mostrarToast(titulo, mensaje, tipo = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const iconos = { exito: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast toast--${tipo}`;
    toast.innerHTML = `
        <div class="toast__icono">${iconos[tipo]}</div>
        <div class="toast__contenido">
            <p class="toast__titulo">${titulo}</p>
            <p class="toast__mensaje">${mensaje}</p>
        </div>
        <button class="toast__cerrar" aria-label="Cerrar">✕</button>
    `;

    toast.querySelector('.toast__cerrar').addEventListener('click', () => _cerrarToast(toast));
    container.appendChild(toast);
    setTimeout(() => _cerrarToast(toast), 4500);
}

function _cerrarToast(toast) {
    if (!toast.isConnected) return;
    toast.classList.add('saliendo');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function inicializarModal() {
    document.getElementById('btnCancelar')?.addEventListener('click', _ocultarModal);
    document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) _ocultarModal();
    });
}

export function mostrarModal(callbackConfirmar) {
    const overlay = document.getElementById('modalOverlay');
    overlay?.classList.add('activo');

    const btnViejo = document.getElementById('btnConfirmarEliminar');
    if (btnViejo) {
        const btnNuevo = btnViejo.cloneNode(true);
        btnViejo.replaceWith(btnNuevo);
        btnNuevo.addEventListener('click', async () => {
            _ocultarModal();
            await callbackConfirmar();
        });
    }
}

function _ocultarModal() {
    document.getElementById('modalOverlay')?.classList.remove('activo');
}

// ─── Botón de carga ───────────────────────────────────────────────────────────

export function setBtnCargando(estado) {
    const btn = document.getElementById('btnGuardar');
    if (!btn) return;
    if (estado) {
        btn.disabled = true;
        btn.dataset.textoOriginal = btn.innerHTML;
        btn.innerHTML = `<div class="loader loader--sm"></div> Guardando...`;
    } else {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.textoOriginal;
    }
}

// ─── Listado ──────────────────────────────────────────────────────────────────

export function renderizarListado(posts, total, paginaActual, limite, tags, filtros) {
    const totalPaginas = Math.ceil(total / limite);

    // opciones del select de tags
    let tagOptions = '';
    if (Array.isArray(tags)) {
        tags.forEach(tag => {
            const valor = typeof tag === 'string' ? tag : tag.slug;
            const seleccionado = filtros.tag === valor ? 'selected' : '';
            tagOptions += `<option value="${valor}" ${seleccionado}>${valor}</option>`;
        });
    }

    // cards de posts
    let postsHTML = '';
    if (posts.length === 0) {
        postsHTML = `
            <div class="estado-vacio" style="grid-column:1/-1">
                <div class="estado-icono">📭</div>
                <h2 class="estado-titulo">Sin publicaciones</h2>
                <p class="estado-desc">No se encontraron publicaciones con los filtros aplicados.</p>
                <button class="btn btn--secundario" id="btnLimpiarFiltros">Limpiar filtros</button>
            </div>
        `;
    } else {
        posts.forEach(post => {
            postsHTML += _renderCard(post);
        });
    }

    // paginacion simple: prev / numero de pagina / next
    let paginacionHTML = '';
    if (totalPaginas > 1) {
        paginacionHTML = `
            <div>
                <div class="paginacion">
                    <button class="pag-btn" id="pagAnterior" ${paginaActual === 1 ? 'disabled' : ''}>‹ Anterior</button>
                    <span class="pag-btn activo">${paginaActual}</span>
                    <button class="pag-btn" id="pagSiguiente" ${paginaActual === totalPaginas ? 'disabled' : ''}>Siguiente ›</button>
                </div>
                <p class="paginacion-info">Página ${paginaActual} de ${totalPaginas} · ${total} publicaciones en total</p>
            </div>
        `;
    }

    getApp().innerHTML = `
        <div class="layout-listado">
            <div class="hero-listado">
                <h1 class="hero-titulo">BlogSpace</h1>
                <p class="hero-desc">Explora, crea y comparte publicaciones de la comunidad.</p>
            </div>

            <div class="filtros-bar">
                <div class="filtro-grupo input-busqueda-wrapper">
                    <span class="icono-busqueda">🔍</span>
                    <input
                        type="search"
                        class="input-busqueda"
                        id="inputBusqueda"
                        placeholder="Buscar publicaciones..."
                        value="${filtros.busqueda}"
                        autocomplete="off"
                    >
                </div>
                <div class="filtro-grupo" style="min-width:150px;max-width:190px">
                    <label for="inputUserId">ID de Usuario</label>
                    <input
                        type="number"
                        class="filtro-select"
                        id="inputUserId"
                        placeholder="Ej: 5"
                        min="1"
                        value="${filtros.userId}"
                    >
                </div>
                <div class="filtro-grupo" style="min-width:150px;max-width:190px">
                    <label for="selectTag">Tag</label>
                    <select class="filtro-select" id="selectTag">
                        <option value="">Todos los tags</option>
                        ${tagOptions}
                    </select>
                </div>
                <button class="btn btn--ghost btn--sm" id="btnLimpiarFiltros">✕ Limpiar</button>
            </div>

            <div class="seccion-header">
                <div>
                    <h2 class="seccion-titulo">Publicaciones</h2>
                    <p class="seccion-subtitulo">${total} resultados encontrados</p>
                </div>
            </div>

            <div class="posts-grid">${postsHTML}</div>

            ${paginacionHTML}
        </div>
    `;

    _adjuntarListenersFiltrosUI();
}

function _renderCard(post) {
    const likes = typeof post.reactions === 'object'
        ? post.reactions.likes
        : post.reactions;

    let tagsHTML = '';
    if (post.tags) {
        post.tags.slice(0, 3).forEach(t => {
            tagsHTML += `<span class="tag">${t}</span>`;
        });
    }

    return `
        <article class="post-card" onclick="window.location.hash='#/post/${post.id}'" tabindex="0" role="button">
            <div class="post-card__cabecera">
                <div class="post-card__avatar">U${post.userId}</div>
                <div class="post-card__autor-info">
                    <span class="post-card__autor">Usuario ${post.userId}</span>
                    <span class="post-card__fecha">Post #${post.id}</span>
                </div>
            </div>
            <h2 class="post-card__titulo">${post.title}</h2>
            <p class="post-card__resumen">${post.body}</p>
            <div class="post-card__footer">
                <div class="post-card__tags">${tagsHTML}</div>
                <div class="post-card__reacciones">❤️ ${likes}</div>
            </div>
        </article>
    `;
}

function _adjuntarListenersFiltrosUI() {
    const app = getApp();
    let searchTimeout;

    document.getElementById('inputBusqueda')?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            app.dispatchEvent(new CustomEvent('filtro:busqueda', { detail: e.target.value }));
        }, 400);
    });

    document.getElementById('inputUserId')?.addEventListener('change', (e) => {
        app.dispatchEvent(new CustomEvent('filtro:usuario', { detail: e.target.value }));
    });

    document.getElementById('selectTag')?.addEventListener('change', (e) => {
        app.dispatchEvent(new CustomEvent('filtro:tag', { detail: e.target.value }));
    });

    document.getElementById('btnLimpiarFiltros')?.addEventListener('click', () => {
        app.dispatchEvent(new CustomEvent('filtro:limpiar'));
    });
}

// ─── Detalle ──────────────────────────────────────────────────────────────────

export function renderizarDetalle(post) {
    const likes    = typeof post.reactions === 'object' ? post.reactions.likes    : post.reactions;
    const dislikes = typeof post.reactions === 'object' ? post.reactions.dislikes : 0;

    let tagsHTML = '';
    if (post.tags) {
        post.tags.forEach(t => {
            tagsHTML += `<span class="tag">${t}</span>`;
        });
    }

    getApp().innerHTML = `
        <div class="layout-detalle">
            <a href="#/" class="detalle-nav-volver">← Volver al listado</a>

            <div class="detalle-container">
                <div class="detalle-header">
                    <div class="detalle-meta-top">
                        <span class="detalle-id-badge">POST #${post.id}</span>
                    </div>
                    <h1 class="detalle-titulo">${post.title}</h1>
                </div>

                <div class="detalle-body">
                    <div class="detalle-autor-row">
                        <div class="detalle-avatar">U${post.userId}</div>
                        <div class="detalle-autor-info">
                            <p class="detalle-autor-nombre">Usuario ${post.userId}</p>
                            <p class="detalle-autor-sub">Publicación #${post.id}</p>
                        </div>
                        <div class="detalle-acciones">
                            <a href="#/editar/${post.id}" class="btn btn--secundario btn--sm">✏️ Editar</a>
                            <button class="btn btn--peligro btn--sm" id="btnEliminar">🗑️ Eliminar</button>
                        </div>
                    </div>

                    <p class="detalle-contenido">${post.body}</p>

                    <div class="detalle-datos-grid">
                        <div class="detalle-dato">
                            <span class="detalle-dato__label">👍 Likes</span>
                            <span class="detalle-dato__valor">${likes}</span>
                        </div>
                        <div class="detalle-dato">
                            <span class="detalle-dato__label">👎 Dislikes</span>
                            <span class="detalle-dato__valor">${dislikes}</span>
                        </div>
                        <div class="detalle-dato">
                            <span class="detalle-dato__label">👁️ Vistas</span>
                            <span class="detalle-dato__valor">${post.views || 0}</span>
                        </div>
                    </div>

                    ${tagsHTML ? `
                    <div class="detalle-tags-section">
                        <p class="detalle-tags-titulo">Tags</p>
                        <div class="detalle-tags-lista">${tagsHTML}</div>
                    </div>` : ''}
                </div>
            </div>
        </div>
    `;
}

// ─── Formularios ──────────────────────────────────────────────────────────────

export function renderizarFormCrear() {
    getApp().innerHTML = _htmlFormulario('crear', null);
    _inicializarTagsInput([]);
}

export function renderizarFormEditar(post) {
    getApp().innerHTML = _htmlFormulario('editar', post);
    _inicializarTagsInput(post.tags || []);
}

function _htmlFormulario(modo, post) {
    const esEditar = modo === 'editar';
    const formId   = esEditar ? 'formEditar' : 'formCrear';
    const volverHref = esEditar ? `#/post/${post.id}` : '#/';

    return `
        <div class="layout-form">
            <a href="${volverHref}" class="detalle-nav-volver">← Volver</a>

            <div class="form-container">
                <div class="form-header">
                    <div class="form-header-icono">${esEditar ? '✏️' : '✦'}</div>
                    <div>
                        <h1 class="form-titulo">${esEditar ? 'Editar publicación' : 'Nueva publicación'}</h1>
                        <p class="form-subtitulo">${esEditar ? 'Editando Post #' + post.id : 'Comparte algo con la comunidad'}</p>
                    </div>
                </div>

                <form id="${formId}" ${esEditar ? 'data-id="' + post.id + '"' : ''} novalidate>
                    <div class="form-grupo">
                        <label class="form-label" for="campo-titulo">
                            Título <span class="requerido">*</span>
                        </label>
                        <input
                            class="form-input"
                            type="text"
                            id="campo-titulo"
                            placeholder="Un título descriptivo..."
                            value="${esEditar ? post.title : ''}"
                            autocomplete="off"
                        >
                        <span class="campo-error" id="error-titulo" role="alert"></span>
                    </div>

                    <div class="form-grupo">
                        <label class="form-label" for="campo-cuerpo">
                            Contenido <span class="requerido">*</span>
                        </label>
                        <textarea
                            class="form-textarea"
                            id="campo-cuerpo"
                            placeholder="Escribe el contenido de tu publicación..."
                            rows="6"
                        >${esEditar ? post.body : ''}</textarea>
                        <span class="campo-error" id="error-cuerpo" role="alert"></span>
                    </div>

                    <div class="form-grupo">
                        <label class="form-label" for="campo-userId">
                            ID de Usuario <span class="requerido">*</span>
                        </label>
                        <input
                            class="form-input"
                            type="number"
                            id="campo-userId"
                            placeholder="Ej: 5"
                            min="1"
                            value="${esEditar ? post.userId : ''}"
                        >
                        <span class="campo-error" id="error-userId" role="alert"></span>
                        <span class="form-hint">Número de usuario (entero positivo)</span>
                    </div>

                    <div class="form-grupo">
                        <label class="form-label">Tags</label>
                        <div class="tags-input-container" id="tagsContainer">
                            <input
                                type="text"
                                class="tags-text-input"
                                id="tagsTextInput"
                                placeholder="Escribe y presiona Enter..."
                                autocomplete="off"
                            >
                        </div>
                        <input type="hidden" id="campo-tags" value="[]">
                        <span class="form-hint">Presiona Enter o coma para agregar un tag</span>
                    </div>

                    <div class="form-acciones">
                        <a href="${volverHref}" class="btn btn--secundario">Cancelar</a>
                        <button type="submit" class="btn btn--primario" id="btnGuardar">
                            ${esEditar ? '💾 Guardar cambios' : '✦ Publicar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function _inicializarTagsInput(tagsIniciales) {
    const container = document.getElementById('tagsContainer');
    const textInput = document.getElementById('tagsTextInput');
    const hidden    = document.getElementById('campo-tags');
    if (!container || !textInput || !hidden) return;

    let tags = [...tagsIniciales];

    function syncHidden() {
        hidden.value = JSON.stringify(tags);
    }

    function renderTags() {
        container.querySelectorAll('.tag-removible').forEach(el => el.remove());
        tags.forEach((tag, i) => {
            const pill = document.createElement('span');
            pill.className = 'tag-removible';
            pill.innerHTML = `${tag}<button type="button" class="tag-removible__btn" aria-label="Eliminar ${tag}">×</button>`;
            pill.querySelector('button').addEventListener('click', () => {
                tags.splice(i, 1);
                renderTags();
            });
            container.insertBefore(pill, textInput);
        });
        syncHidden();
    }

    function agregarTag(valor) {
        const tag = valor.trim().toLowerCase().replace(/[^a-z0-9\-]/g, '');
        if (tag && !tags.includes(tag) && tags.length < 10) {
            tags.push(tag);
            renderTags();
        }
        textInput.value = '';
    }

    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            agregarTag(textInput.value);
        }
        if (e.key === 'Backspace' && textInput.value === '' && tags.length > 0) {
            tags.pop();
            renderTags();
        }
    });

    textInput.addEventListener('blur', () => {
        if (textInput.value.trim()) agregarTag(textInput.value);
    });

    container.addEventListener('click', () => textInput.focus());

    renderTags();
}

// ─── Estadísticas ─────────────────────────────────────────────────────────────

export function renderizarEstadisticas(posts) {
    if (!posts.length) {
        getApp().innerHTML = `
            <div class="estado-vacio">
                <div class="estado-icono">📊</div>
                <h2 class="estado-titulo">Sin datos</h2>
                <p class="estado-desc">No hay publicaciones para calcular estadísticas.</p>
            </div>
        `;
        return;
    }

    const getLikes = (p) => typeof p.reactions === 'object' ? p.reactions.likes : p.reactions;

    const totalPosts     = posts.length;
    const totalVistas    = posts.reduce((s, p) => s + (p.views || 0), 0);
    const totalLikes     = posts.reduce((s, p) => s + getLikes(p), 0);
    const promedioVistas = Math.round(totalVistas / totalPosts);

    const top5     = [...posts].sort((a, b) => getLikes(b) - getLikes(a)).slice(0, 5);
    const maxLikes = getLikes(top5[0]) || 1;

    const tagCount = {};
    posts.forEach(p => {
        if (p.tags) {
            p.tags.forEach(t => {
                tagCount[t] = (tagCount[t] || 0) + 1;
            });
        }
    });
    const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 12);

    const userCount = {};
    posts.forEach(p => {
        userCount[p.userId] = (userCount[p.userId] || 0) + 1;
    });
    const usuariosOrdenados = Object.entries(userCount).sort((a, b) => b[1] - a[1]);
    const topUserId    = usuariosOrdenados[0][0];
    const topUserPosts = usuariosOrdenados[0][1];

    const medallas = ['oro', 'plata', 'bronce'];

    let top5HTML = '';
    top5.forEach((post, i) => {
        const likes = getLikes(post);
        const ancho = Math.round((likes / maxLikes) * 100);
        const medallaClass = medallas[i] || 'normal';
        top5HTML += `
            <div class="top-post-item" onclick="window.location.hash='#/post/${post.id}'" style="cursor:pointer">
                <div class="top-post-numero ${medallaClass}">${i + 1}</div>
                <div class="top-post-info">
                    <p class="top-post-titulo">${post.title}</p>
                    <div class="top-post-barra">
                        <div class="top-post-barra__relleno" style="width:${ancho}%"></div>
                    </div>
                </div>
                <div class="top-post-reacciones">
                    <span class="top-post-reac-valor">${likes}</span>
                    <span class="top-post-reac-label">likes</span>
                </div>
            </div>
        `;
    });

    let topTagsHTML = '';
    topTags.forEach(([tag, count]) => {
        topTagsHTML += `<span class="tag" style="cursor:default">${tag} <strong>(${count})</strong></span>`;
    });

    getApp().innerHTML = `
        <div class="layout-stats">
            <div class="stats-seccion-header">
                <div class="stats-seccion-icono">📊</div>
                <div>
                    <h1 class="stats-seccion-titulo">Estadísticas</h1>
                    <p class="stats-seccion-sub">Resumen basado en ${totalPosts} publicaciones</p>
                </div>
            </div>

            <div class="stats-metricas-grid">
                <div class="stats-card-metrica">
                    <div class="stats-metrica-icono">📝</div>
                    <div class="stats-metrica-valor">${totalPosts}</div>
                    <div class="stats-metrica-label">Publicaciones</div>
                </div>
                <div class="stats-card-metrica">
                    <div class="stats-metrica-icono">👁️</div>
                    <div class="stats-metrica-valor">${totalVistas}</div>
                    <div class="stats-metrica-label">Vistas totales</div>
                </div>
                <div class="stats-card-metrica">
                    <div class="stats-metrica-icono">👍</div>
                    <div class="stats-metrica-valor">${totalLikes}</div>
                    <div class="stats-metrica-label">Likes totales</div>
                </div>
                <div class="stats-card-metrica">
                    <div class="stats-metrica-icono">📈</div>
                    <div class="stats-metrica-valor">${promedioVistas}</div>
                    <div class="stats-metrica-label">Promedio de vistas</div>
                </div>
            </div>

            <div class="stats-bottom-grid">
                <div class="stats-card-grande">
                    <div class="stats-card-grande__header">
                        <span>🏆</span>
                        <h2 class="stats-card-grande__titulo">Top 5 publicaciones más populares</h2>
                    </div>
                    <div class="stats-card-grande__body">${top5HTML}</div>
                </div>

                <div style="display:flex;flex-direction:column;gap:var(--sp-lg)">
                    <div class="stats-usuario-card">
                        <p class="stats-usuario-header">Usuario más activo</p>
                        <div class="stats-usuario-info">
                            <div class="stats-usuario-avatar">U${topUserId}</div>
                            <div>
                                <p class="stats-usuario-nombre">Usuario ${topUserId}</p>
                                <p class="stats-usuario-posts">${topUserPosts} publicaciones</p>
                            </div>
                        </div>
                    </div>

                    <div class="stats-card-grande">
                        <div class="stats-card-grande__header">
                            <span>🏷️</span>
                            <h2 class="stats-card-grande__titulo">Tags más usados</h2>
                        </div>
                        <div class="stats-card-grande__body" style="display:flex;flex-wrap:wrap;gap:var(--sp-sm);padding:var(--sp-lg)">
                            ${topTagsHTML}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ─── Error ────────────────────────────────────────────────────────────────────

export function renderizarError(titulo, detalle) {
    getApp().innerHTML = `
        <div class="estado-error">
            <div class="estado-icono">⚠️</div>
            <h2 class="estado-titulo">${titulo}</h2>
            <p class="estado-desc">${detalle || ''}</p>
            <a href="#/" class="btn btn--secundario" style="margin-top:var(--sp-md)">Volver al inicio</a>
        </div>
    `;
}
