import { FC, useEffect, useState, useRef } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { Popover, Select } from 'antd'
import debounce from 'lodash/debounce'
import { UserProfileProps, withUserProfile } from './user-profile'
import { TypologySummary } from '../stores/typology-store'


const TypologySelect: FC<
    {
        placeholder?: string
        mode?: 'multiple' | 'tags'
        onChange?: (value: { value: string; label: string }[]) => void
        value?: { value: string; label: string }[]
        showTooltip?: boolean
    } & WithTranslation & UserProfileProps
> = ({ t, onChange, value, placeholder, mode, i18n, userProfile, showTooltip }) => {

    const [currentValue, setCurrentValue] = useState(value)
    const [options, setOptions] = useState<TypologySummary[]>()
    const [currentOptions, setCurrentOptions] = useState<TypologySummary[] | undefined>()
    const inputRef = useRef<any>()

    const loadOptions = async () => {
        var orderOptions = userProfile.typologies.map(a => { return { ...a } })
        orderOptions = Array.from(orderOptions.orderBy((o) => t(o.name)) as any) as TypologySummary[]
        await setCurrentOptions([...orderOptions])
        await setOptions(userProfile.typologies)
    }

    useEffect(() => {
        loadOptions()
    }, [inputRef])

    useEffect(() => {

        setCurrentOptions((options: TypologySummary[]) => changeOptionsOrder(options))

    }, [i18n.language])

    useEffect(() => {
        setCurrentValue(value)
    }, [value]) // eslint-disable-line react-hooks/exhaustive-deps  

    const changeOptionsOrder = (options: TypologySummary[]) => {
        if (options) {
            var orderOptions = userProfile.typologies.map(a => { return { ...a } })
            orderOptions = Array.from(orderOptions.orderBy((o) => t(o.name)) as any) as TypologySummary[]
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

    const getTypology = (typologyName: string) => {
        if (!showTooltip || null) {
            return ''
        } else {
            switch (typologyName) {
                case 'Circular Economy':
                    return 'Investments both in the field of improving waste management (implementation of separate collections, construction of facilities for the treatment of bio-waste, for the preparation for reuse and recycling of other waste, and for other types of waste collection facilities), and in the field of digitalisation of environmental management.';
                case 'Decarbonization':
                    return 'Projects for the diversification of energy sources and promotion of renewable energies.';
                case 'Employment':
                    return 'Personnel recruitment projects.';
                case 'Energy Saving & Efficiency':
                    return 'Projects that pursue sustainability, efficiency or reduction of energy consumption.';
                case 'Entrepeneurship':
                    return 'Preparation of a business plan or a company plan, including those of recent creation and those with a technological base.';
                case 'Export':
                    return 'Projects focused on the internacionalization of the company.';
                case 'Innovation':
                    return 'Projects carried out by companies with an applied nature, very close to the market and with medium/low technological risk, with ease of achieving the planned technical and commercial objectives and with short investment recovery periods, which support the company in improvement of its competitiveness through the incorporation of emerging technologies.';
                case 'Investment':
                    return 'Investment in tangible and intangible assets related to the creation, expansion of capacity, diversification of production, or a transformation of the overall production process.';
                case 'Organizational Innovation':
                    return 'Project Typology: Application of a new organizational method to business practices, workplace organization or external relations.';
                case 'Others':
                    return 'Other typologies not specifically included.';
                case 'R&D':
                    return 'Research and business development projects of an applied nature for the creation or significant improvement of a production process, product or service. Projects must demonstrate a differential technological aspect over existing technologies on the market.';
                case 'Renewable Energy':
                    return 'Projects for the diversification of energy sources and promotion of renewable energies.';
                case 'Training':
                    return 'Staff training projects';
                case 'Viability Study':
                    return 'Evaluation and analysis of the potential of a project, as well as the resources necessary to carry it out and its prospects for success.';
                case 'Social Innovation':
                    return 'Innovation projects in specific areas of social services where there are special challenges to guarantee and modernize the social response, as well as to improve and update the model of care for people in situations of special vulnerability, It also applies to grant for nursing homes and day care centers.';
                default:
                    return typologyName
            }
        }
    }
    return (
        <Select
            labelInValue
            onChange={onSelect}
            style={{ width: '100%' }}
            allowClear
            placeholder={placeholder ? placeholder : t('Select Typologies')}
            showSearch
            value={currentValue}
            filterOption={false}
            showArrow={false}
            onSearch={onSearch}
            mode={mode}
        >
            {currentOptions?.map((o) => (
                <Select.Option key={o.id} value={o.id}>
                    <Popover title={t(o.name)} content={t(getTypology(o.name))} placement="topLeft" trigger="hover">
                        {t(o.name)}
                    </Popover>
                </Select.Option>
            ))}
        </Select>
    )
}

export default withTranslation()(withUserProfile(TypologySelect))
