/** @odoo-module **/
/**
 * Chatter Always Bottom — Odoo 19
 * Alphaqueb Consulting SAS — v7.0.0
 *
 * Sin patch de prototype (causaba crash OWL).
 * Solo DOM: style.setProperty con 'important' gana sobre
 * cualquier !important de hojas de estilos externas.
 * Observer agresivo + múltiples timeouts cubren el timing de OWL.
 */

// ─── FORZAR ESTILOS INLINE CON MÁXIMA PRIORIDAD ──────────────────────────────
function applyAll() {
    // 1. Form view xxl: column + scroll
    document.querySelectorAll(".o_form_view.o_xxl_form_view").forEach((el) => {
        el.style.setProperty("flex-direction", "column", "important");
        el.style.setProperty("overflow-y",     "auto",   "important");
        el.style.setProperty("overflow-x",     "hidden", "important");
    });

    // 2. Form container (era columna izquierda): ceder scroll al padre
    document.querySelectorAll(".o_form_view.o_xxl_form_view > .o_form_view_container").forEach((el) => {
        el.style.setProperty("flex",       "0 0 auto",  "important");
        el.style.setProperty("height",     "auto",      "important");
        el.style.setProperty("overflow",   "visible",   "important");
        el.style.setProperty("width",      "100%",      "important");
        el.style.setProperty("max-width",  "100%",      "important");
        el.style.setProperty("min-height", "0",         "important");
    });

    // 3. Renderer y sheet bg
    document.querySelectorAll(
        ".o_form_view.o_xxl_form_view .o_form_renderer," +
        ".o_form_view.o_xxl_form_view .o_form_sheet_bg"
    ).forEach((el) => {
        el.style.setProperty("height",     "auto",    "important");
        el.style.setProperty("overflow",   "visible", "important");
        el.style.setProperty("min-height", "0",       "important");
    });

    // 4. ChatterContainer: ancho completo, sin columna lateral
    document.querySelectorAll(".o-mail-ChatterContainer, .o-mail-Form-chatter").forEach((el) => {
        el.style.setProperty("width",       "100%",    "important");
        el.style.setProperty("max-width",   "100%",    "important");
        el.style.setProperty("min-width",   "0",       "important");
        el.style.setProperty("flex",        "0 0 auto","important");
        el.style.setProperty("position",    "static",  "important");
        el.style.setProperty("height",      "auto",    "important");
        el.style.setProperty("min-height",  "0",       "important");
        el.style.setProperty("max-height",  "none",    "important");
        el.style.setProperty("overflow",    "visible", "important");
        el.style.setProperty("border-left", "none",    "important");
        // Separador visual
        el.style.setProperty("border-top",  "1px solid var(--bs-border-color,#dee2e6)", "important");
        // Quitar clase o-aside si existe
        el.classList.remove("o-aside");
    });

    // 5. Chatter interno: quitar h-100 que lo colapsa en modo column
    document.querySelectorAll(".o-mail-Chatter").forEach((el) => {
        el.style.setProperty("height",     "auto", "important");
        el.style.setProperty("min-height", "0",    "important");
        el.style.setProperty("max-height", "none", "important");
        el.style.setProperty("overflow",   "visible", "important");
        el.style.setProperty("flex-grow",  "0",    "important");
    });

    document.querySelectorAll(".o-mail-Chatter-content").forEach((el) => {
        el.style.setProperty("height",    "auto",    "important");
        el.style.setProperty("overflow",  "visible", "important");
        el.style.setProperty("flex-grow", "0",       "important");
    });
}

// ─── OBSERVER AGRESIVO ────────────────────────────────────────────────────────
let rafId = null;
function scheduleApply() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
        rafId = null;
        applyAll();
    });
}

const observer = new MutationObserver(scheduleApply);

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
    if (!document.body) {
        document.addEventListener("DOMContentLoaded", init);
        return;
    }

    // Observar TODO el body: cualquier cambio de clase o inserción de nodo
    observer.observe(document.body, {
        attributes:    true,
        attributeFilter: ["class", "style"],
        childList:     true,
        subtree:       true,
    });

    // Múltiples timeouts para cubrir los diferentes momentos del render de OWL
    applyAll();
    setTimeout(applyAll, 300);
    setTimeout(applyAll, 800);
    setTimeout(applyAll, 2000);

    console.debug("[CAB] v7.0 activo ✓");
}

init();