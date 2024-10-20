import * as React from 'react';
import { Menu, Row, Col, Layout } from 'antd';
import { withRouter, RouteComponentProps } from "react-router-dom";
import { WithTranslation, withTranslation } from 'react-i18next';
import HttpService from '../services/http.service';
import i18next from 'i18next';
const { Content, Footer } = Layout



interface FooterProps extends WithTranslation, RouteComponentProps {
    footerLogo?: any
}

class FooterView extends React.Component<FooterProps> {
    public render() {
        const { t } = this.props       

        return <Footer>
            <div className={"fi-footer-logo"}><img src={this.props.footerLogo} height={50} /></div>
            <div className={"footer-text"}>
              {t("Copyright")} {new Date().getFullYear()} {t("FI Group all rights reserved")} - <a href={this.getTermAndConditionLink()} target="_blanck">{t("Terms of Use")}</a> -<a href={this.getDataLink()} target="_blanck">{t("Data Subject Right")}</a>  - <a href={this.getCookiePolicyLink()} target="_blank">{t("Cookies Policy")}</a>
            </div>
        </Footer>
    }
  getDataLink(): string | undefined {    
    switch (i18next.language) {
            case "es":
                return "https://es.fi-group.com/politica-de-privacidad/"
            case "en":
                return "https://uk.fi-group.com/data-subject-right/"
            case "pt":
                return "https://pt.fi-group.com/direito-sobre-dados-pessoais/"
            case "fr":
                return "https://fr.fi-group.com/demarche-donnees-personnelles/"
            case "it":
                return "https://it.fi-group.com/diritto-individuale-ai-sensi-del-regolamento-generale-sulla-protezione-dei-dati/"
            case "de":
                return "https://de.fi-group.com/data-subject-right/"


        }
        return "https://es.fi-group.com/politica-de-privacidad/"
    }
    getCookiePolicyLink(): string | undefined {
      switch (i18next.language) {
            case "es":
                return "https://es.fi-group.com/politica-de-cookies/"
            case "en":
                return "https://uk.fi-group.com/fi-group-uk-referral-campaign/"
            case "pt":
                return "https://pt.fi-group.com/politica-de-privacidade/"
            case "fr":
                return "https://fr.fi-group.com/politique-de-confidentialite-relative-au-site-fi-group/"
            case "it":
                return "https://it.fi-group.com/cookie-policy/"
            case "de":
                return "https://de.fi-group.com/cookie-declaration/"


        }
        return "https://es.fi-group.com/politica-de-cookies/"
    }
  
    getTermAndConditionLink(): string | undefined {
      switch (i18next.language) {
            case "es":
                return "https://es.fi-group.com/terminos-y-condiciones/"
            case "en":
                return "https://uk.fi-group.com/term-of-use/"
            case "pt":
                return "https://es.fi-group.com/terminos-y-condiciones/"
            case "fr":
                return "https://fr.fi-group.com/mentions-legales/"
            case "it":
                return "https://it.fi-group.com/menzioni-legali/"
            case "de":
                return "https://de.fi-group.com/term-of-use/"


        }
        return "https://es.fi-group.com/terminos-y-condiciones/"
    }
}
export default withRouter(withTranslation()(FooterView))