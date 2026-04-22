
const rutas = [];

export function addRoute(path, handler) {
    rutas.push({ path, handler });
}

export function iniciarRouter() {
    function manejarRuta() {
        const hash = window.location.hash.slice(1) || '/';
        for (const ruta of rutas) {
            const paramNames = [];
            const regexStr = ruta.path.replace(/:([^/]+)/g, (_, name) => {
                paramNames.push(name);
                return '([^/]+)';
            });
            const match = hash.match(new RegExp(`^${regexStr}$`));
            if (match) {
                const params = {};
                paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
                ruta.handler(params);
                return;
            }
        }
        window.location.hash = '#/';
    }

    window.addEventListener('hashchange', manejarRuta);
    manejarRuta();
}
