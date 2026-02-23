/** @odoo-module **/
/**
 * Chatter Always Bottom — Odoo 19
 * Alphaqueb Consulting SAS — v9.0.0 FINAL
 *
 * DIAGNÓSTICO DEFINITIVO (console.table confirmado):
 *
 * Árbol DOM real:
 *  [4] .o_form_view.o_xxl_form_view        flex-direction: column ✓ (ya aplicamos)
 *  [3] .o_form_view_container               flex-direction: column ✓ (ya aplicamos)
 *  [2] main.o_content                       display: block
 *  [1] .o_form_renderer  ← EL CULPABLE      flex-direction: ROW  ← aquí ocurre el split
 *  [0] .o-mail-ChatterContainer             x: 1400 (fuera del viewport)
 *
 * FIX: aplicar flex-direction:column + overflow:visible al .o_form_renderer
 */

function applyAll() {
    // 1. o_form_renderer — EL CULPABLE REAL
    document.querySelectorAll(
        ".o_xxl_form_view .o_form_renderer"
    ).forEach((el) => {
        el.style.setProperty("flex-direction", "column",  "important");
        el.style.setProperty("flex-wrap",      "nowrap",  "important");
        el.style.setProperty("height",         "auto",    "important");
        el.style.setProperty("overflow",       "visible", "important");
    });

    // 2. Form view y container (capas superiores — ya funcionaban)
    document.querySelectorAll(".o_form_view.o_xxl_form_view").forEach((el) => {
        el.style.setProperty("flex-direction", "column", "important");
        el.style.setProperty("overflow-y",     "auto",   "important");
        el.style.setProperty("overflow-x",     "hidden", "important");
    });

    document.querySelectorAll(".o_xxl_form_view .o_form_view_container").forEach((el) => {
        el.style.setProperty("flex-direction", "column",   "important");
        el.style.setProperty("flex",           "1 1 auto", "important");
        el.style.setProperty("height",         "auto",     "important");
        el.style.setProperty("overflow",       "visible",  "important");
        el.style.setProperty("width",          "100%",     "important");
    });

    // 3. Sheet bg
    document.querySelectorAll(".o_xxl_form_view .o_form_sheet_bg").forEach((el) => {
        el.style.setProperty("height",     "auto",    "important");
        el.style.setProperty("overflow",   "visible", "important");
        el.style.setProperty("min-height", "0",       "important");
        el.style.setProperty("width",      "100%",    "important");
    });

    // 4. ChatterContainer: ancho completo, quitar aside
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

    // 5. Chatter interno: quitar h-100 que lo colapsa en modo column
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
    console.debug("[CAB] v9.0 activo ✓");
}

init();