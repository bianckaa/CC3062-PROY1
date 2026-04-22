
export function validarFormularioPost({ titulo, cuerpo, userId }) {
    const errores = {};

    if (!titulo || titulo.trim().length < 3) {
        errores.titulo = 'El título debe tener al menos 3 caracteres.';
    } else if (titulo.trim().length > 200) {
        errores.titulo = 'El título no puede superar los 200 caracteres.';
    }

    if (!cuerpo || cuerpo.trim().length < 10) {
        errores.cuerpo = 'El contenido debe tener al menos 10 caracteres.';
    } else if (cuerpo.trim().length > 5000) {
        errores.cuerpo = 'El contenido no puede superar los 5000 caracteres.';
    }

    const userIdNum = Number(userId);
    if (!userId || isNaN(userIdNum) || !Number.isInteger(userIdNum) || userIdNum < 1) {
        errores.userId = 'El ID de usuario debe ser un número entero mayor a 0.';
    }

    return { esValido: Object.keys(errores).length === 0, errores };
}

export function mostrarErroresFormulario(errores) {
    Object.entries(errores).forEach(([campo, mensaje]) => {
        const errorEl = document.getElementById(`error-${campo}`);
        const inputEl = document.getElementById(`campo-${campo}`);
        if (errorEl) {
            errorEl.textContent = mensaje;
            errorEl.classList.add('visible');
        }
        if (inputEl) {
            inputEl.classList.add('input-error');
        }
    });

    const primerCampo = Object.keys(errores)[0];
    if (primerCampo) {
        document.getElementById(`campo-${primerCampo}`)?.focus();
    }
}

export function limpiarErrorCampo(campo) {
    const errorEl = document.getElementById(`error-${campo}`);
    const inputEl = document.getElementById(`campo-${campo}`);
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
    }
    if (inputEl) {
        inputEl.classList.remove('input-error');
    }
}
