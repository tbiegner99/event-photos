import React, { useEffect, useRef, useState } from 'react';
import { FlexChild, FlexColumn, FlexRow } from '../components/containers/Flex';
import { H4 } from '../components/typography/Typography';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import ThirdPartyEmailPassword from 'supertokens-auth-react/lib/build';
import Session from 'supertokens-auth-react/recipe/session';
export interface AuthorInfo {
    author: string | null;
    authorName: string;
    promptForAuthor: () => Promise<any>;
    clearAuthor: () => any;
}

export const AuthorContext = React.createContext<AuthorInfo>({
    author: null,
    authorName: '',
    promptForAuthor: () => {
        return Promise.resolve();
    },
    clearAuthor: () => {}
});

export const useAuthor = () => {
    const context = React.useContext(AuthorContext);
    if (!context) {
        throw new Error('useViewport must be used within a ViewportContextProvider');
    }
    return context;
};

export const AuthorProvider = function (props: any) {
    const context = useSessionContext();
    const { children, ...otherProps } = props;
    const [isPrompting, setIsPrompting] = useState(false);
    const authorPromise = useRef<{ resolve: (val) => any; reject: (val) => any } | null>(null);

    const [author, setAuthor] = useState<AuthorInfo>({
        author: null,
        authorName: '',
        promptForAuthor: () => {
            setIsPrompting(true);
            return new Promise((resolve, reject) => {
                authorPromise.current = { resolve, reject };
            });
        },
        clearAuthor: () => {
            setAuthor({ ...author, author: null, authorName: '' });
        }
    });
    const [editingAuthor, setEditingAuthor] = useState('');
    useEffect(() => {
        if (context.loading || !Boolean(context.accessTokenPayload?.name)) {
            const authorName = window.localStorage.getItem('author') || '';
            setAuthor({ ...author, authorName });
        }
    }, []);
    useEffect(() => {
        if (context?.loading === false && Boolean(context?.accessTokenPayload?.name)) {
            setAuthor({
                ...author,
                author: context.userId,
                authorName: context.accessTokenPayload.name
            });
        }
        console.log('context', context);
    }, [context]);
    return (
        <AuthorContext.Provider {...otherProps} value={author}>
            <Dialog open={isPrompting} onClose={() => {}}>
                <DialogTitle>
                    <H4>Who are you?</H4>
                </DialogTitle>
                <DialogContent>
                    <FlexColumn>
                        <TextField
                            fullWidth
                            label="Name"
                            value={editingAuthor}
                            onChange={(e) => {
                                setEditingAuthor(e.target.value);
                            }}
                        />
                    </FlexColumn>
                </DialogContent>
                <DialogActions>
                    <FlexRow justifyContent="flex-end" gap={10}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                                setAuthor({
                                    ...author,
                                    authorName: 'Anonymous'
                                });
                                window.localStorage.setItem('author', 'Anonymous');
                                authorPromise.current?.resolve('Anonymous');
                                setIsPrompting(false);
                            }}
                        >
                            I'll be anonymous
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={!editingAuthor}
                            onClick={() => {
                                authorPromise.current?.resolve(editingAuthor);
                                window.localStorage.setItem('author', editingAuthor);
                                setAuthor({ ...author, authorName: editingAuthor });
                                setIsPrompting(false);
                            }}
                        >
                            Done
                        </Button>
                    </FlexRow>
                </DialogActions>
            </Dialog>
            {children}
        </AuthorContext.Provider>
    );
};
