import { Prisma } from "@/app/generated/prisma/client";

export type EmailQuery = Prisma.EmailIdentityGetPayload<{
  include: {
    recoveryEmail: {
      select: {
        email: true;
      };
    };
    linkedAccounts: true;
  };
}>;
