/** @odoo-module **/
/**
 * Chatter Always Bottom — Odoo 19
 * Alphaqueb Consulting SAS
 *
 * Estrategia JavaScript de 3 capas:
 *
 * CAPA 1 — Parche OWL del componente ChatterContainer:
 *   Neutraliza el getter/estado que decide si el chatter va al costado.
 *   Cubre el caso de Odoo 17/18/19 con path @mail/core/web/chatter_container.
 *
 * CAPA 2 — Parche del FormRenderer:
 *   Sobrescribe el método que calcula la posición del chatter.
 *   Cubre implementaciones donde FormRenderer es el coordinador.
 *
 * CAPA 3 — MutationObserver global:
 *   Vigilancia DOM en tiempo real. Si por cualquier motivo
 *   se añade la clase 'o-aside' al contenedor del chatter,
 *   la elimina de inmediato. Es la red de seguridad final.
 */

import { patch } from "@web/core/utils/patch";

// ─────────────────────────────────────────────────────────────────────────────
// CAPA 1: Parche del ChatterContainer (ruta Odoo 17/18/19)
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
    try {
        const chatterContainerModule = await odoo.loader.modules.get(
            "@mail/core/web/chatter_container"
        );

        if (chatterContainerModule?.ChatterContainer) {
            const { ChatterContainer } = chatterContainerModule;

            patch(ChatterContainer.prototype, {
                /**
                 * Previene que el chatter se posicione como panel lateral.
                 * Odoo 17/18/19 usa esta propiedad (o similar) para decidir
                 * si añadir la clase o-aside.
                 */
                get isChatterAside() {
                    return false;
                },

                /**
                 * Compatibilidad con versiones que usen 'chatterPosition'.
                 */
                get chatterPosition() {
                    return "bottom";
                },

                /**
                 * Compatibilidad con versiones que usen 'isAsideChatter'.
                 */
                get isAsideChatter() {
                    return false;
                },
            });

            console.debug("[chatter_always_bottom] ChatterContainer patched ✓");
        }
    } catch (e) {
        // La ruta del módulo puede variar entre builds/versiones.
        // El CSS y el MutationObserver actúan como respaldo.
        console.debug("[chatter_always_bottom] ChatterContainer patch skipped:", e.message);
    }
})();

// ─────────────────────────────────────────────────────────────────────────────
// CAPA 2: Parche del FormRenderer
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
    try {
        const formRendererModule = await odoo.loader.modules.get(
            "@web/views/form/form_renderer"
        );

        if (formRendererModule?.FormRenderer) {
            const { FormRenderer } = formRendererModule;

            patch(FormRenderer.prototype, {
                /**
                 * Método presente en algunas versiones de Odoo para calcular
                 * si el chatter debe ir al costado.
                 */
                get chatterPosition() {
                    return "bottom";
                },

                /**
                 * Evita que el FormRenderer active el modo xxl lateral.
                 */
                get hasChatterAside() {
                    return false;
                },

                /**
                 * Compatibilidad adicional.
                 */
                get isChatterAside() {
                    return false;
                },
            });

            console.debug("[chatter_always_bottom] FormRenderer patched ✓");
        }
    } catch (e) {
        console.debug("[chatter_always_bottom] FormRenderer patch skipped:", e.message);
    }
})();

// ─────────────────────────────────────────────────────────────────────────────
// CAPA 3: MutationObserver — red de seguridad DOM en tiempo real
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Si por cualquier razón (render tardío, módulos de terceros, Enterprise)
 * se añade la clase 'o-aside' al contenedor del chatter, la eliminamos
 * y también eliminamos la clase 'o_xxl_form_view' del form view si está
 * siendo usada para forzar el layout lateral.
 *
 * Usamos requestAnimationFrame para no entrar en bucles de mutación.
 */
const CHATTER_CONTAINER_CLASS = "o_FormRenderer_chatterContainer";
const ASIDE_CLASS = "o-aside";

function enforceBottomPosition(el) {
    if (
        el.classList &&
        el.classList.contains(CHATTER_CONTAINER_CLASS) &&
        el.classList.contains(ASIDE_CLASS)
    ) {
        requestAnimationFrame(() => {
            el.classList.remove(ASIDE_CLASS);
        });
    }
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
            enforceBottomPosition(mutation.target);
        } else if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    enforceBottomPosition(node);
                    // También revisar descendientes recién insertados
                    node.querySelectorAll &&
                        node
                            .querySelectorAll(`.${CHATTER_CONTAINER_CLASS}.${ASIDE_CLASS}`)
                            .forEach((el) => {
                                requestAnimationFrame(() => el.classList.remove(ASIDE_CLASS));
                            });
                }
            });
        }
    }
});

// Iniciamos el observer al cargar el módulo.
// document.body puede no existir aún si el módulo carga muy temprano.
function startObserver() {
    if (document.body) {
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
            childList: true,
            subtree: true,
        });
        console.debug("[chatter_always_bottom] MutationObserver active ✓");
    } else {
        // Esperar a que el DOM esté listo
        document.addEventListener("DOMContentLoaded", () => {
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ["class"],
                childList: true,
                subtree: true,
            });
            console.debug("[chatter_always_bottom] MutationObserver active (deferred) ✓");
        });
    }
}

startObserver();
