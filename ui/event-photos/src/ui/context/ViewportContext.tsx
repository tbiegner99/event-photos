import React, { useState, useEffect, useMemo } from 'react';

export interface ViewportInfo {
    isMobile: boolean;
    width: number;
    height: number;
}

export const ViewportContext = React.createContext<ViewportInfo>({
    isMobile: false,
    width: window.innerWidth,
    height: window.innerHeight
});

const MOBILE_BREAKPOINT = 700;

const isMobileView = () => window.innerWidth < MOBILE_BREAKPOINT;

export const useViewport = () => {
    const context = React.useContext(ViewportContext);
    if (!context) {
        throw new Error('useViewport must be used within a ViewportContextProvider');
    }
    return context;
};

export const ViewportContextProvider = function (props: any) {
    const [isMobile, setMobile] = useState(isMobileView());
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const context: ViewportInfo = useMemo(
        () => ({ isMobile, width: size.width, height: size.height }),
        [size, isMobile]
    );
    useEffect(() => {
        const checkMobile = () => {
            setMobile(isMobileView());
            setSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    });
    return <ViewportContext.Provider {...props} value={context} />;
};
