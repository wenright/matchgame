import { v4 } from "uuid";
import { z } from "zod";
import Pusher from "pusher";

import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCClientError } from "@trpc/client";

export const lobbyRouter = createTRPCRouter({
  join: publicProcedure
    .input(z.object({ lobbyId: z.string().uuid(), playerName: z.string().min(1), playerId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {      
      const lobby = await ctx.db.lobby.update({
        where: {
          id: input.lobbyId,
        },
        data: {
          players: {
            create: {
              id: input.playerId,
              name: input.playerName,
            },
          },
        },
        include: { 
          players: true,
        },
      });

      const pusher = new Pusher({
        appId: "1714608",
        key: env.PUSHER_KEY,
        secret: env.PUSHER_SECRET,
        cluster: "us2",
        useTLS: true
      });

      await pusher.trigger(`lobby-${lobby.id}`, "lobbyUpdated-event", {});
    }),

  create: publicProcedure
    .input(z.object({ playerName: z.string().min(1), playerId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.lobby.create({
        data: {
          id: v4(),
          players: {
            create: {
              id: input.playerId,
              name: input.playerName,
            },
          },
        },
        include: {
          players: true,
        },
      });
    }),

  kick: publicProcedure
    .input(z.object({ lobbyId: z.string().uuid(), playerId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.lobby.update({
        where: {
          id: input.lobbyId,
        },
        data: {
          players: {
            delete: {
              id: input.playerId,
            },
          },
        },
      });
    }),

  get: publicProcedure
    .input(z.object({ lobbyId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.lobby.findUnique({
        where: {
          id: input.lobbyId,
        },
        include: {
          players: true,
        },
      });
    }),

  nextRound: publicProcedure
    .input(z.object({ lobbyId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const lobby = await ctx.db.lobby.update({
        where: {
          id: input.lobbyId,
        },
        data: {
          currentWord: "fad",
        },
        include: {
          players: true,
        },
      });

      if (!lobby) {
        throw new TRPCClientError("Lobby not found");
      }
      
      const pusher = new Pusher({
        appId: "1714608",
        key: env.PUSHER_KEY,
        secret: env.PUSHER_SECRET,
        cluster: "us2",
        useTLS: true
      });

      await pusher.trigger(`lobby-${lobby.id}`, "nextRound-event", {});
    }),
});
