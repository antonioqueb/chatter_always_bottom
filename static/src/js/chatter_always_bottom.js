/** @odoo-module **/
/**
 * Chatter Always Bottom — Odoo 19
 * Alphaqueb Consulting SAS — v3.0.0 DEBUG
 *
 * Versión de diagnóstico: llena la consola con información
 * sobre el estado real del DOM para entender el problema.
 */

const LOG = (...args) => console.log("[CAB]", ...args);
const WARN = (...args) => console.warn("[CAB]", ...args);

// ─── PASO 1: Reportar qué módulos OWL están disponibles ───────────────────────
setTimeout(() => {
    LOG("=== DIAGNÓSTICO INICIO ===");

    // Verificar si odoo.loader existe
    if (!window.odoo?.loader?.modules) {
        WARN("odoo.loader.modules NO disponible");
    } else {
        LOG("Módulos cargados en odoo.loader:", [...odoo.loader.modules.keys()].filter(k =>
            k.includes("mail") || k.includes("chatter") || k.includes("form_renderer") || k.includes("form/form")
        ));
    }
}, 2000);

// ─── PASO 2: Observer DOM - reportar TODO lo que pase con el chatter ──────────
const CHATTER_CLASS = "o_FormRenderer_chatterContainer";
const ASIDE_CLASS = "o-aside";
let scanCount = 0;

function scanAndReport() {
    scanCount++;
    const allChatters = document.querySelectorAll(`.${CHATTER_CLASS}`);
    const asideChatters = document.querySelectorAll(`.${CHATTER_CLASS}.${ASIDE_CLASS}`);
    const formViews = document.querySelectorAll(".o_form_view");
    const xxlFormViews = document.querySelectorAll(".o_xxl_form_view");

    if (allChatters.length > 0) {
        LOG(`--- SCAN #${scanCount} ---`);
        LOG(`Form views: ${formViews.length}, XXL form views: ${xxlFormViews.length}`);
        LOG(`Chatter containers: ${allChatters.length}, con o-aside: ${asideChatters.length}`);

        allChatters.forEach((el, i) => {
            const cs = window.getComputedStyle(el);
            const parent = el.parentElement;
            const parentCs = parent ? window.getComputedStyle(parent) : null;

            LOG(`Chatter[${i}] clases:`, el.className);
            LOG(`Chatter[${i}] computed -> width:${cs.width}, height:${cs.height}, position:${cs.position}, overflow:${cs.overflow}, flexDirection:${cs.flexDirection}`);
            LOG(`Chatter[${i}] inline style:`, el.getAttribute("style") || "(ninguno)");

            if (parent) {
                LOG(`Chatter[${i}] PADRE clases:`, parent.className);
                LOG(`Chatter[${i}] PADRE computed -> display:${parentCs.display}, flexDirection:${parentCs.flexDirection}, width:${parentCs.width}, height:${parentCs.height}, overflow:${parentCs.overflow}, overflowY:${parentCs.overflowY}`);
            }

            // Bbox real en pantalla
            const rect = el.getBoundingClientRect();
            LOG(`Chatter[${i}] BoundingRect -> top:${rect.top.toFixed(0)}, left:${rect.left.toFixed(0)}, width:${rect.width.toFixed(0)}, height:${rect.height.toFixed(0)}`);
        });

        xxlFormViews.forEach((el, i) => {
            const cs = window.getComputedStyle(el);
            LOG(`XXL FormView[${i}] computed -> display:${cs.display}, flexDirection:${cs.flexDirection}, height:${cs.height}, overflow:${cs.overflow}, overflowY:${cs.overflowY}`);

            // Buscar si tiene style inline que override el CSS
            LOG(`XXL FormView[${i}] inline style:`, el.getAttribute("style") || "(ninguno)");
        });

        // Verificar scroll containers en la cadena
        let scrollContainer = null;
        if (allChatters[0]) {
            let node = allChatters[0].parentElement;
            LOG("--- Cadena de scroll containers hasta el body ---");
            let depth = 0;
            while (node && node !== document.body && depth < 15) {
                const cs = window.getComputedStyle(node);
                const isScrollable = cs.overflowY === "auto" || cs.overflowY === "scroll";
                if (isScrollable) {
                    LOG(`  [SCROLL] depth:${depth} | ${node.tagName}.${[...node.classList].join(".")} | overflowY:${cs.overflowY} | height:${cs.height}`);
                    if (!scrollContainer) scrollContainer = node;
                }
                node = node.parentElement;
                depth++;
            }
            LOG(`Primer scroll container detectado: ${scrollContainer ? scrollContainer.className : "NINGUNO"}`);
        }
    }
}

// ─── PASO 3: Observer que detecta cambios y loguea ────────────────────────────
const observer = new MutationObserver((mutations) => {
    let relevant = false;
    for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "class") {
            const el = m.target;
            if (el.classList?.contains(CHATTER_CLASS)) {
                relevant = true;
                WARN(`MutationObserver: clase cambió en chatter container -> "${el.className}"`);
            }
            if (el.classList?.contains("o_xxl_form_view") || el.classList?.contains("o_form_view")) {
                LOG(`MutationObserver: clase cambió en form view -> "${el.className}"`);
            }
        } else if (m.type === "childList") {
            m.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.classList?.contains(CHATTER_CLASS) ||
                        node.querySelector?.(`.${CHATTER_CLASS}`)) {
                        relevant = true;
                        LOG(`MutationObserver: chatter insertado en DOM`);
                    }
                }
            });
        }
    }
    if (relevant) {
        // Scan inmediato y 300ms después (post-OWL render)
        setTimeout(scanAndReport, 50);
        setTimeout(scanAndReport, 400);
    }
});

function init() {
    const start = () => {
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class", "style"],
            childList: true,
            subtree: true,
        });
        LOG("Observer activo. Navega a un form con chatter para ver diagnóstico.");

        // Scan inicial por si ya hay un form montado
        setTimeout(scanAndReport, 1000);
        setTimeout(scanAndReport, 3000);
    };

    if (document.body) start();
    else document.addEventListener("DOMContentLoaded", start);
}

init();

// ─── PASO 4: Exponer función de scan manual en consola ────────────────────────
window.__cabScan = scanAndReport;
LOG("Listo. Puedes llamar window.__cabScan() en cualquier momento para ver el estado actual.");