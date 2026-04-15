
import * as api from './api.js';
import * as ui  from './ui.js';
import { addRoute, iniciarRouter } from './router.js';
import { validarFormularioPost, mostrarErroresFormulario, limpiarErrorCampo } from './validation.js';

const estado = {
    posts:         [],       
    todosLosPosts: [],       
    paginaActual:  1,
    limite:        10,
    total:         0,
    tags:          [],
    filtros: {
        busqueda: '',
        userId:   '',
        tag:      '',
    },
    postsEnMemoria: new Map(),
};

async function vistaListado() {
    ui.mostrarSkeletonListado();
    try {
        if (estado.tags.length === 0) {
            const respTags = await api.obtenerTags();
            estado.tags = Array.isArray(respTags) ? respTags : [];
        }

        await cargarPosts();
    } catch (error) {
        console.error('Error al cargar el listado:', error);
        ui.renderizarError('No se pudo cargar el listado', error.message);
    }
}

async function cargarPosts() {
    try {
        let respuesta;
        const { busqueda, userId, tag } = estado.filtros;

        if (busqueda.trim()) {
            respuesta = await api.buscarPosts(busqueda);
        } else if (userId) {
            respuesta = await api.obtenerPostsPorUsuario(userId);
        } else if (tag) {
            respuesta = await api.obtenerPostsPorTag(tag);
        } else {
            respuesta = await api.obtenerPosts(estado.paginaActual, estado.limite);
        }

        estado.posts = respuesta.posts ?? [];
        estado.total = respuesta.total ?? estado.posts.length;

        if (estado.postsEnMemoria.size > 0) {
            estado.posts = estado.posts.map(p =>
                estado.postsEnMemoria.has(p.id) ? estado.postsEnMemoria.get(p.id) : p
            );
        }

        ui.renderizarListado(
            estado.posts,
            estado.total,
            estado.paginaActual,
            estado.limite,
            estado.tags,
            estado.filtros
        );

        _adjuntarListenersPaginacion();
        _adjuntarListenersFiltros();

    } catch (error) {
        console.error('Error al cargar posts:', error);
        ui.renderizarError('Error al obtener publicaciones', error.message);
    }
}

async function vistaDetalle({ id }) {
    ui.mostrarLoader('Cargando publicación...');
    try {
        const idNum = Number(id);

        let post;
        if (estado.postsEnMemoria.has(idNum)) {
            post = estado.postsEnMemoria.get(idNum);
        } else {
            post = await api.obtenerPostPorId(id);
        }

        ui.renderizarDetalle(post);

        document.getElementById('btnEliminar')?.addEventListener('click', () => {
            ui.mostrarModal(async () => {
                await accionEliminarPost(post.id);
            });
        });

    } catch (error) {
        console.error('Error al cargar el post:', error);
        ui.renderizarError('Post no encontrado', `No se encontró el post con ID ${id}.`);
    }
}

function vistaCrear() {
    ui.renderizarFormCrear();
    _adjuntarListenersFormulario('crear');
}

async function vistaEditar({ id }) {
    ui.mostrarLoader('Cargando post para editar...');
    try {
        const idNum = Number(id);

        let post;
        if (estado.postsEnMemoria.has(idNum)) {
            post = estado.postsEnMemoria.get(idNum);
        } else {
            post = await api.obtenerPostPorId(id);
        }

        ui.renderizarFormEditar(post);
        _adjuntarListenersFormulario('editar');
    } catch (error) {
        console.error('Error al cargar post para editar:', error);
        ui.renderizarError('No se pudo cargar el post', error.message);
    }
}

async function vistaEstadisticas() {
    ui.mostrarLoader('Calculando estadísticas...');
    try {
        const respuesta = await api.obtenerTodosLosPosts();
        estado.todosLosPosts = respuesta.posts ?? [];
        ui.renderizarEstadisticas(estado.todosLosPosts);
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        ui.renderizarError('No se pudieron cargar las estadísticas', error.message);
    }
}

/**
 * @param {'crear'|'editar'} modo
 */

