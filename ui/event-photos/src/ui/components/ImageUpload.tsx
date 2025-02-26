import React, { ReactNode, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { FileUpload } from './FileUpload';
import styles from './imageUpload.css';
import classNames from 'classnames';
interface ImageUploadProps {
    title?: ReactNode;
    onChange: (file: File[]) => void;
    accept?: string;
    multiple?: boolean;
    preview?: boolean;
    previewMaxWidth?: number;
    previewMaxHeight?: number;
    [x: string]: any;
}

export const ImageUpload = ({
    onChange,
    accept,
    previewMaxWidth = 150,
    previewMaxHeight = 150,
    currentImageId,
    ...otherProps
}: ImageUploadProps) => {
    const [previewSrc, setPreviewSrc] = React.useState<string[]>([]);
    const [files, setFiles] = React.useState<File[]>([]);
    const handleUpload = async (files: File[]) => {
        setPreviewSrc(files.map((f) => URL.createObjectURL(f)));
        setFiles(files);
        onChange(files || []);
    };

    const onRemove = (index: number) => {
        setPreviewSrc(previewSrc.filter((_, i) => i !== index));
        setFiles(files.filter((_, i) => i !== index));
        onChange([]);
    };
    return (
        <div>
            <section
                className={classNames({
                    [styles.preview]: previewSrc.length > 0
                })}
            >
                {previewSrc.map((src, i) => (
                    <div
                        className={styles.previewContainer}
                        style={{
                            width: previewMaxWidth,
                            height: previewMaxHeight,
                            backgroundImage: `url(${src})`
                        }}
                    >
                        <div className={styles.delete} onClick={() => onRemove(i)}>
                            <DeleteIcon className={styles.deleteIcon} />
                        </div>
                        {/* <img className={styles.previewImage} src={previewSrc} alt="" /> */}
                    </div>
                ))}
            </section>

            <FileUpload onChange={handleUpload} accept={accept} {...otherProps} />
        </div>
    );
};
