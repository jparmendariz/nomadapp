import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  es: {
    // Navigation
    'nav.search': 'Buscar Viaje',
    'nav.deals': 'Ofertas Flash',
    'nav.events': 'Eventos',

    // Home
    'home.title': 'Encuentra viajes baratos',
    'home.titleAccent': 'sin esfuerzo',
    'home.subtitle': 'Compara precios de múltiples proveedores, descubre ofertas flash y encuentra eventos en tu destino',
    'home.searchCard': 'Buscar Viaje',
    'home.searchDesc': 'Compara vuelos y hoteles de múltiples proveedores',
    'home.dealsCard': 'Ofertas Flash',
    'home.dealsDesc': 'Promociones por tiempo limitado que no puedes perder',
    'home.eventsCard': 'Eventos',
    'home.eventsDesc': 'Conciertos, experiencias y actividades en tu destino',
    'home.trustText': 'Comparamos precios de:',

    // Search
    'search.title': 'Encuentra tu próxima aventura',
    'search.subtitle': 'Te sugerimos los mejores destinos dentro de tu presupuesto',
    'search.empty': 'Busca tu próximo destino',
    'search.emptyDesc': 'Ingresa tu presupuesto y fechas para ver destinos disponibles',
    'search.tripType': '¿Qué incluye tu viaje?',
    'search.flightOnly': 'Solo vuelo',
    'search.flightHotel': 'Vuelo + Hotel',
    'search.origin': 'Ciudad de origen',
    'search.budget': 'Presupuesto máximo (MXN)',
    'search.travelers': 'Viajeros',
    'search.traveler': 'viajero',
    'search.travelers_plural': 'viajeros',
    'search.noDates': 'No tengo fechas aún - muéstrame las mejores opciones',
    'search.departureDate': 'Fecha de salida',
    'search.returnDate': 'Fecha de regreso',
    'search.flexibility': 'Flexibilidad de fechas',
    'search.exactDates': 'Fechas exactas',
    'search.flexibleDays': '+/- {days} días',
    'search.flexibleHint': 'Buscaremos vuelos más baratos {days} días antes o después',
    'search.hotelStars': 'Estrellas mínimas del hotel',
    'search.searchButton': 'Buscar destinos',
    'search.searching': 'Buscando mejores precios...',
    'search.results': 'destinos encontrados',
    'search.fromPrice': 'Desde',

    // Destination Card (search results)
    'destination.seasonHigh': 'Temporada alta',
    'destination.seasonMedium': 'Temporada media',
    'destination.seasonLow': 'Temporada baja',
    'destination.foodPerDay': 'comida/día',
    'destination.nights': 'noches',
    'destination.bestPrices': 'Mejores precios:',
    'destination.viewDetails': 'Ver detalles',
    'destination.addCompare': 'Agregar a comparación',
    'destination.removeCompare': 'Quitar de comparación',
    'destination.total': 'total',
    'destination.perNight': '/noche',

    // Events
    'events.badge': 'Conciertos, tours y experiencias',
    'events.title': 'Eventos y Experiencias',
    'events.subtitle': 'Encuentra qué hacer en tu destino y reserva con anticipación',
    'events.concerts': 'Conciertos y Festivales',
    'events.experiences': 'Experiencias y Tours',
    'events.noEvents': 'No hay eventos disponibles',
    'events.tryFilters': 'Intenta ajustar los filtros o selecciona otra ciudad',
    'events.providers': 'Nuestros proveedores',

    // Deals
    'deals.title': 'Ofertas Flash',
    'deals.subtitle': 'Promociones exclusivas actualizadas cada 30 minutos',
    'deals.offers': 'Ofertas',
    'deals.avgDiscount': 'Descuento prom.',
    'deals.all': 'Todos',
    'deals.flights': 'Vuelos',
    'deals.cruises': 'Cruceros',
    'deals.hotels': 'Hoteles',
    'deals.from': 'Desde:',
    'deals.to': 'Hacia:',
    'deals.anyCity': 'Cualquier ciudad',
    'deals.anyDestination': 'Cualquier destino',
    'deals.sortBy': 'Ordenar:',
    'deals.discountHighLow': 'Descuento: mayor a menor',
    'deals.discountLowHigh': 'Descuento: menor a mayor',
    'deals.priceLowHigh': 'Precio: menor a mayor',
    'deals.priceHighLow': 'Precio: mayor a menor',
    'deals.moreNights': 'Más noches',
    'deals.currency': 'Moneda:',
    'deals.hotDeals': 'Ofertas Calientes',
    'deals.upToDiscount': 'Hasta {percent}% de descuento',
    'deals.allOffers': 'Todas las Ofertas',
    'deals.noOffers': 'No hay ofertas con estos filtros',
    'deals.tryOther': 'Intenta con otros filtros o vuelve pronto',
    'deals.clearFilters': 'Limpiar filtros',
    'deals.howItWorks': '¿Cómo funcionan las ofertas?',
    'deals.monitor': 'Monitoreamos 24/7',
    'deals.monitorDesc': 'Buscamos ofertas en aerolíneas, cruceros y hoteles.',
    'deals.limited': 'Tiempo limitado',
    'deals.limitedDesc': 'Las ofertas expiran rápido. Actúa antes de que se agoten.',
    'deals.direct': 'Reserva directo',
    'deals.directDesc': 'Te redirigimos al proveedor para que reserves al mejor precio.',
    'deals.refresh': 'Actualizar ofertas',
    'deals.lastUpdated': 'Actualizado',

    // Deal Card
    'deal.nights': 'noches',
    'deal.cruise': 'Crucero',
    'deal.hotel': 'Hotel',
    'deal.flight': 'Vuelo',
    'deal.perPerson': '/persona',
    'deal.roundTrip': 'ida y vuelta',
    'deal.expiresIn': 'Expira en',
    'deal.expired': 'Oferta expirada',
    'deal.viewDeal': 'Ver oferta',
    'deal.justPosted': 'Recién publicada',
    'deal.hoursAgo': 'Hace {hours}h',
    'deal.peopleViewing': '{count} personas viendo',
    'deal.share': 'Compartir',
    'deal.cabin': 'Cabina',
    'deal.from': 'Desde',
    'deal.sailsOn': 'Zarpa:',
    'deal.checkIn': 'Check-in:',
    'deal.travel': 'Viaja:',
    'deal.shareText': '¡Encontré esta oferta increíble!',
    'deal.linkCopied': '¡Enlace copiado!',
    'deal.before': 'antes',

    // Common
    'common.retry': 'Reintentar',
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.close': 'Cerrar',
    'common.compare': 'Comparar',
    'common.optional': 'opcional',
    'common.seeAll': 'Ver todas',

    // Footer
    'footer.brand': 'Nomad - Viajes Baratos',
    'footer.disclaimer': 'Los precios mostrados son aproximados. Al hacer clic en "Reservar" serás redirigido al sitio del proveedor.',

    // Navigation extras
    'nav.wishlist': 'Favoritos',
    'nav.calendar': 'Calendario',
    'nav.alerts': 'Alertas',
    'nav.map': 'Mapa',

    // Wishlist
    'wishlist.title': 'Mis Favoritos',
    'wishlist.subtitle': 'Ofertas que guardaste para revisar después',
    'wishlist.empty': 'No tienes ofertas guardadas',
    'wishlist.emptyDesc': 'Guarda ofertas tocando el corazón en cualquier tarjeta',
    'wishlist.addedOn': 'Guardado el',
    'wishlist.remove': 'Quitar de favoritos',
    'wishlist.clearAll': 'Limpiar todo',
    'wishlist.count': '{count} ofertas guardadas',
    'wishlist.loginToSave': 'Inicia sesión para guardar tus favoritos',
    'wishlist.loginToSaveDesc': 'Tus favoritos se sincronizarán en todos tus dispositivos',

    // Alerts
    'alerts.title': 'Mis Alertas',
    'alerts.subtitle': 'Te notificamos cuando haya ofertas que te interesen',
    'alerts.create': 'Crear alerta',
    'alerts.createNew': 'Nueva Alerta',
    'alerts.createFirst': 'Crear mi primera alerta',
    'alerts.destination': 'Destino',
    'alerts.destinationPlaceholder': 'ej. Cancún, París, Tokyo',
    'alerts.origin': 'Origen',
    'alerts.originPlaceholder': 'ej. Ciudad de México',
    'alerts.anyDestination': 'Cualquier destino',
    'alerts.maxPrice': 'Precio máximo',
    'alerts.minDiscount': 'Descuento mínimo',
    'alerts.type': 'Tipo',
    'alerts.active': 'Activa',
    'alerts.paused': 'Pausada',
    'alerts.pause': 'Pausar',
    'alerts.activate': 'Activar',
    'alerts.inactive': 'Inactiva',
    'alerts.empty': 'No tienes alertas',
    'alerts.emptyDesc': 'Crea una alerta y te avisamos cuando encontremos ofertas que coincidan',
    'alerts.noAlerts': 'No tienes alertas configuradas',
    'alerts.noAlertsDesc': 'Crea una alerta para recibir notificaciones de ofertas',
    'alerts.enableNotifications': 'Activa las notificaciones',
    'alerts.enableDesc': 'Para recibir alertas instantáneas cuando encontremos ofertas',
    'alerts.enable': 'Activar',
    'alerts.notificationsEnabled': 'Notificaciones activadas',
    'alerts.newDealAlert': '¡Nueva oferta que coincide con tu alerta!',
    'alerts.created': 'Creada',
    'alerts.howItWorks': '¿Cómo funcionan las alertas?',
    'alerts.step1Title': 'Configura tus criterios',
    'alerts.step1Desc': 'Define el destino y precio máximo que buscas',
    'alerts.step2Title': 'Monitoreamos por ti',
    'alerts.step2Desc': 'Revisamos nuevas ofertas constantemente',
    'alerts.step3Title': 'Te notificamos',
    'alerts.step3Desc': 'Recibes una alerta cuando encontramos algo',
    'alerts.loginRequired': 'Inicia sesión para crear alertas',
    'alerts.loginRequiredDesc': 'Las alertas se guardan en tu perfil y te notificamos cuando encontremos ofertas',

    // Calendar
    'calendar.title': 'Calendario de Precios',
    'calendar.subtitle': 'Encuentra el día más barato para viajar',
    'calendar.selectDestination': 'Selecciona un destino',
    'calendar.cheapestDay': 'Día más barato',
    'calendar.averagePrice': 'Precio promedio',
    'calendar.month': 'Mes',
    'calendar.selectMonth': 'Selecciona un mes',

    // Map
    'map.title': 'Mapa de Ofertas',
    'map.subtitle': 'Explora ofertas alrededor del mundo',
    'map.dealsInRegion': 'ofertas en esta región',

    // Comparator
    'compare.title': 'Comparador',
    'compare.subtitle': 'Compara hasta 3 ofertas lado a lado',
    'compare.add': 'Agregar al comparador',
    'compare.remove': 'Quitar del comparador',
    'compare.full': 'Máximo 3 ofertas',
    'compare.empty': 'Selecciona ofertas para comparar',
    'compare.price': 'Precio',
    'compare.discount': 'Descuento',
    'compare.duration': 'Duración',
    'compare.destination': 'Destino',

    // Budget Calculator
    'budget.title': 'Calculadora de Presupuesto',
    'budget.subtitle': 'Estima el costo total de tu viaje',
    'budget.flight': 'Vuelo',
    'budget.hotel': 'Hotel',
    'budget.food': 'Comida (por día)',
    'budget.transport': 'Transporte local',
    'budget.activities': 'Actividades',
    'budget.total': 'Total estimado',
    'budget.perPerson': 'Por persona',
    'budget.nights': 'noches',
    'budget.travelers': 'Viajeros',

    // Price indicators
    'price.dropped': 'Bajó de precio',
    'price.increased': 'Subió de precio',
    'price.stable': 'Precio estable',
    'price.verified': 'Verificado hace {minutes} min',

    // Filters
    'filters.travelDates': 'Fechas de viaje',
    'filters.dateFrom': 'Desde',
    'filters.dateTo': 'Hasta',
    'filters.anyDate': 'Cualquier fecha',
    'filters.thisMonth': 'Este mes',
    'filters.nextMonth': 'Próximo mes',
    'filters.next3Months': 'Próximos 3 meses',

    // Reviews
    'reviews.title': 'Tips de Viajeros',
    'reviews.writeReview': 'Escribe un tip',
    'reviews.helpful': 'Útil',
    'reviews.noReviews': 'Sé el primero en compartir un tip',

    // Auth
    'auth.continueWithGoogle': 'Continuar con Google',
    'auth.loading': 'Cargando...',
    'auth.logout': 'Cerrar sesión',
    'auth.myProfile': 'Mi Perfil',
    'auth.settings': 'Configuración',
    'auth.loginRequired': 'Inicia sesión para continuar',
    'auth.welcomeBack': 'Bienvenido de nuevo',
    'auth.newUser': 'Bienvenido a Nomad',

    // Profile
    'profile.memberSince': 'Miembro desde',
    'profile.saved': 'Guardados',
    'profile.alerts': 'Alertas',
    'profile.tabs.saved': 'Guardados',
    'profile.tabs.recommended': 'Recomendados',
    'profile.tabs.alerts': 'Alertas',
    'profile.tabs.settings': 'Configuración',
    'profile.noSaved': 'No tienes ofertas guardadas',
    'profile.noSavedDesc': 'Guarda ofertas que te interesen y aparecerán aquí',
    'profile.exploreDeals': 'Explorar ofertas',
    'profile.noRecommendations': 'Aún no hay recomendaciones',
    'profile.noRecommendationsDesc': 'Busca y explora ofertas para que podamos recomendarte destinos',
    'profile.startSearching': 'Empezar a buscar',
    'profile.recommendationsDesc': 'Basado en tus búsquedas y ofertas vistas',
    'profile.recommended': 'Recomendado',
    'profile.settings.language': 'Idioma',
    'profile.settings.currency': 'Moneda preferida',
    'profile.settings.notifications': 'Notificaciones push',
    'profile.settings.notificationsDesc': 'Recibe alertas cuando encontremos ofertas para ti',
    'profile.settings.save': 'Guardar cambios',
    'alerts.from': 'desde'
  },
  en: {
    // Navigation
    'nav.search': 'Search Trip',
    'nav.deals': 'Flash Deals',
    'nav.events': 'Events',

    // Home
    'home.title': 'Find cheap trips',
    'home.titleAccent': 'effortlessly',
    'home.subtitle': 'Compare prices from multiple providers, discover flash deals and find events at your destination',
    'home.searchCard': 'Search Trip',
    'home.searchDesc': 'Compare flights and hotels from multiple providers',
    'home.dealsCard': 'Flash Deals',
    'home.dealsDesc': 'Limited-time promotions you can\'t miss',
    'home.eventsCard': 'Events',
    'home.eventsDesc': 'Concerts, experiences and activities at your destination',
    'home.trustText': 'We compare prices from:',

    // Search
    'search.title': 'Find your next adventure',
    'search.subtitle': 'We suggest the best destinations within your budget',
    'search.empty': 'Search for your next destination',
    'search.emptyDesc': 'Enter your budget and dates to see available destinations',
    'search.tripType': 'What does your trip include?',
    'search.flightOnly': 'Flight only',
    'search.flightHotel': 'Flight + Hotel',
    'search.origin': 'Origin city',
    'search.budget': 'Maximum budget (MXN)',
    'search.travelers': 'Travelers',
    'search.traveler': 'traveler',
    'search.travelers_plural': 'travelers',
    'search.noDates': "I don't have dates yet - show me the best options",
    'search.departureDate': 'Departure date',
    'search.returnDate': 'Return date',
    'search.flexibility': 'Date flexibility',
    'search.exactDates': 'Exact dates',
    'search.flexibleDays': '+/- {days} days',
    'search.flexibleHint': "We'll search for cheaper flights {days} days before or after",
    'search.hotelStars': 'Minimum hotel stars',
    'search.searchButton': 'Search destinations',
    'search.searching': 'Searching best prices...',
    'search.results': 'destinations found',
    'search.fromPrice': 'From',

    // Destination Card (search results)
    'destination.seasonHigh': 'High season',
    'destination.seasonMedium': 'Mid season',
    'destination.seasonLow': 'Low season',
    'destination.foodPerDay': 'food/day',
    'destination.nights': 'nights',
    'destination.bestPrices': 'Best prices:',
    'destination.viewDetails': 'View details',
    'destination.addCompare': 'Add to compare',
    'destination.removeCompare': 'Remove from compare',
    'destination.total': 'total',
    'destination.perNight': '/night',

    // Events
    'events.badge': 'Concerts, tours and experiences',
    'events.title': 'Events & Experiences',
    'events.subtitle': 'Find what to do at your destination and book ahead',
    'events.concerts': 'Concerts & Festivals',
    'events.experiences': 'Experiences & Tours',
    'events.noEvents': 'No events available',
    'events.tryFilters': 'Try adjusting the filters or select another city',
    'events.providers': 'Our providers',

    // Deals
    'deals.title': 'Flash Deals',
    'deals.subtitle': 'Exclusive promotions updated every 30 minutes',
    'deals.offers': 'Deals',
    'deals.avgDiscount': 'Avg. discount',
    'deals.all': 'All',
    'deals.flights': 'Flights',
    'deals.cruises': 'Cruises',
    'deals.hotels': 'Hotels',
    'deals.from': 'From:',
    'deals.to': 'To:',
    'deals.anyCity': 'Any city',
    'deals.anyDestination': 'Any destination',
    'deals.sortBy': 'Sort:',
    'deals.discountHighLow': 'Discount: high to low',
    'deals.discountLowHigh': 'Discount: low to high',
    'deals.priceLowHigh': 'Price: low to high',
    'deals.priceHighLow': 'Price: high to low',
    'deals.moreNights': 'More nights',
    'deals.currency': 'Currency:',
    'deals.hotDeals': 'Hot Deals',
    'deals.upToDiscount': 'Up to {percent}% off',
    'deals.allOffers': 'All Deals',
    'deals.noOffers': 'No deals match these filters',
    'deals.tryOther': 'Try other filters or check back soon',
    'deals.clearFilters': 'Clear filters',
    'deals.howItWorks': 'How do deals work?',
    'deals.monitor': 'We monitor 24/7',
    'deals.monitorDesc': 'We search for deals from airlines, cruises and hotels.',
    'deals.limited': 'Limited time',
    'deals.limitedDesc': 'Deals expire fast. Act before they\'re gone.',
    'deals.direct': 'Book direct',
    'deals.directDesc': 'We redirect you to the provider for the best price.',
    'deals.refresh': 'Refresh deals',
    'deals.lastUpdated': 'Updated',

    // Deal Card
    'deal.nights': 'nights',
    'deal.cruise': 'Cruise',
    'deal.hotel': 'Hotel',
    'deal.flight': 'Flight',
    'deal.perPerson': '/person',
    'deal.roundTrip': 'round trip',
    'deal.expiresIn': 'Expires in',
    'deal.expired': 'Deal expired',
    'deal.viewDeal': 'View deal',
    'deal.justPosted': 'Just posted',
    'deal.hoursAgo': '{hours}h ago',
    'deal.peopleViewing': '{count} people viewing',
    'deal.share': 'Share',
    'deal.cabin': 'Cabin',
    'deal.from': 'From',
    'deal.sailsOn': 'Sails:',
    'deal.checkIn': 'Check-in:',
    'deal.travel': 'Travel:',
    'deal.shareText': 'I found this amazing deal!',
    'deal.linkCopied': 'Link copied!',
    'deal.before': 'was',

    // Common
    'common.retry': 'Retry',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.compare': 'Compare',
    'common.optional': 'optional',
    'common.seeAll': 'See all',

    // Footer
    'footer.brand': 'Nomad - Cheap Travel',
    'footer.disclaimer': 'Prices shown are approximate. By clicking "Book" you will be redirected to the provider\'s website.',

    // Navigation extras
    'nav.wishlist': 'Favorites',
    'nav.calendar': 'Calendar',
    'nav.alerts': 'Alerts',
    'nav.map': 'Map',

    // Wishlist
    'wishlist.title': 'My Favorites',
    'wishlist.subtitle': 'Deals you saved to review later',
    'wishlist.empty': 'No saved deals',
    'wishlist.emptyDesc': 'Save deals by tapping the heart on any card',
    'wishlist.addedOn': 'Saved on',
    'wishlist.remove': 'Remove from favorites',
    'wishlist.clearAll': 'Clear all',
    'wishlist.count': '{count} saved deals',
    'wishlist.loginToSave': 'Sign in to save your favorites',
    'wishlist.loginToSaveDesc': 'Your favorites will sync across all your devices',

    // Alerts
    'alerts.title': 'My Alerts',
    'alerts.subtitle': 'We\'ll notify you when there are deals you\'ll like',
    'alerts.create': 'Create alert',
    'alerts.createNew': 'New Alert',
    'alerts.createFirst': 'Create my first alert',
    'alerts.destination': 'Destination',
    'alerts.destinationPlaceholder': 'e.g. Cancun, Paris, Tokyo',
    'alerts.origin': 'Origin',
    'alerts.originPlaceholder': 'e.g. New York',
    'alerts.anyDestination': 'Any destination',
    'alerts.maxPrice': 'Max price',
    'alerts.minDiscount': 'Min discount',
    'alerts.type': 'Type',
    'alerts.active': 'Active',
    'alerts.paused': 'Paused',
    'alerts.pause': 'Pause',
    'alerts.activate': 'Activate',
    'alerts.inactive': 'Inactive',
    'alerts.empty': 'No alerts yet',
    'alerts.emptyDesc': 'Create an alert and we\'ll notify you when we find matching deals',
    'alerts.noAlerts': 'No alerts configured',
    'alerts.noAlertsDesc': 'Create an alert to receive deal notifications',
    'alerts.enableNotifications': 'Enable notifications',
    'alerts.enableDesc': 'To receive instant alerts when we find deals',
    'alerts.enable': 'Enable',
    'alerts.notificationsEnabled': 'Notifications enabled',
    'alerts.newDealAlert': 'New deal matching your alert!',
    'alerts.created': 'Created',
    'alerts.howItWorks': 'How do alerts work?',
    'alerts.step1Title': 'Set your criteria',
    'alerts.step1Desc': 'Define the destination and max price you\'re looking for',
    'alerts.step2Title': 'We monitor for you',
    'alerts.step2Desc': 'We constantly check for new deals',
    'alerts.step3Title': 'We notify you',
    'alerts.step3Desc': 'You receive an alert when we find something',
    'alerts.loginRequired': 'Sign in to create alerts',
    'alerts.loginRequiredDesc': 'Alerts are saved to your profile and we\'ll notify you when we find deals',

    // Calendar
    'calendar.title': 'Price Calendar',
    'calendar.subtitle': 'Find the cheapest day to travel',
    'calendar.selectDestination': 'Select a destination',
    'calendar.cheapestDay': 'Cheapest day',
    'calendar.averagePrice': 'Average price',
    'calendar.month': 'Month',
    'calendar.selectMonth': 'Select a month',

    // Map
    'map.title': 'Deals Map',
    'map.subtitle': 'Explore deals around the world',
    'map.dealsInRegion': 'deals in this region',

    // Comparator
    'compare.title': 'Comparator',
    'compare.subtitle': 'Compare up to 3 deals side by side',
    'compare.add': 'Add to compare',
    'compare.remove': 'Remove from compare',
    'compare.full': 'Maximum 3 deals',
    'compare.empty': 'Select deals to compare',
    'compare.price': 'Price',
    'compare.discount': 'Discount',
    'compare.duration': 'Duration',
    'compare.destination': 'Destination',

    // Budget Calculator
    'budget.title': 'Budget Calculator',
    'budget.subtitle': 'Estimate the total cost of your trip',
    'budget.flight': 'Flight',
    'budget.hotel': 'Hotel',
    'budget.food': 'Food (per day)',
    'budget.transport': 'Local transport',
    'budget.activities': 'Activities',
    'budget.total': 'Estimated total',
    'budget.perPerson': 'Per person',
    'budget.nights': 'nights',
    'budget.travelers': 'Travelers',

    // Price indicators
    'price.dropped': 'Price dropped',
    'price.increased': 'Price increased',
    'price.stable': 'Price stable',
    'price.verified': 'Verified {minutes} min ago',

    // Filters
    'filters.travelDates': 'Travel dates',
    'filters.dateFrom': 'From',
    'filters.dateTo': 'To',
    'filters.anyDate': 'Any date',
    'filters.thisMonth': 'This month',
    'filters.nextMonth': 'Next month',
    'filters.next3Months': 'Next 3 months',

    // Reviews
    'reviews.title': 'Traveler Tips',
    'reviews.writeReview': 'Write a tip',
    'reviews.helpful': 'Helpful',
    'reviews.noReviews': 'Be the first to share a tip',

    // Auth
    'auth.continueWithGoogle': 'Continue with Google',
    'auth.loading': 'Loading...',
    'auth.logout': 'Sign out',
    'auth.myProfile': 'My Profile',
    'auth.settings': 'Settings',
    'auth.loginRequired': 'Sign in to continue',
    'auth.welcomeBack': 'Welcome back',
    'auth.newUser': 'Welcome to Nomad',

    // Profile
    'profile.memberSince': 'Member since',
    'profile.saved': 'Saved',
    'profile.alerts': 'Alerts',
    'profile.tabs.saved': 'Saved',
    'profile.tabs.recommended': 'Recommended',
    'profile.tabs.alerts': 'Alerts',
    'profile.tabs.settings': 'Settings',
    'profile.noSaved': 'No saved deals',
    'profile.noSavedDesc': 'Save deals you like and they will appear here',
    'profile.exploreDeals': 'Explore deals',
    'profile.noRecommendations': 'No recommendations yet',
    'profile.noRecommendationsDesc': 'Search and explore deals so we can recommend destinations',
    'profile.startSearching': 'Start searching',
    'profile.recommendationsDesc': 'Based on your searches and viewed deals',
    'profile.recommended': 'Recommended',
    'profile.settings.language': 'Language',
    'profile.settings.currency': 'Preferred currency',
    'profile.settings.notifications': 'Push notifications',
    'profile.settings.notificationsDesc': 'Receive alerts when we find deals for you',
    'profile.settings.save': 'Save changes',
    'alerts.from': 'from'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Check localStorage or browser language
    const saved = localStorage.getItem('nomad-language');
    if (saved) return saved;

    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'en' ? 'en' : 'es';
  });

  useEffect(() => {
    localStorage.setItem('nomad-language', language);
  }, [language]);

  const t = (key, params = {}) => {
    let text = translations[language][key] || translations['es'][key] || key;

    // Replace parameters like {percent} or {count}
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, value);
    });

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
