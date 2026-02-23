/** @odoo-module **/
/**
 * Chatter Always Bottom — Odoo 19
 * Alphaqueb Consulting SAS — v5.0.0
 *
 * CSS inyectado directamente desde JS para evitar depender
 * del bundle de assets (que requiere -u para regenerarse).
 * El JS sí carga siempre sin necesidad de regenerar.
 *
 * Clases reales confirmadas por diagnóstico en producción:
 *   Container : o-mail-ChatterContainer  (+ o-mail-Form-chatter)
 *   Aside     : o-aside
 *   Form view : o_xxl_form_view (flex-direction:row, ya cambia a column con JS)
 */

// ─── INYECCIÓN DE CSS ────────────────────────────────────────────────────────
const CSS = `
/* Chatter Always Bottom v5 — Alphaqueb Consulting SAS */

/* 1. Form view: row → column + scroll */
.o_form_view.o_xxl_form_view {
    flex-direction: column !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
}

/* 2. Contenedor del form: ceder scroll al padre */
.o_form_view.o_xxl_form_view > .o_form_view_container {
    flex: 0 0 auto !important;
    height: auto !important;
    overflow: visible !important;
    width: 100% !important;
    max-width: 100% !important;
    min-height: 0 !important;
}

.o_form_view.o_xxl_form_view .o_form_renderer,
.o_form_view.o_xxl_form_view .o_form_sheet_bg {
    height: auto !important;
    overflow: visible !important;
    min-height: 0 !important;
}

/* 3. ChatterContainer — quitar columna lateral, ancho completo */
.o-mail-ChatterContainer.o-aside,
.o-mail-Form-chatter.o-aside,
.o-mail-ChatterContainer,
.o-mail-Form-chatter {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    flex: 0 0 auto !important;
    position: static !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
    border-left: none !important;
}

.o-mail-ChatterContainer.o-aside,
.o-mail-Form-chatter.o-aside {
    border-top: 1px solid var(--bs-border-color, #dee2e6) !important;
}

/* 4. Chatter interno: quitar h-100 que lo hace invisible en modo column */
.o-mail-Chatter {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
    flex-grow: 0 !important;
}

.o-mail-Chatter-content {
    height: auto !important;
    overflow: visible !important;
    flex-grow: 0 !important;
}
`;

function injectCSS() {
    if (document.getElementById("chatter-always-bottom-styles")) return;
    const style = document.createElement("style");
    style.id = "chatter-always-bottom-styles";
    style.textContent = CSS;
    document.head.appendChild(style);
    console.debug("[CAB] CSS inyectado ✓");
}

// Inyectar lo antes posible
if (document.head) {
    injectCSS();
} else {
    document.addEventListener("DOMContentLoaded", injectCSS);
}

// ─── MUTATIONOBSERVER: quitar o-aside del container ──────────────────────────
const CHATTER = "o-mail-ChatterContainer";
const ASIDE   = "o-aside";

function removeAside(el) {
    if (!el?.classList) return;
    if (el.classList.contains(CHATTER) && el.classList.contains(ASIDE)) {
        requestAnimationFrame(() => el.classList.remove(ASIDE));
    }
}

const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "class") {
            removeAside(m.target);
        } else if (m.type === "childList") {
            m.addedNodes.forEach((n) => {
                if (n.nodeType !== Node.ELEMENT_NODE) return;
                removeAside(n);
                n.querySelectorAll?.(`.${CHATTER}.${ASIDE}`).forEach(removeAside);
            });
        }
    }
});

function init() {
    injectCSS(); // segunda llamada por si acaso
    if (document.body) {
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
            childList: true,
            subtree: true,
        });
        console.debug("[CAB] v5.0 activo — CSS inyectado, observer corriendo ✓");
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
}

init();