/** @odoo-module **/
/**
 * Chatter Always Bottom — Odoo 19
 * Alphaqueb Consulting SAS — v1.0.1
 *
 * CAPA 1: Parche OWL de ChatterContainer — suprime isChatterAside / isAsideChatter.
 * CAPA 2: Parche de FormRenderer — suprime hasChatterAside.
 * CAPA 3: MutationObserver — elimina la clase o-aside del DOM en tiempo real.
 *
 * Todas las capas usan try/catch. Si una falla, las otras cubren.
 */

import { patch } from "@web/core/utils/patch";

// ─────────────────────────────────────────────────────────────────────────────
// CAPA 1: ChatterContainer patch
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
    try {
        const mod = odoo.loader.modules.get("@mail/core/web/chatter_container");
        if (mod?.ChatterContainer) {
            patch(mod.ChatterContainer.prototype, {
                get isChatterAside() { return false; },
                get isAsideChatter() { return false; },
                get chatterPosition() { return "bottom"; },
            });
            console.debug("[chatter_always_bottom] ChatterContainer patched ✓");
        }
    } catch (e) {
        console.debug("[chatter_always_bottom] ChatterContainer skip:", e.message);
    }
})();

// ─────────────────────────────────────────────────────────────────────────────
// CAPA 2: FormRenderer patch
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
    try {
        const mod = odoo.loader.modules.get("@web/views/form/form_renderer");
        if (mod?.FormRenderer) {
            patch(mod.FormRenderer.prototype, {
                get hasChatterAside() { return false; },
                get isChatterAside() { return false; },
                get chatterPosition() { return "bottom"; },
            });
            console.debug("[chatter_always_bottom] FormRenderer patched ✓");
        }
    } catch (e) {
        console.debug("[chatter_always_bottom] FormRenderer skip:", e.message);
    }
})();

// ─────────────────────────────────────────────────────────────────────────────
// CAPA 3: MutationObserver — red de seguridad DOM
// Si o-aside aparece en el contenedor del chatter, la quitamos.
// También removemos o_xxl_form_view si el layout vuelve a activarse
// como row (detectado via inline style o clase CSS).
// ─────────────────────────────────────────────────────────────────────────────
const CHATTER_SEL = "o_FormRenderer_chatterContainer";
const ASIDE_CLASS = "o-aside";

function fixNode(el) {
    if (!el.classList) return;
    if (el.classList.contains(CHATTER_SEL) && el.classList.contains(ASIDE_CLASS)) {
        requestAnimationFrame(() => el.classList.remove(ASIDE_CLASS));
    }
}

const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "class") {
            fixNode(m.target);
        } else if (m.type === "childList") {
            m.addedNodes.forEach((n) => {
                if (n.nodeType !== Node.ELEMENT_NODE) return;
                fixNode(n);
                n.querySelectorAll?.(`.${CHATTER_SEL}.${ASIDE_CLASS}`)
                    .forEach((el) => requestAnimationFrame(() => el.classList.remove(ASIDE_CLASS)));
            });
        }
    }
});

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