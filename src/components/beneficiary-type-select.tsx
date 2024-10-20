import { FC, useEffect, useState, useRef } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { Select } from 'antd'
import debounce from 'lodash/debounce'
import { BeneficiaryTypeSummary } from 'src/stores/beneficiary-type-store'
import { UserProfileProps, withUserProfile } from './user-profile'

const BeneficiaryTypeSelect: FC<
  {
    clear?: number
    mode?: 'multiple' | 'tags'
    placeholder?: string
    onChange?: (value: { value: string; label: string }[]) => void
    value?: { value: string; label: string }[]
    defaultValue?: { value: string; label: string }[]
  } & WithTranslation & UserProfileProps
> = ({ t, onChange, value, placeholder, mode, i18n, userProfile }) => {

  const [currentValue, setCurrentValue] = useState(value)
  const [options, setOptions] = useState<BeneficiaryTypeSummary[]>()
  const [currentOptions, setCurrentOptions] = useState<BeneficiaryTypeSummary[] | undefined>()
  const inputRef = useRef<any>()

  const loadOptions = async () => {
    var orderOptions = userProfile.beneficiaryTypes.map(a => { return { ...a } })
    orderOptions = Array.from(orderOptions.orderBy((o) => t(o.name)) as any) as BeneficiaryTypeSummary[]
    await setCurrentOptions(orderOptions)
    await setOptions(userProfile.beneficiaryTypes)
  }

  useEffect(() => {
    loadOptions()
  }, [inputRef]
  )

  useEffect(() => {

    setCurrentOptions((options: BeneficiaryTypeSummary[]) => changeOptionsOrder(options))

  }, [i18n.language])

  useEffect(() => {
    setCurrentValue(value)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps  

  const changeOptionsOrder = (options: BeneficiaryTypeSummary[]) => {
    if (options) {
      var orderOptions = options.map(a => { return { ...a } })
      orderOptions = Array.from(orderOptions.orderBy((o) => t(o.name)) as any) as BeneficiaryTypeSummary[]
      return orderOptions
    }
    return undefined
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

  const onSelect = (nextValue: { value: string; label: string }[]) => {
    setCurrentValue(nextValue)
    onChange && onChange(nextValue)
    setCurrentOptions(options)
  }

  return (
    <Select
      labelInValue
      onChange={onSelect}
      style={{ width: '100%' }}
      allowClear
      placeholder={placeholder ? placeholder : t('Select Beneficiary Types')}
      showSearch
      value={currentValue}
      filterOption={false}
      showArrow={false}
      onSearch={onSearch}
      mode={mode}
    >
      {currentOptions?.map((o) => (
        <Select.Option key={o.id} value={o.id}>
          {t(o.name)}
        </Select.Option>
      ))}
    </Select>
  )
}

export default withTranslation()(withUserProfile(BeneficiaryTypeSelect)) 
