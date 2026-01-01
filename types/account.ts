import { Prisma } from "@/app/generated/prisma/client";

export type AccountQuery = Prisma.SavedAccountGetPayload<{
  include: {
    group: {
      select: {
        id: true;
        name: true;
      };
    };
    emailIdentity: {
      select: {
        email: true;
        name: true;
      };
    };
  };
}>;
