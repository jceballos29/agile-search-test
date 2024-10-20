import React, { FC, useEffect, useRef, createElement as create } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution'
import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution'
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution'
import { withTranslation, WithTranslation } from 'react-i18next';
import { css } from '@emotion/css'

export interface MarkdownEditorProps {
    value?: string
    language: string
    height?: number
    onChange?: (value?: string) => void;
}

const MarkdownEditor: FC<MarkdownEditorProps & WithTranslation> = ({ value, height, onChange, language }) => {
    if (height == undefined)
        height = 800;
    const element = useRef<undefined | HTMLElement>()
    const editor = useRef<undefined | monaco.editor.IStandaloneCodeEditor>()
    useEffect(() => {
        const resize = () => {
            if (editor.current) {
                editor.current.layout({ height: 0, width: 0 })
                editor.current.layout()
            }
        }
        window.addEventListener('resize', resize)
        setTimeout(() => resize) // push to next tick
        return () => window.removeEventListener('resize', resize)
    })
    useEffect(() => {
        if (element.current) {
            editor.current = monaco.editor.create(element.current, {
                value,
                language,
                minimap: {
                    enabled: false,
                },
            })
            editor.current.onDidChangeModelContent(() => {
                if (editor.current && onChange) onChange(editor.current.getValue())
            })
        }
        return () => editor.current && editor.current.dispose()
    }, [])
    useEffect(() => {
        if (editor.current && editor.current.getValue() !== value) {
            try {
                editor.current.setValue(value ?? "")  /// Build error. If value = undefined , set empty string
            } catch { }
        }
    }, [value])

    return create('div', {
        className: css({
            border: '1px solid #e5e5ea',
        }),
        children: create('div', {
            ref: element,
            className: css({
                height,
            }),
        }),
    })
}

export default withTranslation()(MarkdownEditor);