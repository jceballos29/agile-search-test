import * as React from 'react'
import { withIdentity, IdentityProps } from "../services/authentication"
import { Avatar, Menu } from 'antd'
import { withTranslation, WithTranslation } from 'react-i18next'
import { container } from 'src/inversify.config'
import { PreferencesService } from 'src/core/services/preferences.service'
import moment from 'moment'
import i18next from 'i18next'
import { NavItem } from './shell-header'
import HttpService from "../services/http.service"
import esFlag from '../assets/images/flags/es.png'
import enFlag from '../assets/images/flags/uk.png'
import frFlag from '../assets/images/flags/fr.png'
import ptFlag from '../assets/images/flags/pt.png'
import itFlag from '../assets/images/flags/it.png'
import brFlag from '../assets/images/flags/ptBR.png'
import geFlag from '../assets/images/flags/ge.png'
import languageIcon from '../assets/images/language.png'
import { GlobalOutlined } from '@ant-design/icons'

const MenuItem = Menu.Item

interface LanguageBoxProps extends WithTranslation, IdentityProps {
  isMobileOrTablet?: boolean
  availableLanguages?: string[]
  showFlag?: boolean
}

interface LanguageBoxState {
  language: string
  languages: { key: string, value: string, flag: any }[]
}

class LanguageBox extends React.Component<LanguageBoxProps, LanguageBoxState> {
  private readonly preferencesService: PreferencesService

  constructor(props: LanguageBoxProps) {
    super(props)
    const languages = [] as any[]
    if (props.availableLanguages == null || props.availableLanguages.length == 0 || props.availableLanguages.filter(o => o == 'en').length)
      languages.push({ key: 'en', value: 'English', flag: enFlag })
    if (props.availableLanguages == null || props.availableLanguages.length == 0 || props.availableLanguages.filter(o => o == 'es').length)
      languages.push({ key: 'es', value: 'Spanish', flag: esFlag })
    if (props.availableLanguages == null || props.availableLanguages.length == 0 || props.availableLanguages.filter(o => o == 'fr').length)
      languages.push({ key: 'fr', value: 'French', flag: frFlag })
    if (props.availableLanguages != null && (props.availableLanguages.length == 0 || props.availableLanguages.filter(o => o == 'it').length))
     languages.push({ key: 'it', value: 'Italian', flag: itFlag })
    if (props.availableLanguages == null || props.availableLanguages.length == 0 || props.availableLanguages.filter(o => o == 'pt').length)
      languages.push({ key: 'pt', value: 'Portuguese', flag: ptFlag })
    if (props.availableLanguages == null || props.availableLanguages.length == 0 || props.availableLanguages.filter(o => o == 'pt-br').length)
      languages.push({ key: 'pt-br', value: 'Portuguese', flag: brFlag })
    if (props.availableLanguages != null && (props.availableLanguages.length == 0 || props.availableLanguages.filter(o => o == 'de').length))
     languages.push({ key: 'de', value: 'German', flag: geFlag })

    this.state = {
      language: 'en',
      languages: languages
    }
    this.onChangeLanguage = this.onChangeLanguage.bind(this)
    this.getBrowserLanguage = this.getBrowserLanguage.bind(this)
    this.configureLanguage = this.configureLanguage.bind(this)
    this.preferencesService = container.get(PreferencesService)
  }

  UNSAFE_componentWillMount() {
    if (this.preferencesService) {
      this.preferencesService.current().then(prefs => {
        if (prefs && prefs.currentLanguage) {
          this.configureLanguage(prefs.currentLanguage)
        } else {
          this.configureLanguage(this.getBrowserLanguage())
        }
      }).catch(error => {
        this.configureLanguage(this.getBrowserLanguage())
      })
    }
  }

  private getBrowserLanguage() {
    var supportedLangs = this.state.languages.map(o => o.key)
    var language: string = window.navigator.language || (window.navigator as any).userLanguage || supportedLangs[0]
    supportedLangs.forEach(lang => {
      if (language && language == lang || language.startsWith(lang))
        language = lang
    })
    return language || supportedLangs[0]
  }

  private configureLanguage(language: string) {
    moment.locale(language)
    i18next.changeLanguage(language)
    this.setState({ language: language })
    HttpService.language = language
  }

  private onChangeLanguage(value: any) {

    this.preferencesService.setCurrentLanguage(value.key)
    this.configureLanguage(value.key)
    HttpService.language = value.key
  }

  public render() {
    const { t } = this.props

    if (!this.state.language)
      return <div></div>

    var currentLanguages = this.state.languages.filter(o => o.key == this.state.language)
    if (currentLanguages.length == 0)
      currentLanguages = this.state.languages
    var currentLanguage = currentLanguages[0]
    return <NavItem className="language-image" key={"languageBox"} title={t("Language")}
      icon={this.props.showFlag ? <Avatar size={this.props.isMobileOrTablet ? "small" : "default"} shape="square" src={currentLanguage.flag} /> :
        <GlobalOutlined style={{
          fontSize: '35px',
          marginTop: '12px',
          marginLeft: '4px',
          marginRight: '4px',
          color: '#0000A9',
          width: '35px',
          background: 'white',
        }} />
      }
      subMenu={<Menu onClick={this.onChangeLanguage}>
        {this.state.languages.map(lang => <MenuItem key={lang.key}>
          <Avatar size="default" shape="square" src={lang.flag} />
          <span style={{ marginLeft: 20 }}>{t(lang.value)}</span>
        </MenuItem>
        )}
      </Menu>}>
    </NavItem>

  }
}
export default withTranslation()(withIdentity(LanguageBox))