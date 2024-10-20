import * as React from 'react';
import { Menu, Spin, Card, Col } from 'antd'

export interface ColDefinition { xs ?: number, sm ?: number, md ?: number, lg ?: number }

interface CardCollapsableProps {
    title: any;
    col?: ColDefinition;
    minWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    className?: string;
    extra?: React.ReactNode;
    style?: React.CSSProperties;
}

interface CardCollapsableState {
    collapsed: boolean;
    closed: boolean;
}

export default class CardCollapsable extends React.Component<CardCollapsableProps, CardCollapsableState> {
    
    constructor(props: any){
        super(props);

        this.state = {
            collapsed: false,
            closed: false
        }
    }


    handleCollapse = () => {
        this.setState({
            collapsed: !this.state.collapsed
        })
    }

    handleClose = () => {
        this.setState({
            closed: true
        })
    }

    public render() {

        if(this.state.closed)
            return null;

        const actions = [];

        const style = {
            padding: '15px',
            cursor: 'pointer'
        }

        const inner = (<Card className={this.props.className} style={{ ...(this.props.style || {}), minHeight: this.props.minHeight, minWidth: this.props.minWidth, maxHeight: this.props.maxHeight }}
            title={this.props.title}
            extra={this.props.extra}>
            {!this.state.collapsed && this.props.children}
        </Card>);

        var xs = this.props.col ? (this.props.col.xs || this.props.col.sm || this.props.col.md || this.props.col.lg || 24) : 24;
        var sm = this.props.col ? (this.props.col.sm || this.props.col.md || this.props.col.lg || 24) : 24;
        var md = this.props.col ? (this.props.col.md || this.props.col.lg || 24) : 24;
        var lg = this.props.col ? (this.props.col.lg || 24) : 24;

        return this.props.col ? (<Col xs={xs} sm={sm} md={md} lg={lg}>{inner}</Col>): inner;
    }
}