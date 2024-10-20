import React, { FC, useEffect, useState } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Select } from 'antd';
import debounce from 'lodash/debounce';
import { GetCountryFlag } from './flags-icons';
import { UserProfileProps, withUserProfile } from './user-profile';

const LocationSelect: FC<
    {
        onChange?: (value: { value: string; label: string }[]) => void;
        value?: { value: string; label: string }[];
        placeholder?: string;
        countries?: { value: string; label: string }[];
        fullLoad: boolean;
        width?: number;
        minWidth?: number;
        maxTagCount?: number;
    } & WithTranslation & UserProfileProps
> = ({ t, onChange, value, countries, placeholder, fullLoad, userProfile, width, minWidth, maxTagCount }) => {
    const [currentValue, setValue] = useState(value);
    const [locations, setLocations] = useState(userProfile.locations);
    const [currentLocationByCountry, setCurrentLocationByCountry] = useState(userProfile.locations);


    useEffect(() => {
        setValue(value);
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (countries === undefined || countries.length === 0) {
            if (!userProfile.fullViewer) {
                if (userProfile.isAdminCountry) {
                    setLocations(userProfile.locations.filter(l => userProfile.adminAllowedCountries.includes(l.countryCode)));
                }
                else {
                    setLocations(userProfile.locations.filter(l => userProfile.viewerAllowedCountries.includes(l.countryCode)));
                }
            }
            else {
                setLocations(userProfile.locations);
                setCurrentLocationByCountry(userProfile.locations);
            }
        } else {
            let locations = []
            countries.forEach(i => locations = locations.concat(userProfile.locations.filter(l => l.countryCode?.toLowerCase() === i.value?.toLowerCase())))
            setLocations(locations);
            setCurrentLocationByCountry(locations);
        }
    }, [countries]); // eslint-disable-line react-hooks/exhaustive-deps

    const onSearch = debounce((value: string) => {
        setLocations(currentLocationByCountry.filter(l => l.name.toLowerCase().includes(value.toLowerCase())));
    }, 800);

    const onSelect = (nextValue: { value: string; label: string }[]) => {
        setLocations(currentLocationByCountry);
        setValue(nextValue);
        onChange && onChange(nextValue);
    };

    const sortedOptions = locations.sort((a, b) => {
        if (a.country === b.country) {
            return a.name.localeCompare(b.name);
        } else {
            return a.country.localeCompare(b.country);
        }
    });

    return (
        <Select
            className={'location-select'}
            labelInValue
            onChange={onSelect}
            style={{ width: width || '100%', minWidth: minWidth || "" }}
            allowClear
            placeholder={placeholder ?? t('Select Region')}
            showSearch
            value={currentValue}
            filterOption={false}
            showArrow={false}
            onSearch={onSearch}
            mode={'multiple'}
            maxTagCount={maxTagCount ?? undefined}
        >
            {sortedOptions.map((o) => (
                <Select.Option key={o.id} value={o.id}>
                    <span style={{ marginRight: 10 }}>{GetCountryFlag(o.countryCode, userProfile.countries)}</span> {t(o.name)}
                </Select.Option>
            ))}
        </Select>
    );
};

export default withTranslation()(withUserProfile(LocationSelect))
