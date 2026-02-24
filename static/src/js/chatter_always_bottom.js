/** @odoo-module **/
/**
 * Chatter Always Bottom — Odoo 19
 * Alphaqueb Consulting SAS — v9.2.0
 *
 * FIX v9.2: Excluir .o-mail-ChatterContainer dentro de reportes contables
 * (.o_account_report_chatter) para no romper el layout de libro mayor,
 * balance general, etc.
 */

// ─── Helper: ¿es el chatter de un reporte contable? ─────────────────────────
function isAccountReportChatter(el) {
    return el.classList.contains("o_account_report_chatter") ||
           !!el.closest(".o_account_report_chatter, .o_account_report_scroll_container, .o_account_reports_page");
}

function applyAll() {
    // 1. o_form_renderer — el culpable del split (confirmado)
    document.querySelectorAll(".o_xxl_form_view .o_form_renderer").forEach((el) => {
        el.style.setProperty("flex-direction", "column",  "important");
        el.style.setProperty("flex-wrap",      "nowrap",  "important");
        el.style.setProperty("height",         "auto",    "important");
        el.style.setProperty("overflow",       "visible", "important");
        el.style.setProperty("width",          "100%",    "important");
    });

    // 2. Form view
    document.querySelectorAll(".o_form_view.o_xxl_form_view").forEach((el) => {
        el.style.setProperty("flex-direction", "column", "important");
        el.style.setProperty("overflow-y",     "auto",   "important");
        el.style.setProperty("overflow-x",     "hidden", "important");
    });

    // 3. Form view container
    document.querySelectorAll(".o_xxl_form_view .o_form_view_container").forEach((el) => {
        el.style.setProperty("flex-direction", "column",   "important");
        el.style.setProperty("flex",           "1 1 auto", "important");
        el.style.setProperty("height",         "auto",     "important");
        el.style.setProperty("overflow",       "visible",  "important");
        el.style.setProperty("width",          "100%",     "important");
        el.style.setProperty("max-width",      "100%",     "important");
    });

    // 4. Sheet bg
    document.querySelectorAll(".o_xxl_form_view .o_form_sheet_bg").forEach((el) => {
        el.style.setProperty("width",      "100%",    "important");
        el.style.setProperty("max-width",  "100%",    "important");
        el.style.setProperty("height",     "auto",    "important");
        el.style.setProperty("overflow",   "visible", "important");
        el.style.setProperty("min-height", "0",       "important");
        el.style.setProperty("flex",       "1 1 auto","important");
    });

    // 5. Form sheet
    document.querySelectorAll(".o_xxl_form_view .o_form_sheet").forEach((el) => {
        el.style.setProperty("width",     "100%",    "important");
        el.style.setProperty("max-width", "100%",    "important");
        el.style.setProperty("overflow",  "visible", "important");
    });

    // 6. ChatterContainer: SOLO si NO es el chatter de reporte contable
    document.querySelectorAll(".o-mail-ChatterContainer, .o-mail-Form-chatter").forEach((el) => {
        if (isAccountReportChatter(el)) return; // ← skip reportes contables

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

    // 7. Chatter interno: quitar h-100 (solo en formularios, no en reportes)
    document.querySelectorAll(".o-mail-Chatter").forEach((el) => {
        if (isAccountReportChatter(el)) return; // ← skip reportes contables

        el.style.setProperty("height",     "auto",    "important");
        el.style.setProperty("min-height", "0",       "important");
        el.style.setProperty("max-height", "none",    "important");
        el.style.setProperty("overflow",   "visible", "important");
        el.style.setProperty("flex-grow",  "0",       "important");
    });

    document.querySelectorAll(".o-mail-Chatter-content").forEach((el) => {
        if (isAccountReportChatter(el)) return; // ← skip reportes contables

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
    console.debug("[CAB] v9.2 activo ✓");
}

init();