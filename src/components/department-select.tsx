import { WithTranslation, withTranslation } from "react-i18next";
import { UserProfileProps, withUserProfile } from "./user-profile";
import { FC } from "react";
import { Select } from "antd";

interface DepartmentSelectProps extends WithTranslation, UserProfileProps  {
    placeholder?: string
    onChange?: (value: string) => void
    value?: string | null
    nullable?: boolean
    minWidth?: number
    width?: number
    tagMode?: boolean | false
    size?: "small" | "middle" | "large"
    defaultValue?: any
}

const DepartmentSelect : FC<DepartmentSelectProps> = ({placeholder, nullable, onChange, minWidth, tagMode, size, t, width, defaultValue}) =>{
    return(
        <Select 
            placeholder={placeholder ?? t('Select Department')}
            onChange={onChange}
            allowClear={nullable}
            showSearch
            filterOption={false}
            size={size}
            mode={tagMode ? 'tags' :'multiple'}
            style={{ width: width ? width : '100%', minWidth: minWidth ? minWidth : '0px' }}
            defaultValue={defaultValue}
        />
    )
}

export default withTranslation()(withUserProfile(DepartmentSelect));