/** @odoo-module **/
/**
 * Chatter Always Bottom — Odoo 19
 * Alphaqueb Consulting SAS — v4.0.0 FINAL
 *
 * Clases reales confirmadas por diagnóstico:
 *  - Container: o-mail-ChatterContainer  (antes era o_FormRenderer_chatterContainer)
 *  - Aside:     o-aside
 */

const LOG = (...a) => console.debug("[CAB]", ...a);

const CHATTER_CLASS  = "o-mail-ChatterContainer";
const ASIDE_CLASS    = "o-aside";

function removeAside(el) {
    if (!el?.classList) return;
    if (el.classList.contains(CHATTER_CLASS) && el.classList.contains(ASIDE_CLASS)) {
        requestAnimationFrame(() => el.classList.remove(ASIDE_CLASS));
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
                n.querySelectorAll?.(`.${CHATTER_CLASS}.${ASIDE_CLASS}`).forEach(removeAside);
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
        LOG("v4.0 activo — clases reales Odoo 19 ✓");
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
}

init();