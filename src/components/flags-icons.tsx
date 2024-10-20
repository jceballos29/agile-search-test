import * as React from 'react'
import { Avatar } from 'antd'
import esFlag from 'src/assets/flags/es.png'
import ptFlag from 'src/assets/flags/pt.png'
import ueFlag from 'src/assets/flags/ue.png'
import worldFlag from 'src/assets/flags/world.png'
import plFlag from 'src/assets/flags/pl.png'
import deFlag from 'src/assets/flags/de.png'
import itFlag from 'src/assets/flags/it.png'
import ukFlag from 'src/assets/flags/uk.png'
import frFlag from 'src/assets/flags/fr.png'
import brFlagSq from 'src/assets/flags/brSq.png'
import brFlag from 'src/core/assets/images/flags/ptBR.png'
import { CountrySummary } from '../stores/country-store'


export function GetCountryFlag(code: string, countries: CountrySummary[]): React.ReactNode {
  var ico = countries.firstOrDefault(t => t.code == code)?.icon;
  if (ico)
    return <Avatar src={countries.firstOrDefault(t => t.code == code).icon} />
  return GetFlag(code, worldFlag)
}

export function ShowCountryFlag(code: string, countries: any): React.ReactNode {
  var ico = countries.firstOrDefault(t => t.code == code)?.icon;
  if (ico)
    return <Avatar src={countries.firstOrDefault(t => t.code == code).icon} />
  return GetFlag(code, worldFlag)
}

export function GetFlag(countryId: string, icon: string): React.ReactNode {
  switch (countryId) {
    case 'Es':
      return <Avatar src={esFlag} />
    case 'Pt':
      return <Avatar src={ptFlag} />
    case 'Eu':
      return <Avatar src={ueFlag} />
    case 'Pl':
      return <Avatar src={plFlag} />
    case 'De':
      return <Avatar src={deFlag} />
    case 'It':
      return <Avatar src={itFlag} />
    case 'Fr':
      return <Avatar src={frFlag} />
    case 'Br':
      return <Avatar src={brFlag} />
    case 'UK':
      return <Avatar src={ukFlag} />
    case 'All':
      return <Avatar src={worldFlag} />
    }
    return icon === undefined || icon === '' ? <Avatar src={worldFlag} /> : <Avatar src={icon} />
}
 
export function GetImageFlag(countryId: string, icon: string): React.ReactNode {
  switch (countryId) {
    case 'Es':
      return <img src={esFlag} />
    case 'Pt':
      return <img src={ptFlag} />
    case 'Eu':
      return <img src={ueFlag} />
    case 'Pl':
      return <img src={plFlag} />
    case 'De':
      return <img src={deFlag} />
    case 'It':
      return <img src={itFlag} />
    case 'Fr':
      return <img src={frFlag} />
    case 'Br':
      return <img src={brFlagSq} />
    case 'All':
      return <img src={worldFlag} />
    case 'In':
      return <img src={worldFlag} />
  }
  return <img src={icon} />
}
