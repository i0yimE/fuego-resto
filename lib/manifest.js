/* Datos de marca — Fuego RESTO. Editá este archivo para actualizar contenido. */
(function () {
  "use strict";

  window.__BRAND__ = {
    name: "Fuego RESTO",
    shortName: "Fuego",
    tagline: "Parrilla de barrio, brasas de verdad",
    kicker: "Parrilla de barrio · San Justo",

    contact: {
      phoneDisplay: "03756 15-49-8460",
      phoneTel: "+5493756498460",
      whatsapp: "https://wa.me/5493756498460",
      whatsappText: "Hola! Quiero reservar una mesa en Fuego RESTO",
      address: "Esquina Indart, Av. Juan Florio 3392, San Justo, La Matanza, Provincia de Buenos Aires",
      addressShort: "Av. Juan Florio 3392, San Justo",
      mapsEmbed: "https://www.google.com/maps?q=Fuego+RESTO,+Av.+Juan+Florio+3392,+San+Justo,+La+Matanza&output=embed",
      mapsDirections: "https://www.google.com/maps/dir/?api=1&destination=Fuego+RESTO,+Av.+Juan+Florio+3392,+San+Justo,+La+Matanza"
    },

    rating: { value: 4.5, count: 205, source: "Google" },
    priceRange: "$20.000 – $60.000 por persona",

    // day: 0=Domingo … 6=Sábado. null = cerrado. close puede superar 24*60 (cruza medianoche).
    hours: {
      0: { open: 9 * 60, close: 25 * 60, label: "9:00 a 1:00" },
      1: { open: 8 * 60, close: 24 * 60, label: "8:00 a 00:00" },
      2: { open: 8 * 60, close: 24 * 60, label: "8:00 a 00:00" },
      3: { open: 8 * 60, close: 24 * 60, label: "8:00 a 00:00" },
      4: null,
      5: { open: 8 * 60, close: 24 * 60, label: "8:00 a 00:00" },
      6: { open: 9 * 60, close: 25 * 60, label: "9:00 a 1:00" }
    },
    hoursRows: [
      { label: "Lunes a Miércoles", value: "8:00 – 00:00" },
      { label: "Jueves", value: "Cerrado" },
      { label: "Viernes", value: "8:00 – 00:00" },
      { label: "Sábado y Domingo", value: "9:00 – 1:00" }
    ],

    services: [
      { icon: "seat", label: "Consumo en el lugar" },
      { icon: "bag", label: "Para llevar" },
      { icon: "phone", label: "Pedidos online por WhatsApp" }
    ],
    servicesNote: "Todavía no tenemos delivery propio: los pedidos se retiran en el local.",

    badges: [
      "Ambiente familiar",
      "Patio y vereda",
      "Apto para grupos",
      "Amigable con LGBTQ+",
      "Liderado por una mujer empresaria"
    ],

    payments: ["Efectivo", "Débito", "Crédito", "Transferencia", "Billeteras virtuales"],

    // Fotos reales del local, salvo ambiente-1/2 y exterior (todavía stock, a reemplazar).
    gallery: [
      { cat: "menu", src: "assets/img/menu-bocaditos.jpg", alt: "Bocaditos crocantes con salsa, sobre la carta de Fuego RESTO" },
      { cat: "menu", src: "assets/img/menu-tostada.jpg", alt: "Tostada de palta y huevo sobre servilleta de Fuego RESTO" },
      { cat: "menu", src: "assets/img/menu-tacos-pescado.jpg", alt: "Tacos de pescado sobre la carta de Fuego RESTO" },
      { cat: "menu", src: "assets/img/menu-risotto.jpg", alt: "Risotto servido con copa de vino blanco" },
      { cat: "platos", src: "assets/img/menu-tacos.jpg", alt: "Tacos con guacamole en plato negro" },
      { cat: "platos", src: "assets/img/menu-calamares.jpg", alt: "Calamares crocantes con ensalada" },
      { cat: "platos", src: "assets/img/menu-albondigas.jpg", alt: "Albóndigas con puré sobre pizarra" },
      { cat: "platos", src: "assets/img/menu-burger-1.jpg", alt: "Hamburguesa doble de Fuego RESTO" },
      { cat: "platos", src: "assets/img/menu-burger-2.jpg", alt: "Hamburguesa con papas fritas" },
      { cat: "platos", src: "assets/img/menu-cafe.jpg", alt: "Café con arte latte y tostada de fondo" },
      { cat: "platos", src: "assets/img/menu-trago.jpg", alt: "Trago de la barra de Fuego RESTO" },
      { cat: "platos", src: "assets/img/menu-trago-coco.jpg", alt: "Trago servido en coco junto a una empanada" },
      { cat: "ambiente", src: "assets/img/ambiente-1.jpg", alt: "Patio con mesas y luces cálidas" },
      { cat: "ambiente", src: "assets/img/ambiente-2.jpg", alt: "Salón interior con mesas de madera" },
      { cat: "exterior", src: "assets/img/exterior.jpg", alt: "Fachada del local iluminada de noche" }
    ],

    dishes: [
      { name: "Milanesas", desc: "A la napolitana o al plato, con guarnición a elección." },
      { name: "Entraña", desc: "El corte estrella de la parrilla, a punto y con chimichurri de la casa." },
      { name: "Papas fritas", desc: "Doradas y crocantes, ideales para compartir." },
      { name: "Postres caseros", desc: "Hechos en casa, cambian según el día." },
      { name: "Tragos y cócteles", desc: "Barra propia, con promos 2x1 en tragos seleccionados." },
      { name: "Cafetería y desayunos", desc: "Para arrancar el día antes del mediodía." }
    ],

    // ⚠️ PLACEHOLDER — texto de ejemplo, NO son citas reales.
    // Reemplazar por el texto textual de las reseñas de Google antes de publicar.
    testimonials: [
      {
        name: "Marisol Alcain",
        text: "Un lugar hermoso y muy prolijo, se nota el cuidado en cada detalle. La atención es excelente y volvemos seguido con la familia.",
        placeholder: true
      },
      {
        name: "Gabriela Veira",
        text: "La carne es buenísima y los tragos también. Fuimos en grupo grande y nos atendieron de diez, ideal para juntadas.",
        placeholder: true
      },
      {
        name: "Lorna Paccor",
        text: "Ambiente cálido y buena onda de todo el equipo. Los postres caseros son un golazo, no te los podés perder.",
        placeholder: true
      }
    ]
  };
})();
