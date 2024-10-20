import { FC } from "react";
import {Tooltip, Tag, Row, Col} from 'antd';
import {TagOutlined} from '@ant-design/icons'
import { WithTranslation } from "react-i18next";
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { withUserProfile } from 'src/components/user-profile';
import { withTranslation } from 'react-i18next';


interface typoologyComponentInfo extends WithTranslation, RouteComponentProps {
     typologyName: string;
    
}

const TypoologyTag: FC<typoologyComponentInfo> = ({ t, typologyName }) => { 

    const getTypology = (typologyName: string) => {

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
                    return 'Application of a new organizational method to business practices, workplace organization or external relations.';
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

    return (
        <Tooltip title={
          <Row>
            <Col>
                <span style={{ fontWeight: 'bold' }}>{t("Project Typology")}</span>
            </Col>
            <Col>
                {t(getTypology(typologyName))}
            </Col>
           </Row>
        }
        >
         {
            <Tag color="purple">
                <TagOutlined />
                {t(typologyName)}
            </Tag>
         }
        </Tooltip>

    );
}


export default withUserProfile(withTranslation()(withRouter(TypoologyTag)));