export interface Period {
    id: number;
    openningDate: string;
    closingDate: string;
}

export interface Item {
    publicationDate: string;
    published: boolean;
    isFavorite: boolean;
    beneficiaryTypesId: number[];
    sectors: number[];
    typologies: number[];
    locations: number[];
    annuities: number[];
    category: string;
    periods: Period[];
    modalityParticipation?: string;
    financingModality: string[];
    financingModalityValue?: number;
    scope: string;
    id: number;
    countryId: string;
    status: string;
    title: string;
    description: string;
}

export interface Response {
    count: number;
    items: Item[];
}

export const response = {
  count: 3759,
  items: [
    {
      publicationDate: '2024-01-10T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        3,
        4,
        10,
        11,
        12,
      ],
      sectors: [
        27,
      ],
      typologies: [
        15,
        18,
      ],
      locations: [
        28665,
      ],
      annuities: [
        45,
        46,
      ],
      category: 'A',
      periods: [
        {
          id: 394332,
          openningDate: '2023-10-30T12:00:00+00:00',
          closingDate: '2024-12-30T12:00:00+00:00',
        },
      ],
      financingModality: [],
      scope: 'Support innovative hydrogen projects that help shape the federal hydrogen strategy',
      id: 133995,
      countryId: 'BE',
      status: 'Open',
      title: 'Clean Hydrogen for Clean Industry',
      description: 'With the "Clean Hydrogen for Clean Industry" project call, the federal government aims to support innovative hydrogen projects that help shape the federal hydrogen strategy. This call aims to promote research into, development and demonstration of technologies and infrastructure for the production and use of hydrogen and hydrogen derivatives with a particular focus on projects that are in the practical development phase, as long as the projects fall within federal competences and respect the principles of "do no significant harm."\n',
    },
    {
      publicationDate: '2024-01-10T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        3,
        4,
        10,
        11,
        12,
      ],
      sectors: [
        27,
      ],
      typologies: [
        12,
      ],
      locations: [],
      annuities: [
        45,
        46,
        47,
      ],
      category: 'A',
      periods: [],
      modalityParticipation: 'Individual',
      financingModality: [
        'Subsidy',
      ],
      financingModalityValue: 1,
      scope: 'To help Singapore companies develop innovative technology and products with the end goal of commercialisation, including sustainable products, services, and solutions.\n',
      id: 133987,
      countryId: 'SGP',
      status: 'Open',
      title: 'Enterprise Development Grant – Innovation and Productivity ',
      description: 'EDG covers the following areas: Assessment of market viability; Development of product roadmap and proposed functionalities for the product; Demonstration of market validation; Development of commercialisation plan; Review of IP considerations, such as IP/Trade Secrets protection, IP strategy, and Freedom to Operate analysis; Development of prototype and small batch production\n',
    },
    {
      publicationDate: '2023-12-04T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        3,
        4,
        10,
        11,
        12,
      ],
      sectors: [
        27,
      ],
      typologies: [
        11,
        16,
        18,
      ],
      locations: [
        8,
      ],
      annuities: [
        45,
        46,
      ],
      category: 'A',
      periods: [
        {
          id: 394718,
          openningDate: '2023-12-04T12:00:00+00:00',
          closingDate: '2024-12-31T12:00:00+00:00',
        },
      ],
      modalityParticipation: 'Individual',
      financingModality: [
        'Partially Refundable',
      ],
      financingModalityValue: 4,
      scope: 'Los proyectos de I+D vinculados a los PERTES Aeroespacial y de Salud de Vanguardia son proyectos de investigación y desarrollo empresarial de carácter aplicado para la creación o mejora significativa de un proceso productivo, producto o servicio. Los proyectos deben demostrar un aspecto tecnológico diferencial sobre las tecnologías existentes en el mercado. Los proyectos de I+D pueden comprender tanto actividades de investigación industrial como de desarrollo experimental. Los proyectos de I+D son presentados por una única empresa.',
      id: 133840,
      countryId: 'Es',
      status: 'Open',
      title: 'Proyectos de I+D vinculados a los Pertes Aeroespacial y de Salud de Vanguardia',
      description: 'Los proyectos de I+D son de carácter aplicado para la creación o mejora significativa de un proceso productivo, producto o servicio. Pueden comprender tanto actividades de investigación industrial como de desarrollo experimental.',
    },
    {
      publicationDate: '2023-12-04T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        2,
        3,
        4,
        8,
        10,
        11,
        12,
      ],
      sectors: [
        27,
      ],
      typologies: [
        11,
        12,
        15,
        16,
        17,
      ],
      locations: [
        8,
      ],
      annuities: [
        45,
        46,
      ],
      category: 'A',
      periods: [
        {
          id: 394720,
          openningDate: '2023-12-04T12:00:00+00:00',
          closingDate: '2024-12-31T12:00:00+00:00',
        },
      ],
      modalityParticipation: 'Individual',
      financingModality: [
        'Partially Refundable',
      ],
      financingModalityValue: 4,
      scope: 'Potenciar la innovación en determinadas regiones españolas, a través de la mejora de capacidades de empresas que propongan proyectos de inversión innovadores que faciliten su crecimiento',
      id: 133839,
      countryId: 'Es',
      status: 'Open',
      title: 'Proyectos de Innovación Aeroespacial y Salud - CDTI',
      description: 'Proyectos individuales de Innovación vinculados a la Adenda y a los PERTE Aeroespacial y de Salud de Vanguardia.',
    },
    {
      publicationDate: '2023-11-17T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        3,
        4,
        5,
        6,
        8,
        9,
        10,
        11,
        12,
      ],
      sectors: [
        27,
      ],
      typologies: [
        10,
        18,
      ],
      locations: [
        28654,
      ],
      annuities: [
        45,
      ],
      category: 'A',
      periods: [],
      modalityParticipation: 'Individual y Consorciada',
      financingModality: [],
      scope: 'Within this call for projects, we are looking for projects that focus on accelerating the increase of renewable energy in Flanders. The main focus is on innovative pilot and demonstration projects. We mainly focus on investment projects.',
      id: 133782,
      countryId: 'BE',
      status: 'Open',
      title: 'EFRO - Hernieuwbare Energie',
      description: '',
    },
    {
      publicationDate: '2023-11-13T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        2,
        3,
        4,
        8,
        10,
        11,
        12,
      ],
      sectors: [
        27,
      ],
      typologies: [
        10,
        12,
      ],
      locations: [
        8,
      ],
      annuities: [
        45,
        46,
      ],
      category: 'A',
      periods: [
        {
          id: 394706,
          openningDate: '2024-01-01T12:00:00+00:00',
          closingDate: '2024-12-31T12:00:00+00:00',
        },
      ],
      modalityParticipation: 'Individual',
      financingModality: [
        'Partially Refundable',
      ],
      financingModalityValue: 4,
      scope: 'Los proyectos asociados a esta tipología contendrán actividades de investigación industrial o de desarrollo experimental para mejorar la gestión sostenible de los recursos de la pesca y desarrollar conocimientos técnicos y/o científicos en las explotaciones acuícolas',
      id: 133824,
      countryId: 'Es',
      status: 'Open',
      title: 'Proyectos de innovación del sector pesquero y acuicultura. FEMPA - CDTI',
      description: 'Proyectos de Innovación FEMPA',
    },
    {
      publicationDate: '2023-11-13T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        2,
        3,
        4,
        8,
        10,
        11,
        12,
      ],
      sectors: [
        27,
      ],
      typologies: [
        10,
        15,
      ],
      locations: [
        8,
      ],
      annuities: [
        45,
        46,
      ],
      category: 'A',
      periods: [
        {
          id: 394710,
          openningDate: '2024-01-01T12:00:00+00:00',
          closingDate: '2024-12-31T12:00:00+00:00',
        },
      ],
      modalityParticipation: 'Individual',
      financingModality: [
        'Partially Refundable',
      ],
      financingModalityValue: 4,
      scope: 'Financiación de proyectos de inversión en actividades de transformación y comercialización de los productos de la pesca y de la acuicultura',
      id: 133834,
      countryId: 'Es',
      status: 'Open',
      title: 'Proyectos de inversión en actividades de transformación y comercialización de los productos de la pesca y de la acuicultura (LIF) - FEMPA CDTI',
      description: 'Proyectos de Inversión FEMPA - CDTI',
    },
    {
      publicationDate: '2023-09-18T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        3,
        4,
        6,
        11,
        12,
      ],
      sectors: [],
      typologies: [
        15,
        18,
      ],
      locations: [
        25681,
        25682,
        25686,
        25687,
        25688,
        25691,
        25692,
        25695,
      ],
      annuities: [
        45,
      ],
      category: 'A',
      periods: [],
      modalityParticipation: 'Individual y Consorciada',
      financingModality: [],
      scope: 'il fondo mira a   sostenere   la    valorizzazione    economica e l\'innovazione  attraverso  la  sperimentazione  e  l\'adozione   di soluzioni innovative e tecnologicamente avanzate e di accelerare,  al contempo, la ricerca collaborativa e il processo di scoperta dinamica e imprenditoriale di nuovi domini di  specializzazione',
      id: 133540,
      countryId: 'It',
      status: 'Open',
      title: 'Fondo per l’innovazione agricola azione  1.1.4.  del  Programma   nazionale   ricerca, innovazione e competitivita\' per  la  transizione  verde  e  digitale 2021-2027',
      description: '',
    },
    {
      publicationDate: '2023-08-30T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [],
      sectors: [],
      typologies: [
        8,
      ],
      locations: [
        28655,
      ],
      annuities: [
        45,
      ],
      category: 'A',
      periods: [],
      financingModality: [],
      scope: 'Improving the thermal comfort of your office and opting for a better heating system will not only reduce your energy consumption, but will also allow you to benefit from the comfort provided to your employees.',
      id: 133468,
      countryId: 'BE',
      status: 'Open',
      title: 'Energy bonuses 2021 : bonuses for companies',
      description: '',
    },
    {
      publicationDate: '2023-08-23T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        3,
        4,
        10,
        11,
      ],
      sectors: [],
      typologies: [
        8,
      ],
      locations: [
        28654,
      ],
      annuities: [
        45,
      ],
      category: 'A',
      periods: [],
      financingModality: [],
      scope: 'The support focuses on companies making investments to make the transition from fossil fuels (such as fuel oil, natural gas and diesel) to electricity or green energy (such as biogas and green or blue hydrogen) (green theme) and/or reduce their overall energy consumption (theme energy efficiency)',
      id: 132936,
      countryId: 'BE',
      status: 'Open',
      title: 'GREEN Investeringssteun',
      description: '',
    },
    {
      publicationDate: '2023-08-21T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        3,
        4,
        10,
        11,
      ],
      sectors: [],
      typologies: [
        12,
      ],
      locations: [
        28654,
      ],
      annuities: [
        45,
      ],
      category: 'A',
      periods: [],
      financingModality: [],
      scope: 'Financial support for the realisation of an innovative innovation, personnel and other costs related to a development project',
      id: 133382,
      countryId: 'BE',
      status: 'Open',
      title: 'Ontwikkelingsproject ',
      description: 'Innovation as a motor for your business? Flanders Innovation & Entrepreneurship (VLAIO) gives enterprises with a development project a helping hand.\n\nDo you have an innovative idea that can lead to a successful business, with still some challenges to overcome in developing this innovation? If yes, you can contact us both for advice and financial aid\n',
    },
    {
      publicationDate: '2023-08-11T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        3,
        4,
        5,
        10,
        11,
      ],
      sectors: [
        27,
      ],
      typologies: [
        10,
      ],
      locations: [
        28654,
      ],
      annuities: [
        45,
      ],
      category: 'A',
      periods: [],
      financingModality: [
        'Partially Refundable',
      ],
      financingModalityValue: 4,
      id: 132939,
      countryId: 'BE',
      status: 'Open',
      title: 'Co-financing for soil remediation ',
      description: 'Private individuals, companies and public authorities can apply to OVAM for a subsidy for the remediation of serious historical pollution. The subsidy rate is 35% or 50%, depending on whether or not the applicant is a company. OVAM grants a beneficiary a maximum of EUR 200,000 co-financing over a period of three years.\n\nThrough its decision of 15 March 2013, the Flemish Government has included the legal conditions for the subsidy in the Flemish Regulations for Soil Remediation and Soil Protection (VLAREBO). Those who meet these conditions can submit an application for co-financing using the form provided for this purpose.',
    },
    {
      publicationDate: '2023-08-01T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        3,
        4,
        10,
        11,
        12,
      ],
      sectors: [],
      typologies: [
        13,
        14,
        15,
        19,
      ],
      locations: [
        9,
      ],
      annuities: [
        45,
      ],
      category: 'A',
      periods: [],
      modalityParticipation: '',
      financingModality: [
        'Subsidy',
      ],
      financingModalityValue: 1,
      scope: 'Financiar los proyectos del Programa Acelerador del Consejo Europeo de Innovación, Horizonte Europa para el fomento de la inversión empresarial en I+D+i que hayan obtenido un Sello de Excelencia.',
      id: 132813,
      countryId: 'Es',
      status: 'Open',
      title: 'Sello de Excelencia EIC Accelerator',
      description: 'ORDEN 2557/2023, de 13 de julio, del Consejero de Educación, Ciencia y Uni\u0002versidades, por la que se declara el importe de los créditos disponibles para fi\u0002nanciar en el año 2023 las obligaciones de contenido económico derivadas de la',
    },
    {
      publicationDate: '2023-06-05T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        2,
      ],
      sectors: [],
      typologies: [
        8,
        10,
      ],
      locations: [
        28690,
      ],
      annuities: [
        45,
      ],
      category: 'A',
      periods: [
        {
          id: 11731,
          openningDate: '2023-04-28T12:00:00+00:00',
          closingDate: '2026-12-31T12:00:00+00:00',
        },
      ],
      financingModality: [],
      id: 132287,
      countryId: 'De',
      status: 'Open',
      title: 'Guideline on Federal Funding for Energy and Resource Efficiency in the economy - funding competition',
      description: 'The aim of this guideline is to increase energy and resource efficiency with a view to the goal of greenhouse gas neutrality in 2045 through investments by industry, to expand the share of renewable energy in the provision of process heat and to support German industry in implementing its decarbonization strategy. The funding is intended to trigger investments in particular in plant and process modernization at the highest possible level of energy efficiency, to promote the efficient use of resources and to accelerate the market penetration of highly efficient technologies so that there is a reduction in energy and resource requirements and the resulting CO2 emissions.\nThe special concerns of SMEs will be taken into account.\nThe directive is expected to trigger around 62,000 measures from 2022 to the end of 2026.\nThese measures are expected to achieve annual savings of 7.5 million metric tons of CO2 and 19 terawatt hours of final energy consumption. The funding program thus makes a concrete contribution both to achieving the climate and energy targets and to the planned reduction in primary energy consumption and implementation of Article 7 of the Energy Efficiency Directive.',
    },
    {
      publicationDate: '2023-04-24T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        3,
        4,
        6,
        9,
        12,
      ],
      sectors: [],
      typologies: [
        5,
        18,
      ],
      locations: [
        8,
      ],
      annuities: [
        45,
        46,
      ],
      category: 'A',
      periods: [
        {
          id: 391618,
          openningDate: '2024-01-01T12:00:00+00:00',
          closingDate: '2024-12-31T12:00:00+00:00',
        },
      ],
      modalityParticipation: 'Individual y Consorciada',
      financingModality: [
        'Partially Refundable',
      ],
      financingModalityValue: 4,
      scope: 'El fortalecimiento de las capacidades de innovación de las PYMEs y empresas de mediana capitalización, mediante la contratación de actividades de I+D a centros generadores de conocimiento o la ejecución de proyectos de I+D en colaboración.',
      id: 133305,
      countryId: 'Es',
      status: 'Open',
      title: 'Proyectos de I+D en las áreas tecnológicas “Cervera”',
      description: 'PROYECTOS DE I+D EN LAS ÁREAS TECNOLÓGICAS “CERVERA” CON PARTICIPACION DE CENTROS TECNOLOGICOS. ',
    },
    {
      publicationDate: '2023-04-20T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        3,
        4,
        10,
        11,
        12,
      ],
      sectors: [
        35,
      ],
      typologies: [
        15,
      ],
      locations: [
        6,
      ],
      annuities: [
        45,
        46,
      ],
      category: 'A',
      periods: [
        {
          id: 393986,
          openningDate: '2023-04-20T12:00:00+00:00',
          closingDate: '2024-12-30T12:00:00+00:00',
        },
      ],
      modalityParticipation: 'Individual',
      financingModality: [
        'Subsidy',
      ],
      financingModalityValue: 1,
      scope: 'Coadyuvar a la consecución de incentivos regionales, para la corrección de desequilibrios económicos interterritoriales.',
      id: 131942,
      countryId: 'Es',
      status: 'Open',
      title: 'Subvenciones complementarias de incentivos regionales',
      description: 'ORDEN EPE/457/2023, de 4 de abril, por la que se establecen las bases reguladoras para la concesión de subvenciones complementarias de incentivos regionales.',
    },
    {
      publicationDate: '2023-03-27T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        2,
        5,
      ],
      sectors: [],
      typologies: [
        8,
        10,
      ],
      locations: [],
      annuities: [
        45,
      ],
      category: 'A',
      periods: [
        {
          id: 11265,
          openningDate: '2023-02-13T12:00:00+00:00',
          closingDate: '2030-12-31T12:00:00+00:00',
        },
      ],
      financingModality: [],
      id: 131743,
      countryId: 'De',
      status: 'Open',
      title: 'Federal funding for efficient buildings - climate-friendly new construction (KFN)',
      description: 'Der Bund gewährt Förderungen zur Verringerung der Umweltwirkungen und zur Erhöhung des Nachhaltigkeitsstandards bei der Schaffung neuen Wohnraums und bei der Errichtung neuer Wohn- und Nichtwohngebäude. Ziel der\nFörderung ist die Reduzierung der Treibhausgasemissionen im Lebenszyklus, die Verringerung des Primärenergiebedarfs in der Betriebsphase und die Erhöhung des Einsatzes erneuerbarer Energien unter Einhaltung von Prinzipien\ndes nachhaltigen Bauens auf Grundlage dieser Richtlinie und nach Maßgabe insbesondere der §§ 23 und 44 der\nBundeshaushaltsordnung (BHO) sowie den dazu erlassenen Verwaltungsvorschriften.\nDie Bundesförderung für effiziente Gebäude – Klimafreundlicher Neubau (KFN) trägt dazu bei, die Treibhausgasemissionen im Gebäudesektor bis 2030 auf 67 Millionen Tonnen CO2-Äquivalente zu mindern und somit sowohl die\nnationalen als auch die europäischen Energie- und Klimaziele bis 2030 zu erreichen. Die jährlichen CO2-ÄquivalenteMinderungsziele für die einzelnen Sektoren ergeben sich aus den zulässigen Jahresemissionsmengen des BundesKlimaschutzgesetzes.',
    },
    {
      publicationDate: '2023-03-14T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        3,
        4,
        10,
        11,
        12,
      ],
      sectors: [
        34,
        41,
      ],
      typologies: [
        12,
        19,
      ],
      locations: [
        28670,
      ],
      annuities: [
        45,
      ],
      category: 'A',
      periods: [
        {
          id: 389383,
          openningDate: '2023-01-11T12:00:00+00:00',
          closingDate: '2023-03-01T12:00:00+00:00',
        },
        {
          id: 389384,
          openningDate: '2023-03-02T12:00:00+00:00',
          closingDate: '2024-07-04T12:00:00+00:00',
        },
        {
          id: 389385,
          openningDate: '2024-07-05T12:00:00+00:00',
          closingDate: '2024-11-14T12:00:00+00:00',
        },
        {
          id: 389386,
          openningDate: '2024-11-15T12:00:00+00:00',
          closingDate: '2025-02-27T12:00:00+00:00',
        },
      ],
      modalityParticipation: 'Individual y Consorciada',
      financingModality: [
        'Subsidy',
        'Loan',
      ],
      financingModalityValue: 3,
      scope: 'Soutenir des projets innovants d’envergure concourant à la création de valeur en France et en Europe en lien avec la 5G et les réseaux télécom',
      id: 131659,
      countryId: 'Fr',
      status: 'Open',
      title: 'Solutions innovantes pour les réseaux du futur 5G/6G - BPI',
      description: '\nProjet individuel ou collaboratif d’innovation portant sur l’un des axes suivants :\nAnticipation des évolutions de la 5G et de l’arrivée de la 6G\nDéveloppement de solutions souveraines pour les réseaux télécoms garantissant un haut niveau de sécurité et de fiabilité \nAmélioration de l’impact environnemental des réseaux télécom\n\nTaux d\'aides: Variable selon la taille de l’entreprise et le type de projet \nRI : PE 70% (*80%) | ME 60% (*75%) | GE/ETI 50% (*65% )\nDE : PE 45% (*60%) | ME 35% (*50%) | GE/ETI 25% (*40% )\n',
    },
    {
      publicationDate: '2023-03-10T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        3,
        4,
        11,
        12,
      ],
      sectors: [
        27,
      ],
      typologies: [
        12,
        15,
        19,
      ],
      locations: [
        28670,
      ],
      annuities: [
        45,
      ],
      category: 'A',
      periods: [
        {
          id: 389440,
          openningDate: '2023-01-12T12:00:00+00:00',
          closingDate: '2026-12-15T12:00:00+00:00',
        },
      ],
      modalityParticipation: 'Individual',
      financingModality: [
        'Subsidy',
        'Loan',
      ],
      financingModalityValue: 3,
      scope: 'Accélérer l’émergence de premières réussites d’industrialisation par des start-ups industrielles, ou PME /ETI innovantes',
      id: 113271,
      countryId: 'Fr',
      status: 'Open',
      title: 'Appel à projets France 2030 : "Première Usine"',
      description: 'Accélérer l’émergence de premières réussites d’industrialisation par des start-ups industrielles, ou PME /ETI innovantes.La date limite de candidature est fixée au 15 décembre 2026. Chaque année, des relevés intermédiaires auront lieu en avril, septembre et décembre.Pour 2023, les dates sont fixées au 4 avril, 12 septembre et 12 décembre.Pour les années 2024, 2025 et 2026, les dates de relèves seront fixées ultérieurement',
    },
    {
      publicationDate: '2023-03-06T12:00:00+00:00',
      published: true,
      isFavorite: false,
      beneficiaryTypesId: [
        1,
        3,
        4,
        10,
        11,
        12,
      ],
      sectors: [],
      typologies: [
        15,
        18,
      ],
      locations: [
        4,
      ],
      annuities: [
        45,
      ],
      category: 'A',
      periods: [
        {
          id: 371303,
          openningDate: '2023-03-07T12:00:00+00:00',
          closingDate: '2024-12-30T12:00:00+00:00',
        },
      ],
      modalityParticipation: 'Individual',
      financingModality: [
        'Loan',
      ],
      financingModalityValue: 2,
      scope: 'Ayudas en forma de bonificación de los intereses de operaciones de préstamo para la financiación de proyectos de inversión y desarrollo industrial para los años 2023-2024.',
      id: 133415,
      countryId: 'Es',
      status: 'Open',
      title: 'Préstamos para la financiación de proyectos de inversión y desarrollo  industrial',
      description: '​RESOLUCIÓN EMT/684/2023, de 15 de febrero, por la que se hace pública la convocatoria para los años 2023 y 2024 de la línea de préstamos en condiciones preferentes para la financiación de proyectos de inversión y desarrollo industrial (ref. BDNS 677833).',
    },
  ],
}