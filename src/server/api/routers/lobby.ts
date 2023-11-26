import { v4 } from "uuid";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const lobbyRouter = createTRPCRouter({
  join: publicProcedure
    .input(z.object({ lobbyId: z.string().length(4), playerName: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.lobby.update({
        where: {
          id: input.lobbyId,
        },
        data: {
          players: {
            create: {
              name: input.playerName,
              id: v4(),
            },
          },
        },
        include: { 
          players: true,
        },
      });
    }),

  create: publicProcedure
    .input(z.object({ playerName: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.lobby.create({
        data: {
          id: v4(),
          players: {
            create: {
              name: input.playerName,
              id: v4()
            },
          },
        },
        include: {
          players: true,
        },
      });
    }),
});
