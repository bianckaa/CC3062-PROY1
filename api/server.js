const express = require("express");
const { uid } = require("uid");

const app  = express();
const port = 3001;

app.use(express.json());

// CORS para que el frontend pueda consumir la API
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

// ─── Datos iniciales ──────────────────────────────────────────────────────────

let nextId = 20;

let posts = [
    { id: 1,  title: "Introducción a JavaScript ES2022", body: "Las nuevas características de ES2022 incluyen Object.hasOwn, at(), Error cause y top-level await. Estas mejoras simplifican el código y lo hacen más robusto en aplicaciones modernas.", userId: 1,  tags: ["javascript", "programacion", "web"], reactions: { likes: 142, dislikes: 5  }, views: 3200 },
    { id: 2,  title: "Cómo estructurar un proyecto Node.js",  body: "Una buena estructura de carpetas es clave para mantener el código limpio. Separa rutas, controladores, modelos y middlewares en sus propias carpetas para facilitar el mantenimiento.", userId: 2,  tags: ["nodejs", "backend", "arquitectura"],  reactions: { likes: 98,  dislikes: 3  }, views: 2100 },
    { id: 3,  title: "CSS Grid vs Flexbox: ¿cuándo usar cada uno?", body: "CSS Grid es ideal para layouts bidimensionales mientras que Flexbox brilla en diseños unidimensionales. Usarlos juntos te da control total sobre el diseño responsivo de tu aplicación.", userId: 3,  tags: ["css", "diseño", "web"],              reactions: { likes: 210, dislikes: 12 }, views: 5400 },
    { id: 4,  title: "Promises vs Async/Await en profundidad",  body: "Async/Await es syntactic sugar sobre Promises. Permite escribir código asíncrono con apariencia síncrona, facilitando el manejo de errores con try/catch y mejorando la legibilidad.", userId: 1,  tags: ["javascript", "async", "programacion"],  reactions: { likes: 176, dislikes: 8  }, views: 4100 },
    { id: 5,  title: "Primeros pasos con Express.js",  body: "Express.js es el framework web más popular de Node.js. Con pocas líneas de código puedes crear rutas, middlewares y APIs REST robustas que escalan bien con tu aplicación.", userId: 4,  tags: ["nodejs", "express", "backend"],          reactions: { likes: 134, dislikes: 6  }, views: 2900 },
    { id: 6,  title: "Diseño responsivo sin frameworks CSS", body: "Usar CSS puro con custom properties, clamp() y media queries modernas te permite crear diseños responsivos elegantes sin depender de Tailwind o Bootstrap. Menos dependencias, más control.", userId: 5,  tags: ["css", "diseño", "responsive"],           reactions: { likes: 89,  dislikes: 4  }, views: 1800 },
    { id: 7,  title: "Git: flujos de trabajo para equipos",  body: "Git Flow, GitHub Flow y Trunk-based Development son los flujos más populares. Elegir el correcto depende del tamaño de tu equipo y la frecuencia de tus releases en producción.", userId: 2,  tags: ["git", "devops", "colaboracion"],         reactions: { likes: 115, dislikes: 7  }, views: 2600 },
    { id: 8,  title: "Accesibilidad web: más que colores",  body: "La accesibilidad web incluye semántica HTML correcta, navegación por teclado, roles ARIA y contrastes adecuados. No es opcional: es un requisito legal en muchos países del mundo.", userId: 6,  tags: ["accesibilidad", "web", "ux"],             reactions: { likes: 203, dislikes: 2  }, views: 4700 },
    { id: 9,  title: "Introducción a las APIs REST",  body: "Una API REST usa verbos HTTP (GET, POST, PUT, DELETE) para realizar operaciones sobre recursos. Seguir las convenciones REST hace que tu API sea intuitiva y fácil de consumir.", userId: 3,  tags: ["api", "rest", "backend"],                reactions: { likes: 167, dislikes: 9  }, views: 3800 },
    { id: 10, title: "Optimización de rendimiento en el navegador", body: "Lazy loading, code splitting, caching con Service Workers y reducción de repintados en el DOM son técnicas esenciales para mejorar el rendimiento percibido de tu aplicación web.", userId: 7,  tags: ["rendimiento", "web", "javascript"],      reactions: { likes: 148, dislikes: 6  }, views: 3300 },
    { id: 11, title: "TypeScript: ¿vale la pena adoptarlo?",  body: "TypeScript agrega tipado estático a JavaScript, lo que reduce bugs en tiempo de desarrollo y mejora la experiencia con el editor. Para proyectos grandes, la curva de aprendizaje se amortiza rápido.", userId: 8,  tags: ["typescript", "javascript", "programacion"], reactions: { likes: 231, dislikes: 18 }, views: 5900 },
    { id: 12, title: "LocalStorage vs SessionStorage vs Cookies",  body: "LocalStorage persiste hasta que el usuario lo elimine, SessionStorage solo dura la sesión y las cookies pueden configurarse con expiración. Cada uno tiene su caso de uso ideal en el frontend.", userId: 4,  tags: ["javascript", "web", "storage"],          reactions: { likes: 92,  dislikes: 3  }, views: 2200 },
    { id: 13, title: "Patrones de diseño en JavaScript",  body: "Singleton, Observer, Factory y Module son patrones de diseño fundamentales. Conocerlos te ayuda a resolver problemas comunes con soluciones probadas y código más mantenible a largo plazo.", userId: 9,  tags: ["javascript", "programacion", "arquitectura"], reactions: { likes: 188, dislikes: 11 }, views: 4200 },
    { id: 14, title: "Consumir APIs externas con Fetch",  body: "La Fetch API nativa permite realizar peticiones HTTP en el navegador sin librerías externas. Combinada con async/await y manejo de errores, es todo lo que necesitas para consumir APIs REST.", userId: 5,  tags: ["javascript", "api", "web"],              reactions: { likes: 124, dislikes: 5  }, views: 2800 },
    { id: 15, title: "Introducción a los Web Components", body: "Los Web Components son elementos HTML personalizados y reutilizables que funcionan en cualquier framework o sin él. Custom Elements, Shadow DOM y HTML Templates son sus tres pilares.", userId: 10, tags: ["javascript", "web", "componentes"],      reactions: { likes: 76,  dislikes: 4  }, views: 1600 },
    { id: 16, title: "Seguridad en aplicaciones web: conceptos clave", body: "XSS, CSRF, SQL Injection e Insecure Deserialization son las vulnerabilidades más comunes según OWASP. Sanitizar inputs, usar HTTPS y aplicar el principio de mínimo privilegio son básicos.", userId: 6,  tags: ["seguridad", "web", "backend"],           reactions: { likes: 245, dislikes: 8  }, views: 6100 },
    { id: 17, title: "Manejo de estados en aplicaciones vanilla",  body: "Sin frameworks, puedes gestionar el estado con un objeto central y un patrón de publicación-suscripción. Mantener una sola fuente de verdad simplifica el debugging y la sincronización del DOM.", userId: 11, tags: ["javascript", "arquitectura", "web"],     reactions: { likes: 103, dislikes: 6  }, views: 2400 },
    { id: 18, title: "HTTP/2 y sus ventajas sobre HTTP/1.1", body: "HTTP/2 introduce multiplexación, server push y compresión de headers, reduciendo la latencia notablemente. La mayoría de servidores modernos ya lo soportan y puede habilitarse con configuración mínima.", userId: 7,  tags: ["web", "rendimiento", "backend"],          reactions: { likes: 87,  dislikes: 3  }, views: 1900 },
    { id: 19, title: "Cómo escribir código más limpio",  body: "Nombres descriptivos, funciones pequeñas con una sola responsabilidad, evitar comentarios obvios y aplicar principios SOLID son las bases del código limpio. El código se lee más veces de las que se escribe.", userId: 12, tags: ["programacion", "buenas-practicas", "arquitectura"], reactions: { likes: 312, dislikes: 14 }, views: 7800 },
    { id: 20, title: "Debugging efectivo en el navegador",  body: "Las DevTools del navegador incluyen debugger, breakpoints condicionales, profiler de rendimiento y panel de red. Dominarlas reduce drásticamente el tiempo de resolución de bugs en el frontend.", userId: 8,  tags: ["javascript", "debugging", "web"],        reactions: { likes: 156, dislikes: 7  }, views: 3500 },
];

