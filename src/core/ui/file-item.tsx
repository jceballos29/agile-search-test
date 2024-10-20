import * as React from 'react';
import { FileExcelOutlined, FileImageOutlined, FilePdfOutlined, FileTextOutlined, FileUnknownOutlined, FileWordOutlined, FileZipOutlined } from '@ant-design/icons';

interface FileType {
    url: string;
    title: string;
    contentType: string;
}

interface IFileItemProps {
    item: FileType
}

interface IFileItemState {

}

export default class FileItem extends React.Component<IFileItemProps, IFileItemState>{

    discriminateIconType = (type: string, filename: string) => {

        if (type.match(/image\/(jpeg|jpg|png|gif|ico|bmp)/))
          return <FileImageOutlined style={{ fontSize: '16pt' }} />

        if (type.match(/application\/(pdf)/))
          return <FilePdfOutlined style={{ fontSize: '16pt' }}/>

        if (type.match(/application\/octet-stream/) && filename.match(/.*\.docx?/))
          return <FileWordOutlined style={{ fontSize: '16pt' }} />

        if (type.match(/application\/octet-stream/) && filename.match(/.*\.pptx?/))
          return <FileExcelOutlined style={{ fontSize: '16pt' }}/>

        if (type.match(/application\/octet-stream/) && filename.match(/.*\.xlsx?/))
          return <FileExcelOutlined style={{ fontSize: '16pt' }} />

        if (type.match(/application\/octet-stream/) && filename.match(/.*\.(rar|zip|7z|gzip)/))
          return <FileZipOutlined style={{ fontSize: '16pt' }}/>

        if (type.match(/text\/(plain)/))
        return <FileTextOutlined style={{ fontSize: '16pt' }} />

      return <FileUnknownOutlined style={{ fontSize: '16pt' }} />
    }

    render() {
        const { item } = this.props;

      return <a key={item.url} target='_blank' href={item.url}>{this.discriminateIconType(item.contentType, item.title)} {item.title}</a>;
    }
}
