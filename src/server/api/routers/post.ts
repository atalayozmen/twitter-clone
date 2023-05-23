import {  clerkClient } from "@clerk/nextjs";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import type { User } from "@clerk/nextjs/dist/server";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

const filterUsers = ( user: User ) => ({
  id: user.id,
  firstName: user.firstName,
  profileImageUrl: user.profileImageUrl
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
    })
  
    const users = await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    });

    const filteredUsers = users.map(filterUsers);

    return posts.map((post) => {

      const author = filteredUsers.find((user) => user.id === post.authorId);

      if(!author) {
        throw new Error("Author not found");
      }

      return {
        post,
        author,
      };
    });

  }),
  createPost: privateProcedure.input(z.object({content: z.string().emoji().min(1).max(280)})).mutation(async ({ctx, input}) => {
    
    const authorId = ctx.userId;

    const { success } = await ratelimit.limit(authorId);

    if(!success) {
      throw new Error("You are being ratelimited");
    }

    const post = await ctx.prisma.post.create({
      data: {
        content: input.content,
        authorId,
      },
    });

    return post;
  }),
  getUserPosts: publicProcedure.input(z.object({userId: z.string()})).query(async ({ctx, input}) => {

    const posts = await ctx.prisma.post.findMany({
      take: 100,
      where: {
        authorId: input.userId,
      }
    })
  
    const users = await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    });

    const filteredUsers = users.map(filterUsers);

    return posts.map((post) => {

      const author = filteredUsers.find((user) => user.id === post.authorId);

      if(!author) {
        throw new Error("Author not found");
      }

      return {
        post,
        author,
      };
    });


  }),
  getSinglePost: publicProcedure.input(z.object({postId: z.string()})).query(async ({ctx, input}) => {
      
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
      });
  
      if(!post) {
        throw new Error("Post not found");
      }
  
      const author = await clerkClient.users.getUser(post.authorId);
  
      if(!author) {
        throw new Error("Author not found");
      }
  
      return {
        post,
        author
      };
  }),
  
    

});
