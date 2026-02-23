/** @odoo-module **/
/**
 * Chatter Always Bottom — Odoo 19
 * Alphaqueb Consulting SAS — v6.0.0 FINAL
 *
 * DIAGNÓSTICO CONFIRMADO:
 *  - Form flex-direction: row  (nuestro CSS perdía contra el bundle de Odoo)
 *  - Chatter x:1400 fuera del viewport (posición de columna lateral)
 *  - mailLayout @ form_renderer.js:51 → devuelve "aside" | "bottom"
 *
 * ESTRATEGIA v6:
 *  1. Patch sincrónico de FormRenderer.mailLayout → siempre "bottom"
 *     (evita que OWL genere el layout aside desde el inicio)
 *  2. inline style.setProperty con 'important' en el form view
 *     (gana sobre CUALQUIER regla !important de hojas de estilos)
 *  3. MutationObserver como net de seguridad para re-renders
 */

import { patch } from "@web/core/utils/patch";

// ─── CAPA 1: Patch de FormRenderer.mailLayout ────────────────────────────────
// odoo.loader.modules.get() es SINCRÓNICO — el módulo ya está cargado
// cuando nuestro código corre porque declaramos dependencia de @web/views/form/form_renderer
const formRendererMod = odoo.loader.modules.get("@web/views/form/form_renderer");

if (formRendererMod?.FormRenderer) {
    patch(formRendererMod.FormRenderer.prototype, {
        /**
         * Odoo usa este getter para decidir "aside" (chatter lateral)
         * o "bottom" (chatter abajo). Forzamos siempre "bottom".
         * Origen confirmado: mailLayout @ form_renderer.js:51
         */
        mailLayout() {
            return "bottom";
        },
    });
    console.debug("[CAB] FormRenderer.mailLayout patched → 'bottom' ✓");
} else {
    console.warn("[CAB] FormRenderer no encontrado en loader — usando solo CSS/DOM fallback");
}

// ─── CAPA 2: Forzar estilos inline con !important (máxima prioridad CSS) ─────
// element.style.setProperty(prop, value, 'important') gana sobre
// cualquier regla !important en hojas de estilos externas.
function forceFormLayout(formEl) {
    if (!formEl) return;
    formEl.style.setProperty("flex-direction", "column", "important");
    formEl.style.setProperty("overflow-y", "auto", "important");
    formEl.style.setProperty("overflow-x", "hidden", "important");
}

function forceChatterLayout(chatterEl) {
    if (!chatterEl) return;
    chatterEl.style.setProperty("width", "100%", "important");
    chatterEl.style.setProperty("max-width", "100%", "important");
    chatterEl.style.setProperty("position", "static", "important");
    chatterEl.style.setProperty("height", "auto", "important");
    chatterEl.style.setProperty("min-height", "0", "important");
    chatterEl.style.setProperty("max-height", "none", "important");
    chatterEl.style.setProperty("overflow", "visible", "important");
    chatterEl.style.setProperty("border-left", "none", "important");
    chatterEl.style.setProperty("flex", "0 0 auto", "important");
}

function forceFormContainerLayout(containerEl) {
    if (!containerEl) return;
    containerEl.style.setProperty("flex", "0 0 auto", "important");
    containerEl.style.setProperty("height", "auto", "important");
    containerEl.style.setProperty("overflow", "visible", "important");
    containerEl.style.setProperty("width", "100%", "important");
    containerEl.style.setProperty("max-width", "100%", "important");
}

function forceChatterInnerLayout(chatterInnerEl) {
    if (!chatterInnerEl) return;
    chatterInnerEl.style.setProperty("height", "auto", "important");
    chatterInnerEl.style.setProperty("max-height", "none", "important");
    chatterInnerEl.style.setProperty("overflow", "visible", "important");
    chatterInnerEl.style.setProperty("flex-grow", "0", "important");
}

function applyAll() {
    // Form view xxl
    document.querySelectorAll(".o_form_view.o_xxl_form_view").forEach(forceFormLayout);
    // Form view container (columna izquierda en modo row)
    document.querySelectorAll(".o_form_view.o_xxl_form_view > .o_form_view_container").forEach(forceFormContainerLayout);
    // ChatterContainer (clase real Odoo 19)
    document.querySelectorAll(".o-mail-ChatterContainer, .o-mail-Form-chatter").forEach(forceChatterLayout);
    // Chatter interno
    document.querySelectorAll(".o-mail-Chatter").forEach(forceChatterInnerLayout);
    // Quitar o-aside si existe
    document.querySelectorAll(".o-mail-ChatterContainer.o-aside, .o-mail-Form-chatter.o-aside").forEach(el => {
        el.classList.remove("o-aside");
    });
}

// ─── CAPA 3: MutationObserver ─────────────────────────────────────────────────
let applyTimer = null;
function scheduleApply() {
    if (applyTimer) return;
    applyTimer = requestAnimationFrame(() => {
        applyTimer = null;
        applyAll();
    });
}

const observer = new MutationObserver((mutations) => {
    let relevant = false;
    for (const m of mutations) {
        const el = m.target;
        if (m.type === "attributes" && m.attributeName === "class") {
            if (el.classList?.contains("o_xxl_form_view") ||
                el.classList?.contains("o-mail-ChatterContainer") ||
                el.classList?.contains("o-mail-Form-chatter")) {
                relevant = true;
                break;
            }
        } else if (m.type === "childList") {
            for (const node of m.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE &&
                    (node.classList?.contains("o-mail-ChatterContainer") ||
                     node.querySelector?.(".o-mail-ChatterContainer") ||
                     node.classList?.contains("o_xxl_form_view"))) {
                    relevant = true;
                    break;
                }
            }
        }
        if (relevant) break;
    }
    if (relevant) scheduleApply();
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
    if (document.body) {
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class", "style"],
            childList: true,
            subtree: true,
        });
        // Aplicar inmediatamente por si ya hay un form montado
        applyAll();
        // Y de nuevo tras 500ms por si OWL terminó de renderizar después
        setTimeout(applyAll, 500);
        setTimeout(applyAll, 1500);
        console.debug("[CAB] v6.0 activo ✓");
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
}

init();