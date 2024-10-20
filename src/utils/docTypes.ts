export function getFileTypes(t: any, includeOther: boolean) {
    return [
        { key: 'Summary', label: t('Summary'), documentTypes: ['Resumen', t('Resumen', { lng: 'en' })] },
        { key: 'Presentation', label: t('Presentations'), documentTypes: ['Presentaciones', t('Presentaciones', { lng: 'en' })] },
        { key: 'Justification', label: t('Justification Templates'), documentTypes: ['Plantillas justificaci\u00F3n', t('Plantillas justificaci\u00F3n', { lng: 'en' }), 'Plantillas justificación', t('Plantillas justificación', { lng: 'en' }), 'Plantillas justificacion', t('Plantillas justificacion', { lng: 'en' })] },
        { key: 'Request', label: t('Request templates'), documentTypes: ['Plantillas solicitud', t('Plantillas solicitud', { lng: 'en' }), 'Solicitud Plantillas', t('Solicitud Plantillas', { lng: 'en' }), 'Request templates', t('Request templates', { lng: 'en' })] },
        { key: 'Faqs', label: t("FAQ's"), documentTypes: ['FAQs', t('FAQs', { lng: 'en' }), "FAQ's", t("FAQ's", { lng: 'en' })] },
        { key: 'Call', label: t('Call'), documentTypes: ['Convocatoria', t('Convocatoria', { lng: 'en' })] },
        { key: 'RegulatoryBase', label: t('Regulatory bases'), documentTypes: ['Bases reguladoras', t('Bases reguladoras', { lng: 'en' })] },
        { key: 'Modification', label: t('Modifications'), documentTypes: ['Modificaciones', t('Modificaciones', { lng: 'en' })] },
        { key: 'Resolution', label: t('Resolutions'), documentTypes: ['Resoluciones', t('Resoluciones', { lng: 'en' })] },
        ...(includeOther ? [{ key: 'Other', label: t('Other Documents'), documentTypes: ['Resumen', t('Resumen', { lng: 'en' }), 'Presentaciones', t('Presentaciones', { lng: 'en' }), 'Plantillas justificación', t('Plantillas justificación', { lng: 'en' }), 'Plantillas justificacion', t('Plantillas justificacion', { lng: 'en' }), 'Plantillas solicitud', t('Plantillas solicitud', { lng: 'en' }), 'Solicitud Plantillas', t('Solicitud Plantillas', { lng: 'en' }), 'Request templates', t('Request templates', { lng: 'en' }), 'FAQs', t('FAQs', { lng: 'en' }), "FAQ's", t("FAQ's", { lng: 'en' }), 'Convocatoria', t('Convocatoria', { lng: 'en' }), 'Bases reguladoras', t('Bases reguladoras', { lng: 'en' }), 'Modificaciones', t('Modificaciones', { lng: 'en' }), 'Resoluciones', t('Resoluciones', { lng: 'en' })] },] : [])
    ];
}