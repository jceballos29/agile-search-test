import * as React from "react";
import ReactQuill from 'react-quill';
import "./rich-editor.less"

interface RichTextViewProps {
	value?: any;
	toolbarClass?: string;
	required?: boolean;
	label?: string;
	containerClassName?: string;
    onChange?: (html: any) => void;
	readOnly?: boolean;
	onKeyDown?: any;
}

interface RichTextViewState{
	text: any;
}
export default class RichTextView extends React.Component<RichTextViewProps, RichTextViewState>{

	constructor(props: RichTextViewProps) {
		super(props);
		this.state = {
			text: this.props.value || ''
		};
	}
	
	UNSAFE_componentWillReceiveProps(nextProps: RichTextViewProps) {
		
		if (nextProps.value && nextProps.value !== this.props.value) {
			this.setState({
				text: (nextProps.value as string).substr(0)
			});

		}
	}


	render() {
		
		const { text } = this.state;

		const modules = {
			toolbar: [
				[{ 'header': [1, 2, 3, 4, 5, 6, false] }, { 'font': [] }],
				['bold', 'italic', 'underline', 'strike', 'blockquote'],
				[{ 'size': ['small', false, 'large', 'huge'] }, { 'color': [] }, { 'background': [] }, { 'direction': 'rcl' }, { 'align': [] }],
				[{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
				['link', 'image'],
				['clean']
			]
		};

		const format = [
			'header', 'font',
			'bold', 'italic', 'underline', 'strike', 'blockquote',
			'list', 'bullet', 'indent',
			'link', 'image', 'background', 'size', 'align', 'direction', 'color'
		];

		return (
			
			<div className={this.props.containerClassName ? this.props.containerClassName : "wysiwyg-editor"}>
				<ReactQuill onKeyDown={this.props.onKeyDown} theme='snow' value={text} onChange={this.handleChange} modules={modules} formats={format} readOnly={this.props.readOnly} />
            </div>
				
		);
	}


    private handleChange = (content: string, delta: any, source: any, editor: any) => {
        if (source === 'user') {
            if (this.props.onChange)
                this.props.onChange(editor.getHTML());
            this.setState({ text: content });
        }        
	}
}
