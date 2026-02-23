# -*- coding: utf-8 -*-
{
    'name': 'Chatter Always Bottom',
    'version': '19.0.1.0.0',
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

1. Sobrescritura CSS de todas las clases relevantes del layout.
2. Parche JavaScript del componente ChatterContainer para suprimir el modo aside.
3. MutationObserver como capa de defensa ante renders dinámicos.

Compatible con Odoo 19 Community y Enterprise.
    """,
    'author': 'Alphaqueb Consulting SAS',
    'website': 'https://alphaqueb.com',
    'license': 'LGPL-3',
    'depends': ['mail', 'web'],
    'assets': {
        'web.assets_backend': [
            'chatter_always_bottom/static/src/js/chatter_always_bottom.js',
        ],
    },
    'installable': True,
    'auto_install': False,
    'application': False,
}
