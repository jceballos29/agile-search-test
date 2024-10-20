import { Select } from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { debounce } from 'lodash'
import { GetCountryFlag } from './flags-icons'
import { CountrySummary } from '../stores/country-store'
import { UserProfileProps, withUserProfile } from './user-profile'

interface Props extends WithTranslation, UserProfileProps {
    placeholder?: string
    onChange?: (value: { value: string; label: string }[]) => void
    value?: { value: string; label: string }[]
    nullable?: boolean
    minWidth?: number
    width?: number
    mode?: 'multiple' | 'tags'
    size?: "small" | "middle" | "large",
    additionalOptions?: { code: string; name: string; icon?: string; currency?: string }[],
    labelInValue: boolean,
    maxTagCount?: number
    disabled?: boolean
}

const CountrySelect: FC<Props> = ({ placeholder, value, onChange, nullable, t, minWidth, i18n, width, userProfile, mode, size, additionalOptions, labelInValue, maxTagCount, disabled }) => {
    const [currentValue, setCurrentValue] = useState(value)
    const [currentOptions, setCurrentOptions] = useState<CountrySummary[] | undefined>()
    const [options, setOptions] = useState<CountrySummary[]>()
    const inputRef = useRef<any>()

    const loadOptions = async () => {
        var orderOptions = userProfile.countries
        var additionalCountrySummaries = additionalOptions?.map(option => ({
            code: option.code,
            name: option.name,
            icon: option.icon,
            currency: option.currency
        })) || []
        orderOptions = [...additionalCountrySummaries, ...orderOptions]
        orderOptions = Array.from(orderOptions.orderBy((o) => t(o.name)) as any) as CountrySummary[]
        await setCurrentOptions([...orderOptions])
        await setOptions(orderOptions)
    }

    const changeOptionsOrder = (options: CountrySummary[]) => {
        if (options) {
            var orderOptions = options.map(a => { return { ...a } })
            orderOptions = Array.from(orderOptions.orderBy((o) => t(o.name)) as any) as CountrySummary[]
            return orderOptions
        }
        return undefined
    }

    useEffect(() => {
        loadOptions()
    }, [inputRef]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setCurrentOptions((options: CountrySummary[]) => changeOptionsOrder(options))
    }, [i18n.language]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setCurrentValue(value)
    }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

    const onSelect = (nextValue: { value: string; label: string }[]) => {
        setCurrentValue(nextValue)
        onChange && onChange(nextValue)
        setCurrentOptions(options)
    }

    const onSearch = debounce((value: string) => {
        var result = []
        options.forEach(x => {
            if (t(x.name).toLowerCase().includes(value.toLowerCase())) {
                result.push(x)
            }
        })
        setCurrentOptions(result)
    }, 800)

    return (
        <Select
            labelInValue={labelInValue}
            className={'country-select'}
            placeholder={placeholder ?? t('Select Country')}
            onChange={onSelect}
            allowClear={nullable}
            showSearch
            value={currentValue ?? undefined}
            onSearch={onSearch}
            filterOption={false}
            size={size}
            mode={mode}
            disabled={ disabled }
            style={{ width: width ? width : '100%', minWidth: minWidth ? minWidth : '0px' }}
            maxTagCount={maxTagCount ?? undefined}
        >
            {currentOptions?.map((o) => (
                <Select.Option key={o.code} value={o.code}>
                    <span style={{ marginRight: 10 }}>{GetCountryFlag(o.code, userProfile.countries)}</span> {t(o.name)}
                </Select.Option>
            ))}
        </Select>
    )
}

export default withTranslation()(withUserProfile(CountrySelect))
