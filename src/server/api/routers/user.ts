import {  clerkClient } from "@clerk/nextjs";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";




export const usersRouter = createTRPCRouter({
  getUser: publicProcedure.input(z.object({userId: z.string()})).query(async ({ input }) => {
    const user = await clerkClient.users.getUser(input.userId);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        profileImageUrl: user.profileImageUrl,
      },
    };
  }),
  getAllUsers: publicProcedure.query(async () => {
    const users = await clerkClient.users.getUserList({
      limit: 100,
    });

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      profileImageUrl: user.profileImageUrl,
    }));
  }
  ),
  
});
