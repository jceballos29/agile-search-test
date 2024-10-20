import { WithTranslation, withTranslation } from "react-i18next";
import { UserProfileProps, withUserProfile } from "./user-profile";
import { FC, useEffect, useRef, useState } from "react";
import { Select } from "antd";
import i18n from "src/i18n";
import { debounce } from "lodash";

interface AreaSelectProps extends WithTranslation, UserProfileProps  {
    placeholder?: string
    onChange?: (value: string) => void
    value?: string | null
    nullable?: boolean
    minWidth?: number
    width?: number
    tagMode?: boolean | false
    size?: "small" | "middle" | "large"
    mode?: 'multiple' | 'tags'
    defaultValue?: any
}

const AreaSelect : FC<AreaSelectProps> = ({placeholder, nullable, onChange, minWidth, tagMode, size, t, width, userProfile, mode, value, defaultValue}) => {
    const [currentValue, setCurrentValue] = useState(value);
    const [currentOptions, setCurrentOptions] = useState<string[] | undefined>();
    const [options, setOptions] = useState<string[]>();
    const inputRef = useRef<any>();

    const loadOptions = async () => {
        var orderOptions = userProfile.areas;
        setCurrentOptions(orderOptions);
        setOptions(userProfile.areas);
    }

    const changeOptionsOrder = (options: string[]) => {
        if (options) {
          return options;
        }
        return undefined;
    }

    const onSelect = (nextValue: string) => {
        setCurrentValue(nextValue)
        onChange && onChange(nextValue)
        setCurrentOptions(options)
    }
    
    const onSearch = debounce((value: string) => {
        var result = [];
        options.forEach(x => {
          if (t(x).toLowerCase().includes(value.toLowerCase())) {
            result.push(x)
          }
        })
        setCurrentOptions(result)
    }, 800)

    useEffect(() => {
        loadOptions();
    }, [inputRef])

    useEffect(() => {
        setCurrentOptions((options) => changeOptionsOrder(options))
    }, [i18n.language])

    useEffect(() => {
        setCurrentValue(value)
    }, [value]) // eslint-disable-line react-hooks/exhaustive-deps  

    return(
        <Select
            className={'area-select'}
            placeholder={placeholder ?? t('Select Area')}
            onChange={onSelect}
            allowClear={nullable}
            showSearch
            value={currentValue ?? undefined}
            onSearch={onSearch}
            filterOption={false}
            size={size}
            mode={mode}
            style={{ width: width ? width : '100%', minWidth: minWidth ? minWidth : '0px' }}
            defaultValue={defaultValue}
        >
        {currentOptions?.map((area) => (
            <Select.Option key={area} value={area}>
                <span style={{ marginRight: 10 }}>{t(area)}</span>
            </Select.Option>
        ))}
    </Select>
    )
}

export default withTranslation()(withUserProfile(AreaSelect));