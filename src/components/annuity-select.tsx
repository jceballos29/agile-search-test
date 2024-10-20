import { Select } from 'antd'
import { FC, useEffect, useState } from 'react'
import { AnnuityStore } from 'src/stores/annuity-store'
import { container } from 'src/inversify.config'
import { WithTranslation, withTranslation } from 'react-i18next'
import { UserProfileProps, withUserProfile } from './user-profile'

interface Props extends WithTranslation, UserProfileProps {
    placeholder?: string
    onChange?: (value: { value: string; label: string }[]) => void
    value?: { value: string; label: string }[]
    nullable?: boolean
    minWidth?: number
    mode?: 'multiple' | 'tags'
    width?: number
    labelInValue: boolean
    maxTagCount?: number
}

const AnnuitySelect: FC<Props> = ({ placeholder, value, onChange, nullable, t, minWidth, mode, labelInValue, width, userProfile, maxTagCount }) => {
    const currentStore = container.get<AnnuityStore>(AnnuityStore)
    const currentState = currentStore.state
    const [currentValue, setCurrentValue] = useState(value)

    useEffect(() => {
        setCurrentValue(value)
    }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

    const onSelect = (nextValue: { value: string; label: string }[]) => {
        setCurrentValue(nextValue)
        onChange && onChange(nextValue)
    }

    return (
        <Select
            labelInValue={labelInValue}
            loading={!!currentState.isBusy.get()}
            placeholder={placeholder ?? t('Select Annuity')}
            onChange={onSelect}
            allowClear={nullable}
            showSearch
            value={currentValue}
            mode={mode}
            filterOption={false}
            style={{ width: width ? width : '100%', minWidth: minWidth ? minWidth : '0px' }}
            maxTagCount={maxTagCount ?? undefined}
        >
            {userProfile.annuities.map((o) => (
                <Select.Option key={o.id} value={o.id}>
                    {o.name}
                </Select.Option>
            ))}

        </Select>
    )
}

export default withTranslation()(withUserProfile(AnnuitySelect))
