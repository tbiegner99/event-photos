import { Button, Chip } from '@mui/material';
import { FlexColumn, FlexRow } from '../../../../components/containers/Flex';
import { LocalOffer, Person, PersonAdd } from '@mui/icons-material';
import React from 'react';
import { H4, H6 } from '../../../../components/typography/Typography';
import { Photo } from '../../../../../models/Photo';

export const PhotoMetadata = ({
    photo,
    onAddTag,
    onAddPeople
}: {
    photo: Photo;
    onAddPeople: () => any;
    onAddTag: () => any;
}) => {
    return (
        <FlexColumn gap={10}>
            <H4>Metadata</H4>
            <FlexRow gap={10} alignItems="center">
                <H6>Author:</H6>
                <Chip
                    size="small"
                    variant="outlined"
                    color="primary"
                    label={photo.authorName}
                ></Chip>
            </FlexRow>
            <FlexRow gap={10} alignItems="center">
                <H6>People:</H6>
                <FlexRow wrap gap={5}>
                    {photo.metadata.people?.map((tag) => (
                        <Chip
                            size="small"
                            variant="filled"
                            color="primary"
                            label={
                                <FlexRow gap={5} alignItems="center">
                                    <Person style={{ fontSize: 14 }} />
                                    <span>{tag}</span>
                                </FlexRow>
                            }
                        ></Chip>
                    ))}
                </FlexRow>
                <Button
                    onClick={() => {
                        onAddPeople();
                    }}
                    variant="outlined"
                    style={{ height: 30, minWidth: 20, padding: 5 }}
                >
                    <PersonAdd />
                </Button>
            </FlexRow>
            <FlexRow gap={10} alignItems="center">
                <H6>Tags:</H6>
                <FlexRow wrap gap={5}>
                    {photo.metadata.keywords?.map((tag) => (
                        <Chip
                            size="small"
                            variant="filled"
                            color="primary"
                            label={
                                <FlexRow gap={5} alignItems="center">
                                    <LocalOffer style={{ fontSize: 14 }} />
                                    <span>{tag}</span>
                                </FlexRow>
                            }
                        ></Chip>
                    ))}
                </FlexRow>
                <Button
                    onClick={() => {
                        onAddTag();
                    }}
                    variant="outlined"
                    size="small"
                    style={{ height: 30, minWidth: 20, padding: 5 }}
                >
                    <LocalOffer />
                </Button>
            </FlexRow>
        </FlexColumn>
    );
};
