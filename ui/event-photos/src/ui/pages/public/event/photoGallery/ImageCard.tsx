import { Box, Paper } from '@mui/material';
import { Photo } from '../../../../../models/Photo';
import React from 'react';
import { FlexRow } from '../../../../components/containers/Flex';
import { Videocam } from '@mui/icons-material';
import classNames from 'classnames';
import styles from './imageCard.css';

export const ImageCard = ({
    leftActions,
    rightActions,
    photo,
    size = 150,
    selected,
    onSelect
}: {
    size?: number;
    leftActions?: React.ReactNode;
    rightActions?: React.ReactNode;
    photo: Photo;
    selected: boolean;
    onSelect?: () => any;
}) => {
    const isVideo = photo.contentType.startsWith('video');
    return (
        <Paper
            className={classNames({ [styles.selected]: selected })}
            sx={{
                width: size,
                height: size,
                cursor: 'pointer',
                backgroundImage: `url('${photo.thumbnailUrl}')`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#efefef',
                position: 'relative'
            }}
            onClick={onSelect}
        >
            <FlexRow
                fullWidth
                fullHeight
                justifyContent="space-between"
                style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '5px' }}
            >
                {leftActions || <span />}
                {rightActions || <span />}
            </FlexRow>
            {isVideo && (
                <FlexRow fullWidth justifyContent="center" alignItems="center" fullHeight>
                    <div className={styles.icon}>
                        <Videocam style={{ fontSize: '30px' }} />
                    </div>
                </FlexRow>
            )}
        </Paper>
    );
};
