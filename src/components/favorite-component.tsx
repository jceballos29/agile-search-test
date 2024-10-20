import { FC } from "react";
import { Button, Tooltip } from 'antd';
import { TypesFavoritesComponents } from "src/utils/enums/enumTypesFavoritesComponent";
import { WithTranslation } from "react-i18next";
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IdentityProps, withIdentity } from '../core/services/authentication';
import { withUserProfile } from 'src/components/user-profile';
import { withTranslation } from 'react-i18next';
import { HeartTwoTone, HeartOutlined } from '@ant-design/icons';

interface favoriteComponentInfo extends WithTranslation, RouteComponentProps, IdentityProps{
    favorite: boolean;
    countryId: string;
    externalSystem: string;
    SetFavorite: () => void;
}

const FavoriteComponent: FC<favoriteComponentInfo> = ({ t, countryId, favorite, SetFavorite, externalSystem }) => {
    const getFavorite = () => {
        let typeFavoriteComponent: TypesFavoritesComponents;
        switch(countryId){
            case 'Es':
                typeFavoriteComponent = TypesFavoritesComponents.red;
                break;
            case 'In':
                if(externalSystem === 'ES-001')
                    typeFavoriteComponent = TypesFavoritesComponents.blue;
                else
                    typeFavoriteComponent = TypesFavoritesComponents.red;
                
                break;
            default:
                typeFavoriteComponent = TypesFavoritesComponents.red;
                break;
        }

        switch(typeFavoriteComponent){
            case TypesFavoritesComponents.blue:
                if (favorite) {
                    return (
                        <Tooltip title={t('Remove this Grant of your Favorites')}>
                            {' '}
                            <Button
                                shape="round"
                                className="icon-favorite"
                                onClick={SetFavorite}
                                type="primary"
                                icon={<HeartTwoTone twoToneColor="blue" />}
                            >
                            </Button>
                        </Tooltip>
                    );
                }
        
                return (
                    <Tooltip title={t('Add this Grant to your Favorites')}>
                        {' '}
                        <Button
                            shape="round"
                            className='icon-favorite'
                            onClick={SetFavorite}
                            icon={<HeartTwoTone twoToneColor="blue" />}
                        >
                        </Button>
                    </Tooltip>
                );
            case TypesFavoritesComponents.red:
            default:
                if (favorite) {
                    return (
                        <Tooltip title={t('Remove this Grant of your Favorites')}>
                            {' '}
                            <HeartTwoTone onClick={() => SetFavorite()} style={{ fontSize: '20px', marginRight: 10, cursor: 'pointer' }} twoToneColor="red" />
                        </Tooltip>
                    );
                }
        
                return (
                    <Tooltip title={t('Add this Grant to your Favorites')}>
                        {' '}
                        <HeartOutlined onClick={() => SetFavorite()} style={{ fontSize: '20px', marginRight: 10, cursor: 'pointer' }} />
                    </Tooltip>
                );
        }
    };

    return(getFavorite());
}


export default withUserProfile(withIdentity(withTranslation()(withRouter(FavoriteComponent))));