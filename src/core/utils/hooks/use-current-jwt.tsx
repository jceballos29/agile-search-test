import { useState, useEffect } from 'react';
import HttpService from '../../services/http.service';

export const useCurrentJwt = (ms: number = 5000): string => {
  const [value, setValue] = useState(HttpService.accessToken);
  const _ms = Math.max(5000, ms);
  useEffect(() => {
    const timerId = setInterval(() => {
      if (HttpService.accessToken !== value) setValue(HttpService.accessToken);
    }, _ms);
    return () => clearInterval(timerId);
  }, []);
  return value;
};
