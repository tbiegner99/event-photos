import React from 'react';
import Session from 'supertokens-auth-react/recipe/session';
import { UserRoleClaim } from 'supertokens-auth-react/recipe/userroles';

export const RequireRole = (props: {
    roles: string[];
    children: React.ReactNode;
    permissionDenied?: React.ReactNode;
}) => {
    const { roles, children, permissionDenied } = props;
    let claimValue = Session.useClaimValue(UserRoleClaim);
    if (claimValue.loading || !claimValue.doesSessionExist) {
        return null;
    }
    let userRoles = claimValue.value;
    if (Array.isArray(userRoles) && roles.some((r) => userRoles.includes(r))) {
        return children;
    } else {
        return permissionDenied || <div>Permission Denied</div>;
    }
};
