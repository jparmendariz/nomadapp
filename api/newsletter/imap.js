/**
 * IMAP Email Service for Nomada Newsletter Parser
 * Connects to email inbox and fetches unread newsletters
 */

import Imap from 'imap';
import { simpleParser } from 'mailparser';

const IMAP_CONFIG = {
  user: process.env.NEWSLETTER_EMAIL,
  password: process.env.NEWSLETTER_PASSWORD,
  host: process.env.NEWSLETTER_IMAP_HOST || 'imap.gmail.com',
  port: parseInt(process.env.NEWSLETTER_IMAP_PORT) || 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

// Known newsletter senders we want to parse
export const NEWSLETTER_SENDERS = [
  // =============================================
  // AEROLÍNEAS MEXICANAS
  // =============================================
  { domain: 'vivaaerobus.com', name: 'VivaAerobus', type: 'airline' },
  { domain: 'volaris.com', name: 'Volaris', type: 'airline' },
  { domain: 'aeromexico.com', name: 'Aeromexico', type: 'airline' },
  { domain: 'clubpremier.com', name: 'Club Premier', type: 'airline' },
  { domain: 'taraerolineas.com', name: 'TAR Aerolíneas', type: 'airline' },
  { domain: 'magnicharters.com', name: 'Magnicharters', type: 'airline' },
  { domain: 'vfrviajes.com', name: 'VFR Viajes', type: 'airline' },

  // =============================================
  // AEROLÍNEAS USA / CANADÁ
  // =============================================
  { domain: 'united.com', name: 'United Airlines', type: 'airline' },
  { domain: 'aa.com', name: 'American Airlines', type: 'airline' },
  { domain: 'americanairlines.com', name: 'American Airlines', type: 'airline' },
  { domain: 'delta.com', name: 'Delta Air Lines', type: 'airline' },
  { domain: 'southwest.com', name: 'Southwest Airlines', type: 'airline' },
  { domain: 'jetblue.com', name: 'JetBlue', type: 'airline' },
  { domain: 'spirit.com', name: 'Spirit Airlines', type: 'airline' },
  { domain: 'flyfrontier.com', name: 'Frontier Airlines', type: 'airline' },
  { domain: 'alaskaair.com', name: 'Alaska Airlines', type: 'airline' },
  { domain: 'hawaiianairlines.com', name: 'Hawaiian Airlines', type: 'airline' },
  { domain: 'aircanada.com', name: 'Air Canada', type: 'airline' },
  { domain: 'westjet.com', name: 'WestJet', type: 'airline' },
  { domain: 'allegiantair.com', name: 'Allegiant Air', type: 'airline' },
  { domain: 'suncountry.com', name: 'Sun Country', type: 'airline' },

  // =============================================
  // AEROLÍNEAS LATINOAMÉRICA
  // =============================================
  { domain: 'avianca.com', name: 'Avianca', type: 'airline' },
  { domain: 'latam.com', name: 'LATAM Airlines', type: 'airline' },
  { domain: 'copaair.com', name: 'Copa Airlines', type: 'airline' },
  { domain: 'jetsmart.com', name: 'JetSMART', type: 'airline' },
  { domain: 'flybondi.com', name: 'Flybondi', type: 'airline' },
  { domain: 'skyairline.com', name: 'Sky Airline', type: 'airline' },
  { domain: 'wingo.com', name: 'Wingo', type: 'airline' },
  { domain: 'aerolineas.com.ar', name: 'Aerolíneas Argentinas', type: 'airline' },
  { domain: 'gol.com.br', name: 'GOL', type: 'airline' },
  { domain: 'azul.com.br', name: 'Azul', type: 'airline' },

  // =============================================
  // AEROLÍNEAS EUROPA
  // =============================================
  { domain: 'britishairways.com', name: 'British Airways', type: 'airline' },
  { domain: 'ba.com', name: 'British Airways', type: 'airline' },
  { domain: 'lufthansa.com', name: 'Lufthansa', type: 'airline' },
  { domain: 'airfrance.com', name: 'Air France', type: 'airline' },
  { domain: 'klm.com', name: 'KLM', type: 'airline' },
  { domain: 'iberia.com', name: 'Iberia', type: 'airline' },
  { domain: 'vueling.com', name: 'Vueling', type: 'airline' },
  { domain: 'ryanair.com', name: 'Ryanair', type: 'airline' },
  { domain: 'easyjet.com', name: 'EasyJet', type: 'airline' },
  { domain: 'swiss.com', name: 'Swiss Air', type: 'airline' },
  { domain: 'austrian.com', name: 'Austrian Airlines', type: 'airline' },
  { domain: 'brusselsairlines.com', name: 'Brussels Airlines', type: 'airline' },
  { domain: 'aireuropa.com', name: 'Air Europa', type: 'airline' },
  { domain: 'tap.pt', name: 'TAP Portugal', type: 'airline' },
  { domain: 'flytap.com', name: 'TAP Portugal', type: 'airline' },
  { domain: 'alitalia.com', name: 'Alitalia/ITA', type: 'airline' },
  { domain: 'ita-airways.com', name: 'ITA Airways', type: 'airline' },
  { domain: 'aeroflot.com', name: 'Aeroflot', type: 'airline' },
  { domain: 'norwegian.com', name: 'Norwegian Air', type: 'airline' },
  { domain: 'finnair.com', name: 'Finnair', type: 'airline' },
  { domain: 'sas.se', name: 'SAS Scandinavian', type: 'airline' },
  { domain: 'lot.com', name: 'LOT Polish', type: 'airline' },
  { domain: 'icelandair.com', name: 'Icelandair', type: 'airline' },
  { domain: 'wizzair.com', name: 'Wizz Air', type: 'airline' },
  { domain: 'transavia.com', name: 'Transavia', type: 'airline' },
  { domain: 'eurowings.com', name: 'Eurowings', type: 'airline' },
  { domain: 'condor.com', name: 'Condor', type: 'airline' },
  { domain: 'tui.com', name: 'TUI Airways', type: 'airline' },
  { domain: 'virginatlantic.com', name: 'Virgin Atlantic', type: 'airline' },
  { domain: 'aerlingus.com', name: 'Aer Lingus', type: 'airline' },

  // =============================================
  // AEROLÍNEAS MEDIO ORIENTE / ASIA / OCEANÍA
  // =============================================
  { domain: 'emirates.com', name: 'Emirates', type: 'airline' },
  { domain: 'qatarairways.com', name: 'Qatar Airways', type: 'airline' },
  { domain: 'turkishairlines.com', name: 'Turkish Airlines', type: 'airline' },
  { domain: 'thy.com', name: 'Turkish Airlines', type: 'airline' },
  { domain: 'etihad.com', name: 'Etihad Airways', type: 'airline' },
  { domain: 'saudia.com', name: 'Saudia', type: 'airline' },
  { domain: 'royaljordanian.com', name: 'Royal Jordanian', type: 'airline' },
  { domain: 'singaporeair.com', name: 'Singapore Airlines', type: 'airline' },
  { domain: 'cathaypacific.com', name: 'Cathay Pacific', type: 'airline' },
  { domain: 'ana.co.jp', name: 'ANA', type: 'airline' },
  { domain: 'jal.com', name: 'Japan Airlines', type: 'airline' },
  { domain: 'koreanair.com', name: 'Korean Air', type: 'airline' },
  { domain: 'asiana.com', name: 'Asiana Airlines', type: 'airline' },
  { domain: 'thaiairways.com', name: 'Thai Airways', type: 'airline' },
  { domain: 'vietnamairlines.com', name: 'Vietnam Airlines', type: 'airline' },
  { domain: 'airasia.com', name: 'AirAsia', type: 'airline' },
  { domain: 'cebuair.com', name: 'Cebu Pacific', type: 'airline' },
  { domain: 'philippineairlines.com', name: 'Philippine Airlines', type: 'airline' },
  { domain: 'airchina.com', name: 'Air China', type: 'airline' },
  { domain: 'csair.com', name: 'China Southern', type: 'airline' },
  { domain: 'ceair.com', name: 'China Eastern', type: 'airline' },
  { domain: 'hainanairlines.com', name: 'Hainan Airlines', type: 'airline' },
  { domain: 'airindia.com', name: 'Air India', type: 'airline' },
  { domain: 'qantas.com', name: 'Qantas', type: 'airline' },
  { domain: 'airnewzealand.com', name: 'Air New Zealand', type: 'airline' },
  { domain: 'jetstar.com', name: 'Jetstar', type: 'airline' },
  { domain: 'virginaustralia.com', name: 'Virgin Australia', type: 'airline' },
  { domain: 'flyscoot.com', name: 'Scoot', type: 'airline' },
  { domain: 'malaysiaairlines.com', name: 'Malaysia Airlines', type: 'airline' },
  { domain: 'garuda-indonesia.com', name: 'Garuda Indonesia', type: 'airline' },
  { domain: 'evaair.com', name: 'EVA Air', type: 'airline' },

  // =============================================
  // AEROLÍNEAS ÁFRICA
  // =============================================
  { domain: 'ethiopianairlines.com', name: 'Ethiopian Airlines', type: 'airline' },
  { domain: 'egyptair.com', name: 'EgyptAir', type: 'airline' },
  { domain: 'flysaa.com', name: 'South African Airways', type: 'airline' },
  { domain: 'royalairmaroc.com', name: 'Royal Air Maroc', type: 'airline' },
  { domain: 'kenya-airways.com', name: 'Kenya Airways', type: 'airline' },

  // =============================================
  // AGENCIAS DE VIAJE MÉXICO
  // =============================================
  { domain: 'despegar.com', name: 'Despegar', type: 'agency' },
  { domain: 'bestday.com', name: 'Best Day', type: 'agency' },
  { domain: 'pricetravel.com', name: 'Price Travel', type: 'agency' },
  { domain: 'mundojoven.com', name: 'Mundo Joven', type: 'agency' },
  { domain: 'clickandtravel.com', name: 'Click & Travel', type: 'agency' },
  { domain: 'viajacompara.com', name: 'Viaja Compara', type: 'agency' },
  { domain: 'aerobot.com.mx', name: 'Aerobot', type: 'agency' },
  { domain: 'vivaviajes.com', name: 'Viva Viajes', type: 'agency' },
  { domain: 'ofertravel.com.mx', name: 'Ofertravel', type: 'agency' },

  // =============================================
  // OTAs INTERNACIONALES
  // =============================================
  { domain: 'kayak.com', name: 'Kayak', type: 'agency' },
  { domain: 'kayak.com.mx', name: 'Kayak México', type: 'agency' },
  { domain: 'skyscanner.com', name: 'Skyscanner', type: 'agency' },
  { domain: 'skyscanner.com.mx', name: 'Skyscanner México', type: 'agency' },
  { domain: 'expedia.com', name: 'Expedia', type: 'agency' },
  { domain: 'expedia.mx', name: 'Expedia México', type: 'agency' },
  { domain: 'trivago.com', name: 'Trivago', type: 'agency' },
  { domain: 'trivago.com.mx', name: 'Trivago México', type: 'agency' },
  { domain: 'tripadvisor.com', name: 'TripAdvisor', type: 'agency' },
  { domain: 'tripadvisor.com.mx', name: 'TripAdvisor México', type: 'agency' },
  { domain: 'priceline.com', name: 'Priceline', type: 'agency' },
  { domain: 'orbitz.com', name: 'Orbitz', type: 'agency' },
  { domain: 'travelocity.com', name: 'Travelocity', type: 'agency' },
  { domain: 'cheapoair.com', name: 'CheapOair', type: 'agency' },
  { domain: 'hopper.com', name: 'Hopper', type: 'agency' },
  { domain: 'momondo.com', name: 'Momondo', type: 'agency' },
  { domain: 'google.com', name: 'Google Travel', type: 'agency' }, // Google Flights emails
  { domain: 'kiwi.com', name: 'Kiwi.com', type: 'agency' },
  { domain: 'lastminute.com', name: 'Lastminute', type: 'agency' },
  { domain: 'opodo.com', name: 'Opodo', type: 'agency' },
  { domain: 'edreams.com', name: 'eDreams', type: 'agency' },
  { domain: 'travelzoo.com', name: 'Travelzoo', type: 'agency' },
  { domain: 'cheapflights.com', name: 'Cheapflights', type: 'agency' },
  { domain: 'gotogate.com', name: 'Gotogate', type: 'agency' },
  { domain: 'mytrip.com', name: 'Mytrip', type: 'agency' },
  { domain: 'budgetair.com', name: 'BudgetAir', type: 'agency' },
  { domain: 'farecompare.com', name: 'FareCompare', type: 'agency' },
  { domain: 'airfarewatchdog.com', name: 'Airfarewatchdog', type: 'agency' },
  { domain: 'studentuniverse.com', name: 'StudentUniverse', type: 'agency' },
  { domain: 'statravel.com', name: 'STA Travel', type: 'agency' },
  { domain: 'flightnetwork.com', name: 'Flight Network', type: 'agency' },
  { domain: 'justfly.com', name: 'JustFly', type: 'agency' },
  { domain: 'flightcenter.com', name: 'Flight Center', type: 'agency' },
  { domain: 'trip.com', name: 'Trip.com', type: 'agency' },
  { domain: 'ctrip.com', name: 'Ctrip', type: 'agency' },
  { domain: 'agoda.com', name: 'Agoda', type: 'agency' },
  { domain: 'makemytrip.com', name: 'MakeMyTrip', type: 'agency' },
  { domain: 'cleartrip.com', name: 'Cleartrip', type: 'agency' },
  { domain: 'yatra.com', name: 'Yatra', type: 'agency' },
  { domain: 'goibibo.com', name: 'Goibibo', type: 'agency' },

  // =============================================
  // HOTELES - CADENAS MEXICANAS
  // =============================================
  { domain: 'posadas.com', name: 'Posadas (Fiesta Inn, Live Aqua)', type: 'hotel' },
  { domain: 'fiestamericana.com', name: 'Fiesta Americana', type: 'hotel' },
  { domain: 'cityexpress.com', name: 'City Express', type: 'hotel' },
  { domain: 'palaceresorts.com', name: 'Palace Resorts', type: 'hotel' },
  { domain: 'oasishoteles.com', name: 'Oasis Hotels', type: 'hotel' },
  { domain: 'rfroyalresorts.com', name: 'Royal Resorts', type: 'hotel' },
  { domain: 'hotelesmision.com', name: 'Hoteles Misión', type: 'hotel' },
  { domain: 'camino-real.com', name: 'Camino Real', type: 'hotel' },
  { domain: 'barcelo.com', name: 'Barceló Hotels', type: 'hotel' },
  { domain: 'krystalhotels.com', name: 'Krystal Hotels', type: 'hotel' },

  // =============================================
  // HOTELES - CADENAS INTERNACIONALES
  // =============================================
  { domain: 'booking.com', name: 'Booking.com', type: 'hotel' },
  { domain: 'hotels.com', name: 'Hotels.com', type: 'hotel' },
  { domain: 'marriott.com', name: 'Marriott', type: 'hotel' },
  { domain: 'hilton.com', name: 'Hilton', type: 'hotel' },
  { domain: 'hyatt.com', name: 'Hyatt', type: 'hotel' },
  { domain: 'ihg.com', name: 'IHG (Holiday Inn, Crowne Plaza)', type: 'hotel' },
  { domain: 'wyndham.com', name: 'Wyndham', type: 'hotel' },
  { domain: 'accor.com', name: 'Accor', type: 'hotel' },
  { domain: 'radisson.com', name: 'Radisson', type: 'hotel' },
  { domain: 'bestwestern.com', name: 'Best Western', type: 'hotel' },
  { domain: 'choicehotels.com', name: 'Choice Hotels', type: 'hotel' },
  { domain: 'fourseasons.com', name: 'Four Seasons', type: 'hotel' },
  { domain: 'ritzcarlton.com', name: 'Ritz-Carlton', type: 'hotel' },
  { domain: 'starwood.com', name: 'Starwood', type: 'hotel' },
  { domain: 'starwoodhotels.com', name: 'Starwood', type: 'hotel' },
  { domain: 'sheraton.com', name: 'Sheraton', type: 'hotel' },
  { domain: 'westin.com', name: 'Westin', type: 'hotel' },
  { domain: 'whotels.com', name: 'W Hotels', type: 'hotel' },
  { domain: 'spg.com', name: 'SPG', type: 'hotel' },
  { domain: 'motel6.com', name: 'Motel 6', type: 'hotel' },
  { domain: 'super8.com', name: 'Super 8', type: 'hotel' },
  { domain: 'laQuinta.com', name: 'La Quinta', type: 'hotel' },
  { domain: 'redroofinn.com', name: 'Red Roof Inn', type: 'hotel' },
  { domain: 'airbnb.com', name: 'Airbnb', type: 'hotel' },
  { domain: 'vrbo.com', name: 'VRBO', type: 'hotel' },
  { domain: 'homeaway.com', name: 'HomeAway', type: 'hotel' },
  { domain: 'hostelworld.com', name: 'Hostelworld', type: 'hotel' },
  { domain: 'hostels.com', name: 'Hostels.com', type: 'hotel' },
  { domain: 'hoteltonight.com', name: 'HotelTonight', type: 'hotel' },
  { domain: 'melia.com', name: 'Meliá Hotels', type: 'hotel' },
  { domain: 'nh-hotels.com', name: 'NH Hotels', type: 'hotel' },
  { domain: 'riu.com', name: 'RIU Hotels', type: 'hotel' },
  { domain: 'iberostar.com', name: 'Iberostar', type: 'hotel' },
  { domain: 'sandals.com', name: 'Sandals', type: 'hotel' },
  { domain: 'beaches.com', name: 'Beaches Resorts', type: 'hotel' },
  { domain: 'clubmed.com', name: 'Club Med', type: 'hotel' },
  { domain: 'allinclusive.com', name: 'All Inclusive', type: 'hotel' },
  { domain: 'travelodge.com', name: 'Travelodge', type: 'hotel' },
  { domain: 'premierinn.com', name: 'Premier Inn', type: 'hotel' },
  { domain: 'oyorooms.com', name: 'OYO Rooms', type: 'hotel' },
  { domain: 'treebo.com', name: 'Treebo', type: 'hotel' },
  { domain: 'fabhotels.com', name: 'FabHotels', type: 'hotel' },

  // =============================================
  // CRUCEROS
  // =============================================
  { domain: 'royalcaribbean.com', name: 'Royal Caribbean', type: 'cruise' },
  { domain: 'carnival.com', name: 'Carnival', type: 'cruise' },
  { domain: 'ncl.com', name: 'Norwegian Cruise Line', type: 'cruise' },
  { domain: 'princess.com', name: 'Princess Cruises', type: 'cruise' },
  { domain: 'hollandamerica.com', name: 'Holland America', type: 'cruise' },
  { domain: 'celebritycruises.com', name: 'Celebrity Cruises', type: 'cruise' },
  { domain: 'msccruises.com', name: 'MSC Cruises', type: 'cruise' },
  { domain: 'costacruises.com', name: 'Costa Cruises', type: 'cruise' },
  { domain: 'disneycruise.com', name: 'Disney Cruise Line', type: 'cruise' },
  { domain: 'vikingcruises.com', name: 'Viking Cruises', type: 'cruise' },
  { domain: 'cunard.com', name: 'Cunard', type: 'cruise' },
  { domain: 'oceaniacruises.com', name: 'Oceania Cruises', type: 'cruise' },
  { domain: 'silversea.com', name: 'Silversea', type: 'cruise' },
  { domain: 'seabourn.com', name: 'Seabourn', type: 'cruise' },
  { domain: 'windstarcruises.com', name: 'Windstar Cruises', type: 'cruise' },
  { domain: 'azamara.com', name: 'Azamara', type: 'cruise' },
  { domain: 'virginvoyages.com', name: 'Virgin Voyages', type: 'cruise' },
  { domain: 'cruisedirect.com', name: 'CruiseDirect', type: 'cruise' },
  { domain: 'cruisecritic.com', name: 'Cruise Critic', type: 'cruise' },
  { domain: 'vacationstogo.com', name: 'Vacations To Go', type: 'cruise' },

  // =============================================
  // RENTA DE AUTOS
  // =============================================
  { domain: 'hertz.com', name: 'Hertz', type: 'car' },
  { domain: 'enterprise.com', name: 'Enterprise', type: 'car' },
  { domain: 'avis.com', name: 'Avis', type: 'car' },
  { domain: 'budget.com', name: 'Budget', type: 'car' },
  { domain: 'nationalcar.com', name: 'National', type: 'car' },
  { domain: 'alamo.com', name: 'Alamo', type: 'car' },
  { domain: 'dollar.com', name: 'Dollar', type: 'car' },
  { domain: 'thrifty.com', name: 'Thrifty', type: 'car' },
  { domain: 'sixt.com', name: 'Sixt', type: 'car' },
  { domain: 'europcar.com', name: 'Europcar', type: 'car' },
  { domain: 'rentalcars.com', name: 'Rentalcars.com', type: 'car' },
  { domain: 'turo.com', name: 'Turo', type: 'car' },
  { domain: 'getaround.com', name: 'Getaround', type: 'car' },
  { domain: 'zipcar.com', name: 'Zipcar', type: 'car' },
  { domain: 'carrentals.com', name: 'CarRentals.com', type: 'car' },
  { domain: 'discover.cars', name: 'DiscoverCars', type: 'car' },
  { domain: 'autoeurope.com', name: 'Auto Europe', type: 'car' },

  // =============================================
  // PROMOS Y DESCUENTOS
  // =============================================
  { domain: 'promodescuentos.com', name: 'PromoDescuentos', type: 'aggregator' },
  { domain: 'groupon.com', name: 'Groupon', type: 'aggregator' },
  { domain: 'groupon.com.mx', name: 'Groupon México', type: 'aggregator' },
  { domain: 'scottscheapflights.com', name: "Scott's Cheap Flights", type: 'aggregator' },
  { domain: 'goingawesomeplaces.com', name: 'Going', type: 'aggregator' },
  { domain: 'theflightdeal.com', name: 'The Flight Deal', type: 'aggregator' },
  { domain: 'secretflying.com', name: 'Secret Flying', type: 'aggregator' },
  { domain: 'flyertalk.com', name: 'FlyerTalk', type: 'aggregator' },
  { domain: 'thepointsguy.com', name: 'The Points Guy', type: 'aggregator' },
  { domain: 'onemileatatime.com', name: 'One Mile at a Time', type: 'aggregator' },
  { domain: 'milevalue.com', name: 'MileValue', type: 'aggregator' },
  { domain: 'nerdwallet.com', name: 'NerdWallet Travel', type: 'aggregator' },
  { domain: 'upgradedpoints.com', name: 'Upgraded Points', type: 'aggregator' },
  { domain: 'travelandleisure.com', name: 'Travel + Leisure', type: 'aggregator' },
  { domain: 'cntraveler.com', name: 'Condé Nast Traveler', type: 'aggregator' },
  { domain: 'afar.com', name: 'AFAR', type: 'aggregator' },
  { domain: 'lonelyplanet.com', name: 'Lonely Planet', type: 'aggregator' },
  { domain: 'matadornetwork.com', name: 'Matador Network', type: 'aggregator' },
  { domain: 'nomadicmatt.com', name: 'Nomadic Matt', type: 'aggregator' },

  // =============================================
  // PROGRAMAS DE LEALTAD / MILLAS
  // =============================================
  { domain: 'mileageplus.com', name: 'MileagePlus (United)', type: 'loyalty' },
  { domain: 'aadvantage.com', name: 'AAdvantage (AA)', type: 'loyalty' },
  { domain: 'delta.skymiles.com', name: 'SkyMiles (Delta)', type: 'loyalty' },
  { domain: 'rapidrewards.com', name: 'Rapid Rewards (Southwest)', type: 'loyalty' },
  { domain: 'marriottbonvoy.com', name: 'Marriott Bonvoy', type: 'loyalty' },
  { domain: 'hiltonhonors.com', name: 'Hilton Honors', type: 'loyalty' },
  { domain: 'worldofhyatt.com', name: 'World of Hyatt', type: 'loyalty' },
  { domain: 'ihgrewards.com', name: 'IHG Rewards', type: 'loyalty' },
  { domain: 'milesandmore.com', name: 'Miles & More (Lufthansa)', type: 'loyalty' },
  { domain: 'avios.com', name: 'Avios (BA/Iberia)', type: 'loyalty' },
  { domain: 'flyingblue.com', name: 'Flying Blue (Air France/KLM)', type: 'loyalty' },
  { domain: 'asiamiles.com', name: 'Asia Miles', type: 'loyalty' },
  { domain: 'krisflyer.com', name: 'KrisFlyer (Singapore)', type: 'loyalty' },
  { domain: 'skywards.com', name: 'Skywards (Emirates)', type: 'loyalty' },
  { domain: 'qmiles.com', name: 'Privilege Club (Qatar)', type: 'loyalty' },
  { domain: 'lifemiles.com', name: 'LifeMiles (Avianca)', type: 'loyalty' },
  { domain: 'copaconnectmiles.com', name: 'ConnectMiles (Copa)', type: 'loyalty' },

  // =============================================
  // TARJETAS DE VIAJE / BANCOS (solo travel rewards)
  // =============================================
  { domain: 'chase.com', name: 'Chase Travel', type: 'loyalty' },
  { domain: 'americanexpress.com', name: 'Amex Travel', type: 'loyalty' },
  { domain: 'capitalone.com', name: 'Capital One Travel', type: 'loyalty' },
  { domain: 'citi.com', name: 'Citi ThankYou', type: 'loyalty' },

  // =============================================
  // TOURS Y ACTIVIDADES
  // =============================================
  { domain: 'viator.com', name: 'Viator', type: 'activity' },
  { domain: 'getyourguide.com', name: 'GetYourGuide', type: 'activity' },
  { domain: 'klook.com', name: 'Klook', type: 'activity' },
  { domain: 'civitatis.com', name: 'Civitatis', type: 'activity' },
  { domain: 'airbnb.com', name: 'Airbnb Experiences', type: 'activity' },
  { domain: 'withlocals.com', name: 'Withlocals', type: 'activity' },
  { domain: 'toursbylocals.com', name: 'ToursByLocals', type: 'activity' },
  { domain: 'xcaret.com', name: 'Xcaret', type: 'activity' },
  { domain: 'xel-ha.com', name: 'Xel-Há', type: 'activity' },

  // =============================================
  // SEGUROS DE VIAJE
  // =============================================
  { domain: 'worldnomads.com', name: 'World Nomads', type: 'insurance' },
  { domain: 'allianzassistance.com', name: 'Allianz Travel', type: 'insurance' },
  { domain: 'travelguard.com', name: 'Travel Guard', type: 'insurance' },
  { domain: 'squaremouth.com', name: 'Squaremouth', type: 'insurance' },
  { domain: 'insuremytrip.com', name: 'InsureMyTrip', type: 'insurance' },
  { domain: 'assist-card.com', name: 'Assist Card', type: 'insurance' },

  // =============================================
  // TRENES
  // =============================================
  { domain: 'amtrak.com', name: 'Amtrak', type: 'train' },
  { domain: 'eurostar.com', name: 'Eurostar', type: 'train' },
  { domain: 'raileurope.com', name: 'Rail Europe', type: 'train' },
  { domain: 'renfe.com', name: 'Renfe', type: 'train' },
  { domain: 'trenitalia.com', name: 'Trenitalia', type: 'train' },
  { domain: 'sncf.com', name: 'SNCF', type: 'train' },
  { domain: 'bahn.de', name: 'Deutsche Bahn', type: 'train' },
  { domain: 'thetrainline.com', name: 'Trainline', type: 'train' },
  { domain: 'ouigo.com', name: 'Ouigo', type: 'train' },
  { domain: 'thalys.com', name: 'Thalys', type: 'train' },
  { domain: 'italotreno.it', name: 'Italo', type: 'train' },

  // =============================================
  // AUTOBUSES
  // =============================================
  { domain: 'greyhound.com', name: 'Greyhound', type: 'bus' },
  { domain: 'flixbus.com', name: 'FlixBus', type: 'bus' },
  { domain: 'megabus.com', name: 'Megabus', type: 'bus' },
  { domain: 'etn.com.mx', name: 'ETN', type: 'bus' },
  { domain: 'primeraplus.com.mx', name: 'Primera Plus', type: 'bus' },
  { domain: 'ado.com.mx', name: 'ADO', type: 'bus' },
  { domain: 'clickbus.com.mx', name: 'ClickBus México', type: 'bus' },
  { domain: 'busbud.com', name: 'Busbud', type: 'bus' }
];

/**
 * Get sender info from email address
 */
export function identifySender(fromAddress) {
  const email = fromAddress.toLowerCase();

  for (const sender of NEWSLETTER_SENDERS) {
    if (email.includes(sender.domain)) {
      return sender;
    }
  }

  return null;
}

/**
 * Connect to IMAP and fetch emails from known senders
 * Only fetches emails from the last 24 hours (read or unread)
 */
export async function fetchUnreadNewsletters(maxEmails = 50) {
  return new Promise((resolve, reject) => {
    if (!IMAP_CONFIG.user || !IMAP_CONFIG.password) {
      return reject(new Error('Newsletter email credentials not configured'));
    }

    const imap = new Imap(IMAP_CONFIG);
    const emails = [];

    // Calculate date for 24 hours ago (IMAP SINCE uses date only, not time)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const sinceDate = yesterday.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err, box) => { // true = read-only mode
        if (err) {
          imap.end();
          return reject(err);
        }

        // Search for ALL emails from the last 24 hours (read or unread)
        // Duplicates are filtered by checking processed_emails table in Supabase
        imap.search([['SINCE', sinceDate]], (err, results) => {
          if (err) {
            imap.end();
            return reject(err);
          }

          if (!results || results.length === 0) {
            imap.end();
            return resolve([]);
          }

          // Limit to maxEmails most recent
          const emailIds = results.slice(-maxEmails);

          const fetch = imap.fetch(emailIds, {
            bodies: ''
            // No markSeen - we process read and unread emails
          });

          fetch.on('message', (msg, seqno) => {
            let emailData = { seqno };

            msg.on('body', (stream, info) => {
              let buffer = '';

              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });

              stream.once('end', async () => {
                try {
                  const parsed = await simpleParser(buffer);

                  const fromAddress = parsed.from?.value?.[0]?.address || '';
                  const sender = identifySender(fromAddress);

                  // Only process emails from known senders
                  if (sender) {
                    emailData = {
                      ...emailData,
                      messageId: parsed.messageId,
                      from: fromAddress,
                      sender: sender,
                      subject: parsed.subject || '',
                      date: parsed.date,
                      text: parsed.text || '',
                      html: parsed.html || '',
                      attachments: parsed.attachments || []
                    };
                    emails.push(emailData);
                  }
                } catch (parseErr) {
                  console.error('Error parsing email:', parseErr);
                }
              });
            });
          });

          fetch.once('error', (err) => {
            console.error('Fetch error:', err);
          });

          fetch.once('end', () => {
            imap.end();
            resolve(emails);
          });
        });
      });
    });

    imap.once('error', (err) => {
      reject(err);
    });

    imap.connect();
  });
}

/**
 * Mark specific emails as processed (move to folder or add label)
 */
export async function markAsProcessed(messageIds) {
  return new Promise((resolve, reject) => {
    if (!IMAP_CONFIG.user || !IMAP_CONFIG.password) {
      return reject(new Error('Newsletter email credentials not configured'));
    }

    const imap = new Imap(IMAP_CONFIG);

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err) => {
        if (err) {
          imap.end();
          return reject(err);
        }

        // Add a label or move to processed folder
        // For Gmail, we can add a label
        imap.addFlags(messageIds, ['\\Seen', 'Processed'], (err) => {
          imap.end();
          if (err) return reject(err);
          resolve(true);
        });
      });
    });

    imap.once('error', reject);
    imap.connect();
  });
}

export default {
  fetchUnreadNewsletters,
  markAsProcessed,
  identifySender,
  NEWSLETTER_SENDERS
};
