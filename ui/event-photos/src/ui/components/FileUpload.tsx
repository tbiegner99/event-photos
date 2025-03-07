import React, { ReactNode, useRef } from 'react';

import FileUploadIcon from '@mui/icons-material/UploadFile';
import { Button, Link } from '@mui/material';

interface FileUploadProps {
    title?: string;
    onChange: (files: Array<File>) => void;
    onBeforePrompt?: () => Promise<any>;
    accept?: string;
    multiple?: boolean;
    icon?: ReactNode;
    [x: string]: any;
}
export const readFileAsBase64DataString = async (file: File) => {
    var dataUrl = await readFileAsBase64URL(file);
    return dataUrl.replace(/.*,/, '');
};
export const readFileAsBase64URL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = () => reject();
        reader.readAsDataURL(file);
    });

export const FileUpload = ({
    title,
    onChange,
    onBeforePrompt,
    accept,
    multiple = false,
    children,
    icon,
    ...otherProps
}: FileUploadProps) => {
    const handleUpload = async (e: any) => {
        const files: FileList = e.target.files;
        onChange(Array.from(files));
    };
    const inputRef = useRef(null as HTMLInputElement | null);
    const fileInput = (
        <input
            ref={inputRef}
            type="file"
            data-role="file-upload"
            accept={accept}
            onChange={handleUpload}
            hidden
            multiple={multiple}
        />
    );
    return children ? (
        <div
            style={{ cursor: 'pointer' }}
            {...otherProps}
            onClick={() => inputRef.current?.click()}
        >
            {children}
            {fileInput}
        </div>
    ) : (
        <>
            {fileInput}
            <Button
                component="label"
                color="primary"
                variant="contained"
                size="medium"
                {...otherProps}
                onClick={async () => {
                    try {
                        if (onBeforePrompt) {
                            await onBeforePrompt();
                        }
                        inputRef.current?.click();
                    } catch (e) {
                        console.info('onBeforePrompt rejected. skipping');
                    }
                }}
            >
                <div style={{ display: 'flex', gap: 10 }}>
                    {icon || <FileUploadIcon />}
                    <div>{title || 'Upload File'}</div>
                </div>
            </Button>
        </>
    );
};
