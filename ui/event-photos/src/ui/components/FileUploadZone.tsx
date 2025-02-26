import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import FileUploadIcon from '@mui/icons-material/UploadFile';
import * as styles from './fileUploadZone.css';
import combineClasses from 'classnames';

interface FileUploadProps {
    title?: string;
    onChange: (files: Array<File>) => void;
    onDrop?: (files: Array<File>) => void;
    accept?: string[];
    maxFiles?: number;
    maxSize?: number;
}

export const FileUploadZone = (props: FileUploadProps) => {
    const [dragOver, setDragOver] = useState(false);
    return (
        <Dropzone
            maxSize={props.maxSize}
            accept={
                props.accept
                    ? props.accept.reduce(
                          (prevVal: any, str: string) => ({ ...prevVal, [str]: [] }),
                          {}
                      )
                    : undefined
            }
            onDrop={(acceptedFiles, rejectedFiles) => {
                setDragOver(false);
                console.log(acceptedFiles, rejectedFiles);
                if (rejectedFiles.length > 0) {
                    return;
                }
                props.onChange(acceptedFiles);
            }}
            onDragEnter={() => setDragOver(true)}
            onDragLeave={() => setDragOver(false)}
            maxFiles={props.maxFiles}
        >
            {({ getRootProps, getInputProps, isDragReject, isDragActive }) => (
                <div
                    data-role="file-dropzone"
                    {...getRootProps()}
                    className={combineClasses(
                        { [styles.dragOver]: dragOver },
                        { [styles.rejectDrag]: isDragReject },
                        styles.fileUploadZone
                    )}
                >
                    <input {...getInputProps()} />
                    <div className={styles.dropZoneContent}>
                        <FileUploadIcon className={styles.fileUploadIcon} />
                        {!isDragActive && <p>Drag and drop files or click here to upload</p>}
                        {!isDragReject && dragOver && <p>Drop to upload files </p>}
                        {isDragReject && (
                            <p>
                                Some files cannot be uploaded. Files must be of the following types:
                                .jpeg, .png, .pdf{' '}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </Dropzone>
    );
};
