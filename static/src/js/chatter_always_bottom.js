/** @odoo-module **/
/**
 * Chatter Always Bottom — Odoo 19
 * Alphaqueb Consulting SAS — v8.0.0
 *
 * FIX: El split row/column ocurre dentro de .o_form_view_container,
 * no solo en .o_form_view. Ambos necesitan flex-direction:column.
 */

function applyAll() {
    // 1. Form view: column + scroll
    document.querySelectorAll(".o_form_view.o_xxl_form_view").forEach((el) => {
        el.style.setProperty("flex-direction", "column", "important");
        el.style.setProperty("overflow-y",     "auto",   "important");
        el.style.setProperty("overflow-x",     "hidden", "important");
    });

    // 2. Form view container — TAMBIÉN column (aquí ocurre el split real)
    document.querySelectorAll(".o_form_view.o_xxl_form_view .o_form_view_container").forEach((el) => {
        el.style.setProperty("flex-direction", "column", "important");
        el.style.setProperty("flex",           "1 1 auto","important");
        el.style.setProperty("height",         "auto",   "important");
        el.style.setProperty("overflow",       "visible","important");
        el.style.setProperty("width",          "100%",   "important");
        el.style.setProperty("max-width",      "100%",   "important");
    });

    // 3. Renderer y sheet bg
    document.querySelectorAll(
        ".o_form_view.o_xxl_form_view .o_form_renderer," +
        ".o_form_view.o_xxl_form_view .o_form_sheet_bg"
    ).forEach((el) => {
        el.style.setProperty("height",     "auto",    "important");
        el.style.setProperty("overflow",   "visible", "important");
        el.style.setProperty("min-height", "0",       "important");
        el.style.setProperty("width",      "100%",    "important");
    });

    // 4. ChatterContainer: ancho completo
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
        el.style.setProperty("border-top",  "1px solid var(--bs-border-color,#dee2e6)", "important");
        el.classList.remove("o-aside");
    });

    // 5. Chatter interno: quitar h-100
    document.querySelectorAll(".o-mail-Chatter").forEach((el) => {
        el.style.setProperty("height",     "auto",    "important");
        el.style.setProperty("min-height", "0",       "important");
        el.style.setProperty("max-height", "none",    "important");
        el.style.setProperty("overflow",   "visible", "important");
        el.style.setProperty("flex-grow",  "0",       "important");
    });

    document.querySelectorAll(".o-mail-Chatter-content").forEach((el) => {
        el.style.setProperty("height",    "auto",    "important");
        el.style.setProperty("overflow",  "visible", "important");
        el.style.setProperty("flex-grow", "0",       "important");
    });
}

// ─── OBSERVER ────────────────────────────────────────────────────────────────
let rafId = null;
function scheduleApply() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => { rafId = null; applyAll(); });
}

const observer = new MutationObserver(scheduleApply);

function init() {
    if (!document.body) { document.addEventListener("DOMContentLoaded", init); return; }
    observer.observe(document.body, {
        attributes: true, attributeFilter: ["class", "style"],
        childList: true,  subtree: true,
    });
    applyAll();
    setTimeout(applyAll, 300);
    setTimeout(applyAll, 800);
    setTimeout(applyAll, 2000);
    console.debug("[CAB] v8.0 activo ✓");
}

init();