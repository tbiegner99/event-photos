import React from 'react';

interface FlexChildProps extends React.HTMLAttributes<HTMLDivElement> {
    children: any;
    grow?: number;
    shrink?: number;
    basis?: string;
    style?: any;
    alignSelf?: 'center' | 'flex-start' | 'flex-end';
    justifySelf?: 'center' | 'flex-start' | 'flex-end';
}
interface FlexboxProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: any;
    direction: 'row' | 'column';
    alignItems?: 'center' | 'flex-start' | 'flex-end';
    justifyContent?:
        | 'center'
        | 'space-between'
        | 'space-around'
        | 'flex-start'
        | 'flex-end'
        | 'space-evenly';
    grow?: number;
    style?: any;
    fullHeight?: boolean;
    wrap?: boolean;
    gap?: string | number;
    fullWidth?: boolean;
}

type FlexColumnProps = Omit<FlexboxProps, 'direction'>;

export const FlexChild = (props: FlexChildProps) => {
    const { grow, shrink, basis, alignSelf, justifySelf, style, ...otherProps } = props;
    return (
        <div
            style={{
                flexGrow: grow,
                flexShrink: shrink,
                flexBasis: basis,
                alignSelf: alignSelf,

                ...style
            }}
            {...otherProps}
        >
            {props.children}
        </div>
    );
};
const FlexBox = (props: FlexboxProps) => {
    const {
        direction,
        alignItems,
        justifyContent,
        gap,
        grow,
        fullWidth,
        fullHeight,
        wrap,
        style,
        ...otherProps
    } = props;
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: wrap ? 'wrap' : 'nowrap',
                flexDirection: direction ?? 'row',
                alignItems: alignItems,
                gap: gap,
                justifyContent: justifyContent,
                flexGrow: grow,
                height: fullHeight ? '100%' : undefined,
                width: fullWidth ? '100%' : undefined,
                ...props.style
            }}
            {...otherProps}
        >
            {props.children}
        </div>
    );
};

export const FlexColumn = (props: FlexColumnProps) => {
    return <FlexBox {...props} direction={'column'} />;
};
export const FlexRow = (props: FlexColumnProps) => {
    return <FlexBox {...props} direction={'row'} />;
};
