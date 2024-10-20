import * as React from 'react'
import { Row, Col } from 'antd';
import { withTranslation, WithTranslation } from 'react-i18next';

import logo from '../../assets/images/404/logo.jpg';
import  error404_2 from '../../assets/images/404/img2.jpg';
import  error404_3 from '../../assets/images/404/img3.jpg';
import  error404_4 from '../../assets/images/404/img4.jpg';
const images = [
    {
        src: error404_2,
        heading: "We no longer know where to put so much innovation!!",
        heading2: "Or the page may not be found ..."
    },
    {
        src: error404_3,
        heading: "Page not found"
    },
    {
        src: error404_4,
        heading: "Page not found"
    }];

interface Page404Props extends WithTranslation {

}

class Page404 extends React.Component<Page404Props, {image:any}>{

    getRandomInt(max: number) {
        return Math.floor(max * Math.random());
    }

    selectImage() {
        const i = this.getRandomInt(3);
        return images[i];
    }

    constructor(props: Page404Props) {
        super(props);
        this.state = {
            image: this.selectImage()
        }
    }

    render() {
        const { t } = this.props;

        return <div style={{ backgroundColor: "#0000A9", width: "100%", height: "100%", position: "absolute", top: "-20px" }}>
            <Row><img src={logo} style={{padding: 20}}/></Row>
            <Row style={{ textAlign: "center" }}>
                <Col><img src={this.state.image.src} style={{ maxWidth: "100%", width: "600px", height: "auto" }} /></Col>
            </Row >
            <Row>
                <h1 style={{ textAlign: "center", color: "white", fontSize: "3vw" }}>{t(this.state.image.heading)}</h1>
            </Row>
            {this.state.image.heading2 && <Row><h4 style={{ textAlign: "center", color: "white", fontSize: "2vw" }}>{t(this.state.image.heading2)}</h4></Row>}
        </div>
        }
    }
    
export default withTranslation()(Page404);