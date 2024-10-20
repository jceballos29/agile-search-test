import i18next from 'i18next';
import lang from './i18n.generated.json';

i18next.init({
    lng: 'en',
    // we init with resources
    resources: {
        en: {
            translations: lang.data.en,
        },
        es: {
            translations: lang.data.es,
        },
        fr: {
            translations: lang.data.fr,
        },
        pt: {
            translations: lang.data.pt,
        },
        it: {
            translations: lang.data.it,
        },
    },
    fallbackLng: lang.source,
    debug: false,

    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',

    keySeparator: false, // we use content as keys

    interpolation: {
        escapeValue: false, // not needed for react!!
        formatSeparator: ',',
    },

    react: {
        wait: true,
    },
});

export default i18next;