// ─── Rutas — orden importante: específicas antes de /:id ─────────────────────

app.get("/", (req, res) => {
    res.send(`<h1>BlogSpace API</h1>
    <ul>
        <li>GET /posts?limit=N&amp;skip=N</li>
        <li>GET /posts/search?q=texto</li>
        <li>GET /posts/tags</li>
        <li>GET /posts/tag/:tag</li>
        <li>GET /posts/user/:userId</li>
        <li>GET /posts/:id</li>
        <li>POST /posts/add</li>
        <li>PUT /posts/:id</li>
        <li>DELETE /posts/:id</li>
    </ul>`);
});

// buscar posts por texto en titulo o cuerpo
app.get("/posts/search", (req, res) => {
    let q     = req.query.q || "";
    let limit = parseInt(req.query.limit) || 10;
    let skip  = parseInt(req.query.skip)  || 0;

    let resultados = posts.filter(p =>
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.body.toLowerCase().includes(q.toLowerCase())
    );

    let total       = resultados.length;
    let paginados   = resultados.slice(skip, skip + limit);

    res.json({ posts: paginados, total: total, skip: skip, limit: limit });
});

// traer todos los tags disponibles
app.get("/posts/tags", (req, res) => {
    let tagSet = new Set();
    posts.forEach(p => {
        p.tags.forEach(t => tagSet.add(t));
    });
    res.json([...tagSet].sort());
});

