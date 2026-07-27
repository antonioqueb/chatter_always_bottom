# -*- coding: utf-8 -*-
{
    'name': 'Chatter Always Bottom',
    'version': '19.0.2.0.0',
    'category': 'Technical',
    'summary': 'Fuerza el chatter a mostrarse siempre en la parte inferior de los formularios',
    'description': """
Chatter Always Bottom
=====================
Módulo técnico que garantiza que el chatter (registro de actividad de usuarios
en formularios) se muestre **siempre en la parte inferior** del formulario,
independientemente del tamaño de pantalla.

Por defecto Odoo 17+ mueve el chatter a un panel lateral derecho cuando la
pantalla es suficientemente ancha (xxl breakpoint). Este módulo anula ese
comportamiento de forma definitiva mediante:

Implementado con CSS puro (v10): la versión anterior aplicaba las mismas
reglas desde JavaScript con un MutationObserver sobre document.body que
observaba cambios de 'style' mientras su propio callback ESCRIBÍA 'style',
provocando un bucle de retroalimentación a ~60 fps que consumía CPU durante
toda la sesión. Sin JS, sin observers, mismo resultado visual.

Compatible con Odoo 19 Community y Enterprise.
    """,
    'author': 'Alphaqueb Consulting SAS',
    'website': 'https://alphaqueb.com',
    'license': 'LGPL-3',
    'depends': ['mail', 'web'],
    'assets': {
        'web.assets_backend': [
            'chatter_always_bottom/static/src/scss/chatter_always_bottom.scss',
        ],
    },
    'installable': True,
    'auto_install': False,
    'application': False,
}
