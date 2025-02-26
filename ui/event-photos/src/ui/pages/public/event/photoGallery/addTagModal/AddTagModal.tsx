import {
    Autocomplete,
    Box,
    Button,
    Chip,
    createFilterOptions,
    Dialog,
    DialogTitle,
    IconButton,
    Modal,
    Paper,
    TextField
} from '@mui/material';
import React, { ReactNode } from 'react';
import { FlexColumn, FlexRow } from '../../../../../components/containers/Flex';
import { Add, Close } from '@mui/icons-material';

const filter = createFilterOptions<{ label: string; value: string; customValue?: boolean }>();

export const AddTagModal = ({
    open,
    title,
    tags,
    tagIcon,
    options,
    onAddTag,
    onRemoveTag,
    onDone
}: {
    open: boolean;
    options?: { label: string; value: string }[];
    title: ReactNode;
    tags: string[];
    tagIcon?: ReactNode;
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    onDone: () => void;
}) => {
    const [value, setValue] = React.useState<string | { label: string; value: string } | null>(
        null
    );
    return (
        <Dialog open={open} onClose={onDone} fullWidth>
            <FlexColumn gap={20} style={{ padding: 20 }}>
                <DialogTitle>{title}</DialogTitle>
                <FlexRow gap={10}>
                    <FlexRow grow={1}>
                        <Autocomplete
                            freeSolo
                            fullWidth
                            selectOnFocus
                            handleHomeEndKeys
                            clearOnBlur
                            value={value}
                            getOptionLabel={(option) => {
                                if (typeof option !== 'string' && (option as any).customValue) {
                                    return option.value;
                                }
                                return typeof option === 'string' ? option : option.label;
                            }}
                            renderOption={(props, option) => {
                                const { key, ...optionProps } = props;
                                return (
                                    <li key={key} {...optionProps}>
                                        {option.label}
                                    </li>
                                );
                            }}
                            filterOptions={(options, params) => {
                                const filtered = filter(options, params);

                                const { inputValue } = params;
                                // Suggest the creation of a new value
                                const isExisting = options.some(
                                    (option) => inputValue === option.value
                                );
                                if (inputValue !== '' && !isExisting) {
                                    filtered.push({
                                        customValue: true,
                                        value: inputValue,
                                        label: `Add "${inputValue}"`
                                    });
                                }

                                return filtered;
                            }}
                            onChange={(e, opt) => setValue(opt as { label: string; value: string })}
                            options={options || []}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    onChange={(e) => {
                                        setValue(e.target.value);
                                    }}
                                />
                            )}
                        />
                    </FlexRow>
                    <Button variant="contained" color="primary" disabled={!Boolean(value)}>
                        <FlexRow
                            gap={5}
                            onClick={async () => {
                                console.log('value', value);
                                await onAddTag(typeof value === 'string' ? value : value!.value);
                                setValue(null);
                            }}
                        >
                            <Add />
                            <span>Add</span>
                        </FlexRow>
                    </Button>
                </FlexRow>
                <FlexRow wrap gap={10}>
                    {tags.map((tag) => (
                        <Chip
                            variant="filled"
                            color="primary"
                            label={
                                <FlexRow gap={5} alignItems="center">
                                    {tagIcon}
                                    <span>{tag}</span>
                                    <IconButton onClick={() => onRemoveTag(tag)} color="inherit">
                                        <Close />
                                    </IconButton>
                                </FlexRow>
                            }
                        ></Chip>
                    ))}
                </FlexRow>
                <FlexRow justifyContent="flex-end">
                    <Button variant="contained" color="primary" onClick={onDone}>
                        Done
                    </Button>
                </FlexRow>
            </FlexColumn>
        </Dialog>
    );
};
