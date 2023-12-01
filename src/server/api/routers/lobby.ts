import { v4 } from "uuid";
import { z } from "zod";
import Pusher from "pusher";

import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCClientError } from "@trpc/client";

import getRandomWord from "~/server/words";

const ROUND_TIMER = 30;

const triggerEvent = async (lobbyId: string, eventName: string) => {
  const pusher = new Pusher({
    appId: "1714608",
    key: env.PUSHER_KEY,
    secret: env.PUSHER_SECRET,
    cluster: "us2",
    useTLS: true
  });

  await pusher.trigger(`lobby-${lobbyId}`, eventName, {});
}

export const lobbyRouter = createTRPCRouter({
  join: publicProcedure
    .input(z.object({ lobbyId: z.string().uuid(), playerName: z.string().min(1), playerId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existingPlayer = await ctx.db.user.findUnique({
        where: {
          id: input.playerId,
        },
      });

      if (existingPlayer) {
        await ctx.db.user.update({
          where: {
            id: input.playerId,
          },
          data: {
            name: input.playerName,
            lobbyId: input.lobbyId,
          },
        });
      } else {
        await ctx.db.lobby.update({
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
      }

      await triggerEvent(input.lobbyId, "lobbyUpdated-event");
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
          leaderId: input.playerId,
          roundExpiration: new Date(Date.now() + 1000 * ROUND_TIMER),
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

      await triggerEvent(input.lobbyId, "lobbyUpdated-event");
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

  // TODO for these, maybe add some authentication, so only the host can start the game
  startGame: publicProcedure
    .input(z.object({ lobbyId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Do we need to check lobby exists?

      const word = getRandomWord([]);

      await ctx.db.lobby.update({
        where: {
          id: input.lobbyId,
        },
        data: {
          currentWord: word,
          previousWords: {
            push: word,
          },
          roundExpiration: new Date(Date.now() + 1000 * ROUND_TIMER),
          gameStarted: true,
        },
      });

      await triggerEvent(input.lobbyId, "roundStarted-event");
    }),

  nextRound: publicProcedure
    .input(z.object({ lobbyId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const previousWords = await ctx.db.lobby.findUnique({
        where: {
          id: input.lobbyId,
        },
        select: {
          previousWords: true,
        },
      });
      
      const word = getRandomWord(previousWords?.previousWords ?? []);
      
      const lobby = await ctx.db.lobby.update({
        where: {
          id: input.lobbyId,
        },
        data: {
          currentWord: word,
          previousWords: {
            push: word,
          },
          roundExpiration: new Date(Date.now() + 1000 * ROUND_TIMER),
        },
        include: {
          players: true,
        },
      });

      if (!lobby) {
        throw new TRPCClientError("Lobby not found");
      }
      
      await triggerEvent(input.lobbyId, "roundStarted-event");
    }),
});
