import { NextFunction, Response } from 'express';
import { SessionRequest } from 'supertokens-node/framework/express';
import UserRoles from 'supertokens-node/recipe/userroles';
export const requireRoles = (allowed: (string | RegExp)[]) => {
  return async (req: SessionRequest, res: Response, next: NextFunction): Promise<void> => {
    const roles = await req.session!.getClaimValue(UserRoles.UserRoleClaim);
    const matchRole = () => {
      for (const role of allowed) {
        const isMatch =
          typeof role === 'string' ? roles?.includes(role) : roles?.some((r) => role.test(r));
        if (isMatch) {
          return true;
        }
      }
      return false;
    };
    for (const role of roles || []) {
      if (matchRole()) {
        next();
        return;
      }
    }
    res.status(403).json({
      message: `You do not have permission to access this resource. Required roles: ${allowed.join(
        ', '
      )}`,
    });
  };
};