// posts por tag
app.get("/posts/tag/:tag", (req, res) => {
    let tag   = req.params.tag.toLowerCase();
    let limit = parseInt(req.query.limit) || 10;
    let skip  = parseInt(req.query.skip)  || 0;

    let filtrados = posts.filter(p =>
        p.tags.map(t => t.toLowerCase()).includes(tag)
    );

    let total     = filtrados.length;
    let paginados = filtrados.slice(skip, skip + limit);

    res.json({ posts: paginados, total: total, skip: skip, limit: limit });
});

// posts por usuario
app.get("/posts/user/:userId", (req, res) => {
    let userId = parseInt(req.params.userId);
    let limit  = parseInt(req.query.limit) || 10;
    let skip   = parseInt(req.query.skip)  || 0;

    let filtrados = posts.filter(p => p.userId === userId);

    let total     = filtrados.length;
    let paginados = filtrados.slice(skip, skip + limit);

    res.json({ posts: paginados, total: total, skip: skip, limit: limit });
});

// todos los posts con paginacion (limit=0 trae todos)
app.get("/posts", (req, res) => {
    let limit = parseInt(req.query.limit) || 0;
    let skip  = parseInt(req.query.skip)  || 0;
    let total = posts.length;

    let paginados;
    if (limit === 0) {
        // limit=0 significa traer todos
        paginados = posts.slice(skip);
    } else {
        paginados = posts.slice(skip, skip + limit);
    }

    res.json({ posts: paginados, total: total, skip: skip, limit: limit });
});

// un post por id
app.get("/posts/:id", (req, res) => {
    let id   = parseInt(req.params.id);
    let post = posts.find(p => p.id === id);

    if (!post) {
        return res.status(404).json({ message: "Post no encontrado" });
    }

    res.json(post);
});

// crear nuevo post
app.post("/posts/add", (req, res) => {
    let nuevoPost = {
        id:        ++nextId,
        uid:       uid(),
        title:     req.body.title  || "",
        body:      req.body.body   || "",
        userId:    parseInt(req.body.userId) || 1,
        tags:      req.body.tags   || [],
        reactions: { likes: 0, dislikes: 0 },
        views:     0,
    };

    posts.push(nuevoPost);
    res.status(201).json(nuevoPost);
});

// actualizar post
app.put("/posts/:id", (req, res) => {
    let id    = parseInt(req.params.id);
    let index = posts.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Post no encontrado" });
    }

    if (req.body.title !== undefined) posts[index].title = req.body.title;
    if (req.body.body  !== undefined) posts[index].body  = req.body.body;
    if (req.body.tags  !== undefined) posts[index].tags  = req.body.tags;

    res.json(posts[index]);
});

// eliminar post
app.delete("/posts/:id", (req, res) => {
    let id    = parseInt(req.params.id);
    let index = posts.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Post no encontrado" });
    }

    let eliminado = posts.splice(index, 1)[0];
    res.json({ ...eliminado, isDeleted: true });
});

// ─── Inicio ───────────────────────────────────────────────────────────────────

app.listen(port, () => {
    console.log(`BlogSpace API corriendo en http://localhost:${port}`);
});
