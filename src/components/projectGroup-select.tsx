import { FC, useEffect, useState, useRef } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { Select } from 'antd'
import debounce from 'lodash/debounce'
import { UserProfileProps, withUserProfile } from './user-profile'
import { ProjectGroupsSummary } from '../stores/projectGroups-store'

const ProjectGroupSelect: FC<
    {
        countryId?: string
        placeholder?: string
        mode?: 'tags'
        onChange?: (value: { value: string; label: string }[]) => void
        value?: { value: string; label: string }[]
    } & WithTranslation & UserProfileProps
    > = ({ t, onChange, value, mode, i18n, userProfile,  countryId  }) => {

   
    const [currentValue, setCurrentValue] = useState(value)
    const [options, setOptions] = useState<ProjectGroupsSummary[]>()
    const [currentOptions, setCurrentOptions] = useState<ProjectGroupsSummary[] | undefined>()
    const inputRef = useRef<any>()
    const [projectGroupsOptions, setProjectGroupsOptions] = useState([]);


    const loadOptions = async () => {
        var orderOptions = userProfile.projectGroups.map(a => { return { ...a } })
        orderOptions = Array.from(orderOptions.orderBy((o) => t(o.name)) as any) as ProjectGroupsSummary[]
        await setCurrentOptions([...orderOptions])
        await setOptions(userProfile.projectGroups)
        }

        const filteredProjectGroups= () => {
           const filteredProjectGroups1 = userProfile.projectGroups
                .filter(t => t.area === countryId)
                .map(x => ({ value: x.name }));
            var orderProjectGroups = Array.from(filteredProjectGroups1.orderBy((o) => t(o.value)) as any) 
            
            return [...orderProjectGroups]
        } 
        
        useEffect(() => {
            setProjectGroupsOptions(filteredProjectGroups());
       
    }, [countryId]);

    useEffect(() => {
        loadOptions()
    }, [inputRef])

    useEffect(() => {

        setCurrentOptions((options: ProjectGroupsSummary[]) => changeOptionsOrder(options))

    }, [i18n.language])

    useEffect(() => {
        setCurrentValue(value)
    }, [value]) 

    const changeOptionsOrder = (options: ProjectGroupsSummary[]) => {
        if (options) {
            var orderOptions = userProfile.projectGroups.map(a => { return { ...a } })
            orderOptions = Array.from(orderOptions.orderBy((o) => t(o.name)) as any) as ProjectGroupsSummary[]
            return [...orderOptions]
        }
        return undefined
    }

    const onSearch = debounce((value: string) => {
        var result = []
        const projecGroups = filteredProjectGroups()       
        projecGroups.forEach(x => {
            if (t(x['value']).toLowerCase().includes(value.toLowerCase())) {
                result.push(x)
            }
        })
        setProjectGroupsOptions(result)
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
            showSearch
            value={currentValue}
            filterOption={false}
            showArrow={false}
            onSearch={onSearch}
            mode={mode}
            options={projectGroupsOptions}
        >
            {currentOptions?.map((o) => (
                <Select.Option key={o.id} value={o.name}>
                    {(o.name)}
                </Select.Option>
            ))}
        </Select>


    )
}

export default withTranslation()(withUserProfile(ProjectGroupSelect))
