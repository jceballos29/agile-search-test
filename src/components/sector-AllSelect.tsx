import { FC, useEffect, useState, useRef } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { Select, Checkbox } from 'antd'
import debounce from 'lodash/debounce'
import { SectorSummary } from 'src/stores/sector-store'
import { UserProfileProps, withUserProfile } from './user-profile'


const SectorAllSelect: FC<
  {
    placeholder?: string
    mode?: 'multiple' | 'tags'
    onChange?: (value: { value: string; label: string }[]) => void
    value?: { value: string; label: string }[]
  } & WithTranslation & UserProfileProps
> = ({ t, onChange, value, placeholder, mode, i18n, userProfile }) => {

  const [currentValue, setCurrentValue] = useState(value)
  const [options, setOptions] = useState<SectorSummary[]>()
    const [currentOptions, setCurrentOptions] = useState<SectorSummary[]>([]);
  const inputRef = useRef<any>()
  const [autoFill, setAutoFill] = useState(false);

  const loadOptions = async () => {
    var orderOptions = userProfile.sectors.map(a => { return { ...a } })
    orderOptions = Array.from(orderOptions.orderBy((o) => t(o.name)) as any) as SectorSummary[]
    await setCurrentOptions([...orderOptions])
    await setOptions(userProfile.sectors)
  }

  useEffect(() => { 
    loadOptions() 
  }, [inputRef])

  useEffect(() => {

    setCurrentOptions((options: SectorSummary[]) => changeOptionsOrder(options))

  }, [i18n.language])

    useEffect(() => {
       setCurrentValue(value)

  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps  

  const changeOptionsOrder = (options: SectorSummary[]) => {
    if (options) {
      var orderOptions = userProfile.sectors.map(a => { return { ...a } })
      orderOptions = Array.from(orderOptions.orderBy((o) => t(o.name)) as any) as SectorSummary[]
      return [...orderOptions]
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


    const handleCheckboxChange = () => {
        const nextAutoFill = !autoFill;
        setAutoFill(nextAutoFill);

        const defaultCheckOptions = nextAutoFill
            ? options.map(o => ({ value: o.id, label:t( o.name )}))
            : [];
       
        onSelect(defaultCheckOptions);
    };


    return (

   <div>
    <Select
      labelInValue
      onChange={onSelect}
      style={{ width: '100%' }}
      allowClear
      placeholder={placeholder ? placeholder : t('Select Sectors')}
      showSearch
      value={currentValue}
      filterOption={false}
      showArrow={false}
      onSearch={onSearch}
      mode={mode}
      disabled={autoFill}
    >
      {currentOptions?.map((o) => (
        <Select.Option key={o.id} value={o.id}>
          {t("S"+(o.name))}
        </Select.Option>
      ))}
    </Select>
            <Checkbox onChange={handleCheckboxChange}>{t('Select All Sectors')}</Checkbox>
    </div>

  )
}

export default withTranslation()(withUserProfile(SectorAllSelect))
