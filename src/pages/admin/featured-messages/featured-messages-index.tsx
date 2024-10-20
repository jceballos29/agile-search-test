import { Button, Card, Row, Tag } from "antd";
import { FC, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { UserProfileProps, withUserProfile } from "src/components/user-profile";
import FeaturedMessagesCreate from "./featured-messages-create";
import { TableView } from "src/core/ui/collections/table";
import { Query } from "src/core/stores/data-store";
import { container } from "src/inversify.config";
import { clone } from '../../../core/utils/object'
import { FeaturedMessageStorage, ListFeaturedMessage, Message } from "src/stores/featured-messages-store";
import { formatMessage } from "src/core/services/http.service";
import moment from "moment";
import FeaturedMessagesEdit from "./featured-messages-edit";

interface FeaturedMessagesProps extends WithTranslation , UserProfileProps {}

const FeaturedMessages :FC<FeaturedMessagesProps> = ({t}) =>{
    const [visibleCreateMessage, setVisibleCreateMessage] = useState(false);
    const [visibleEditMessage, setVisibleEditMessage] = useState(false);
    const [editMessage, setEditMessage] = useState<Message>(null);
    const changeVisibleCreateMessageModal = (newState: boolean) => {
        setVisibleCreateMessage(newState);
        setQuery(clone<Query>(query));
        Load();
    }
    const changeVisibleEditMessageModal = (editState: boolean, data: ListFeaturedMessage) => {
        setVisibleEditMessage(editState);
        setQuery(clone<Query>(query));
        setEditMessage(data);
        Load();
    }
    const [searchQuery, setSearchQuery] = useState('');
    const [query, setQuery] = useState({
        searchQuery: searchQuery,
        skip: 0,
        take: 10,
        orderBy: [{ field: 'messageTitle', direction: 'Ascending', useProfile: true }],
    } as Query);
    const featuredMessageStore = container.get(FeaturedMessageStorage);
    const featuredMessageState = featuredMessageStore.state;

    const Load = async (searchQuery: Query = query) => await featuredMessageStore.load(searchQuery);

    const leftToolBar = () => (
        <>
          <li>
            <Button type="primary" onClick={() => changeVisibleCreateMessageModal(true)}>
                {t("Create Message")}
            </Button>
          </li>
        </>
    );

    const featuredMessagesTableModel = {
        query: query,
        columns: [
            {
                searchable: false,
                sortable: true,
                field: 'messageTitle',
                title: t('Message Title'),
                renderer: (data: ListFeaturedMessage) => (
                    <>
                        <a onClick={() => changeVisibleEditMessageModal(true, data) }>
                            <span>
                                {data.messageTitle}
                            </span>
                        </a>
                    </>
                ),
            },
            {
                field: 'message',
                sortable: false,
                searcheable: false,
                title: t('Message'),
                renderer: (value: ListFeaturedMessage) => <span>{value.message}</span>,
            },
            {
                field: 'areas',
                title: t('Areas'),
                sortable: false,
                searcheable: false,
                renderer: (data: ListFeaturedMessage) => (
                    <span>
                        {data.areas.map((country) => 
                            <Tag color="gray">
                                <span style={{ marginRight: 10 }}>{country}</span>
                            </Tag>
                        )}
                    </span>
                ),
            },
            // {
            //     field: 'departments',
            //     title: t('Departments'),
            //     sortable: false,
            //     searcheable: false,
            //     renderer: (data: ListFeaturedMessage) => (
            //         <span>
            //             {data.departments.map((department) => 
            //             <Tag color="gold">
            //                 <span style={{ marginRight: 10 }}>{department}</span>
            //             </Tag>
            //             )}
            //         </span>
            //     ),
            // },
            // {
            //     field: 'offices',
            //     title: t('Offices'),
            //     sortable: false,
            //     searcheable: false,
            //     renderer: (data: ListFeaturedMessage) => (
            //         <span>
            //             {data.offices.map((office) => 
            //                 <span style={{ marginRight: 10 }}>{office}</span>
            //             )}
            //         </span>
            //     ),
            // },
            {
                field: 'startPublicationDate',
                title: t('Publication start date'),
                sortable: false,
                searcheable: false,
                renderer: (data: ListFeaturedMessage) => <span>{moment(data.startPublicationDate).format('DD-MM-YYYY')}</span>,
            },
            {
                field: 'endPublicationDate',
                title: t('Publication end date'),
                sortable: false,
                searcheable: false,
                renderer: (data: ListFeaturedMessage) => <span>{moment(data.endPublicationDate).format('DD-MM-YYYY')}</span>,
            },
        ],
        data: featuredMessageState.value,
        sortFields: [],
    }

    useEffect(() => {
        Load();
    },[visibleEditMessage]);

    return(
        <Card title={t('Featured Messages')}>
            <Row align={'middle'} justify={'space-between'}></Row>
            {visibleCreateMessage ? (<FeaturedMessagesCreate changeVisibleCreateMessageModal={changeVisibleCreateMessageModal}/>) : <></>}
            <div style={{ width: '100%', marginBottom: '0 5px', overflow: 'hidden' }}>
                <TableView
                    canSelect={false}
                    rowKey={"id"}
                    initPagination={false}
                    leftToolbar={leftToolBar()}
                    onQueryChanged={(query: Query) => {
                        setQuery(query);
                        Load(query);
                    }}
                    
                    onRefresh={() => Load()}
                    model={featuredMessagesTableModel}
                    error={featuredMessageState.errorMessage.value && formatMessage(featuredMessageState.errorMessage.value)}
                    canDelete={true}
                    onDeleteRow={(record: ListFeaturedMessage) => featuredMessageStore.delete(record.id.toString())}
                />
            </div>
            {visibleEditMessage ? 
                <FeaturedMessagesEdit messageToEdit={editMessage} changeVisibleEditMessageModal={changeVisibleEditMessageModal}/> 
                : <></>
            }
        </Card>
    )
}

export default withTranslation()(withUserProfile(FeaturedMessages));