async function accionGuardarPost(modo) {
    const form = document.getElementById(modo === 'crear' ? 'formCrear' : 'formEditar');
    if (!form) return;

    const titulo = document.getElementById('campo-titulo')?.value ?? '';
    const cuerpo = document.getElementById('campo-cuerpo')?.value ?? '';
    const userId = document.getElementById('campo-userId')?.value ?? '';
    const tagsRaw = document.getElementById('campo-tags')?.value ?? '[]';
    let tags = [];
    try { tags = JSON.parse(tagsRaw); } catch { tags = []; }

    const { esValido, errores } = validarFormularioPost({ titulo, cuerpo, userId });
    if (!esValido) {
        mostrarErroresFormulario(errores);
        return;
    }

    ui.setBtnCargando(true);

    try {
        if (modo === 'crear') {
            const nuevoPost = await api.crearPost({
                title:  titulo.trim(),
                body:   cuerpo.trim(),
                userId: Number(userId),
                tags,
            });

            estado.postsEnMemoria.set(nuevoPost.id, nuevoPost);

            ui.mostrarToast('¡Publicación creada!', `"${nuevoPost.title}" fue publicada exitosamente.`, 'exito');
            window.location.hash = `#/post/${nuevoPost.id}`;

        } else {
            const postId = Number(form.dataset.id);
            const respuestaApi = await api.actualizarPost(postId, {
                title: titulo.trim(),
                body:  cuerpo.trim(),
                tags,
            });


            const postFinal = {
                ...respuestaApi,          
                title: titulo.trim(),     
                body:  cuerpo.trim(),     
                tags,
            };
            estado.postsEnMemoria.set(postId, postFinal);

            ui.mostrarToast('¡Post actualizado!', 'Los cambios fueron guardados.', 'exito');
            window.location.hash = `#/post/${postId}`;
        }
    } catch (error) {
        console.error('Error al guardar post:', error);
        ui.mostrarToast('Error al guardar', error.message, 'error');
        ui.setBtnCargando(false);
    }
}

/**
 * @param {number|string} id
 */
async function accionEliminarPost(id) {
    ui.mostrarLoader('Eliminando publicación...');
    try {
        await api.eliminarPost(id);
        estado.postsEnMemoria.delete(Number(id));
        estado.todosLosPosts = estado.todosLosPosts.filter(p => p.id !== Number(id));
        ui.mostrarToast('Post eliminado', 'La publicación fue eliminada correctamente.', 'exito');
        window.location.hash = '#/';
    } catch (error) {
        console.error('Error al eliminar:', error);
        ui.mostrarToast('Error al eliminar', error.message, 'error');
        window.location.hash = `#/post/${id}`;
    }
}

function _adjuntarListenersPaginacion() {
    document.getElementById('pagAnterior')?.addEventListener('click', () => {
        if (estado.paginaActual > 1) {
            estado.paginaActual--;
            cargarPosts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    document.getElementById('pagSiguiente')?.addEventListener('click', () => {
        const totalPag = Math.ceil(estado.total / estado.limite);
        if (estado.paginaActual < totalPag) {
            estado.paginaActual++;
            cargarPosts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    document.querySelectorAll('.pag-btn[data-pagina]').forEach(btn => {
        btn.addEventListener('click', () => {
            estado.paginaActual = Number(btn.dataset.pagina);
            cargarPosts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

function _adjuntarListenersFiltros() {
    const appEl = document.getElementById('app');

    appEl?.addEventListener('filtro:busqueda', (e) => {
        estado.filtros.busqueda = e.detail;
        estado.filtros.userId   = '';
        estado.filtros.tag      = '';
        estado.paginaActual     = 1;
        cargarPosts();
    });

    appEl?.addEventListener('filtro:usuario', (e) => {
        estado.filtros.userId   = e.detail;
        estado.filtros.busqueda = '';
        estado.filtros.tag      = '';
        estado.paginaActual     = 1;
        cargarPosts();
    });

    appEl?.addEventListener('filtro:tag', (e) => {
        estado.filtros.tag      = e.detail;
        estado.filtros.busqueda = '';
        estado.filtros.userId   = '';
        estado.paginaActual     = 1;
        cargarPosts();
    });

    appEl?.addEventListener('filtro:limpiar', () => {
        estado.filtros = { busqueda: '', userId: '', tag: '' };
        estado.paginaActual = 1;
        cargarPosts();
    });
}

function _adjuntarListenersFormulario(modo) {
    const formId = modo === 'crear' ? 'formCrear' : 'formEditar';
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await accionGuardarPost(modo);
    });

    ['titulo', 'cuerpo', 'userId'].forEach(campo => {
        document.getElementById(`campo-${campo}`)?.addEventListener('input', () => {
            limpiarErrorCampo(campo);
        });
    });
}

function inicializarMenuMovil() {
    const btnMenu = document.getElementById('btnMenu');
    const nav     = document.getElementById('navMenu');

    btnMenu?.addEventListener('click', () => {
        const abierto = nav.classList.toggle('abierto');
        btnMenu.setAttribute('aria-expanded', abierto);
    });

    nav?.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('abierto');
            btnMenu?.setAttribute('aria-expanded', 'false');
        });
    });
}

function inicializarApp() {
    ui.inicializarModal();
    inicializarMenuMovil();

    addRoute('/',                vistaListado);
    addRoute('/crear',           vistaCrear);
    addRoute('/post/:id',        vistaDetalle);
    addRoute('/editar/:id',      vistaEditar);
    addRoute('/estadisticas',    vistaEstadisticas);

    iniciarRouter();
}

document.addEventListener('DOMContentLoaded', inicializarApp);

