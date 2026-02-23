/** @odoo-module **/
/**
 * Chatter Always Bottom — Odoo 19
 * Alphaqueb Consulting SAS — v2.0.0
 *
 * El CSS ya cubre el caso .o-aside directamente.
 * Este archivo solo actúa como red de seguridad DOM:
 * si OWL re-renderiza y añade .o-aside, no crea conflictos
 * porque el CSS con .o-aside ya fuerza el layout correcto.
 *
 * El MutationObserver es opcional pero previene cualquier
 * flash visual o conflict con módulos de terceros que
 * puedan escuchar la clase .o-aside para su lógica propia.
 */

const CHATTER_CLASS = "o_FormRenderer_chatterContainer";
const ASIDE_CLASS = "o-aside";

/**
 * Si algún módulo de terceros lee .o-aside para hacer algo
 * en JavaScript (ej. calcular anchos), esto previene esa lógica.
 * El CSS solo es visual; esto asegura que la clase no exista.
 */
function removeAsideClass(el) {
    if (el.classList && el.classList.contains(CHATTER_CLASS) && el.classList.contains(ASIDE_CLASS)) {
        // Usamos requestAnimationFrame para no entrar en bucle con OWL
        requestAnimationFrame(() => {
            if (el.classList.contains(ASIDE_CLASS)) {
                el.classList.remove(ASIDE_CLASS);
            }
        });
    }
}

const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "class") {
            removeAsideClass(m.target);
        } else if (m.type === "childList") {
            m.addedNodes.forEach((node) => {
                if (node.nodeType !== Node.ELEMENT_NODE) return;
                removeAsideClass(node);
                node.querySelectorAll?.(`.${CHATTER_CLASS}.${ASIDE_CLASS}`)
                    .forEach(removeAsideClass);
            });
        }
    }
});

function init() {
    if (document.body) {
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
            childList: true,
            subtree: true,
        });
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
}

init();