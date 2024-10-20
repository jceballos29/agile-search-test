import React from 'react';
import HttpService from 'src/core/services/http.service';
import { container } from 'src/inversify.config';
import FileSaver from 'file-saver';
import { GrantFile, GrantItem } from 'src/stores/grant-store';

export const cutNumber = (n: number, size: any) => {
  if (size.width > 2400 / 2) return 100 * n;
  if (size.width > 2000 / 2) return 80 * n;
  if (size.width > 1850 / 2) return 70 * n;
  if (size.width > 1600 / 2) return 60 * n;
  if (size.width > 1450 / 2) return 40 * n;
  if (size.width > 1200 / 2) return 20 * n;
  return 10 * n;
};

export const convertNewDate = (date) => {
  if (!date) return '-';
  let _date = (date).toString().split("-")
  let _year = _date[0]
  let _month = _date[1]
  let _day = _date[2].substring(0, 2)
  return `${_day}-${_month}-${_year}`
}

export const formatBudget = (x: number) => {
  return `${x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €`;
}

export const defineCategory = (value) => {
  if (value == "A") return 'Very important call'
  if (value == "B") return 'Important call'
  if (value == "C") return 'Reactive call'
  if (value == "D") return 'Call not for companies'
  if (value == "E") return "FI doesn't work this call"
}

export const defineParticipation = (value: string) => {
  if (value == "Individual") return 'Individual'
  if (value == "Consorciada") return 'Collaborative'
  if (value == "Individual y Consorciada") return 'Individual and Collaborative'
}

export const verifyPptMain = (value: string) => {
  value = value.toLowerCase()
  if (value.includes(".pptx") && value.includes("summary")) return true
  else return false
}

export const getTranslations = (grant: GrantItem, key: string, value: string) => {
  if (grant.translations && grant.translations[key]) {
    return grant.translations[key]
  }
  return value
}


export const onDownloadRequest = async (grantFile: GrantFile) => {
  const result = await container.get(HttpService).get(`api/v1/grantFiles/download/` + grantFile.id, {
    responseType: 'arraybuffer',
  });
  const blob = new Blob([result.data as any], { type: result.headers['content-type'] });
  (FileSaver as any).saveAs(blob, `${grantFile.fileName}`);
};

export function putLengthLimitToText(text: string, limit: number) {
  if(text != null && limit != null)
      return `${text.slice(0, limit) + (text.length > limit ? "..." : "")}` ;

  return "";
}