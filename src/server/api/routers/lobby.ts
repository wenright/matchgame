import { init } from '@paralleldrive/cuid2';
import { z } from "zod";
import Pusher from "pusher";

import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCClientError } from "@trpc/client";

import getRandomWord from "~/server/words";

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

const createId = init({
  length: 4,
});

export const lobbyRouter = createTRPCRouter({
  join: publicProcedure
    .input(z.object({ lobbyId: z.string().length(4), playerName: z.string().min(1), playerId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const lobby = await ctx.db.lobby.findUnique({
        where: {
          id: input.lobbyId,
        },
      });

      if (!lobby) {
        throw new TRPCClientError("Lobby ID not found");
      }

      const existingPlayer = await ctx.db.user.findUnique({
        where: {
          id: input.playerId,
        },
      });
      
      await ctx.db.user.upsert({
        create: {
          id: input.playerId,
          name: input.playerName,
          lobbyId: input.lobbyId,
        },
        update: {
          name: input.playerName,
          lobbyId: input.lobbyId,
          score: existingPlayer?.lobbyId === input.lobbyId ? existingPlayer.score : 0,
          submittedWord: existingPlayer?.lobbyId === input.lobbyId ? existingPlayer.submittedWord : null,
        },
        where: {
          id: input.playerId,
        },
      });

      await ctx.db.lobby.update({
        where: {
          id: input.lobbyId,
        },
        data: {
          players: {
            connect: {
              id: input.playerId,
            },
          },
        },
        include: {
          players: true,
        },
      });

      await triggerEvent(input.lobbyId, "lobbyUpdated-event");
    }),

  create: publicProcedure
    .input(z.object({ playerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.lobby.deleteMany({
        where: {
          leaderId: input.playerId,
        },
      });
      
      return await ctx.db.lobby.create({
        data: {
          id: createId(),
          leaderId: input.playerId,
        },
      });
    }),

  kick: publicProcedure
    .input(z.object({ lobbyId: z.string().length(4), playerId: z.string().uuid() }))
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
    .input(z.object({ lobbyId: z.string().length(4) }))
    .query(async ({ ctx, input }) => {
      // TODO exclude player ID
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
  startRound: publicProcedure
    .input(z.object({ lobbyId: z.string().length(4) }))
    .mutation(async ({ ctx, input }) => {
      const players = await ctx.db.user.findMany({
        where: {
          lobbyId: input.lobbyId,
        },
      });

      // Clear players' words
      for (const player of players) {
        await ctx.db.user.update({
          where: {
            id: player.id,
          },
          data: {
            submittedWord: null,
          },
        });
      }

      const previousWords = await ctx.db.lobby.findUnique({
        where: {
          id: input.lobbyId,
        },
        select: {
          previousWords: true,
        },
      });

      const newWord = getRandomWord(previousWords?.previousWords ?? []);

      const lobby = await ctx.db.lobby.findUnique({
        where: {
          id: input.lobbyId,
        },
      });

      // Clear out player's scores if the game is over
      if (lobby?.gameOver) {
        for (const player of players) {
          await ctx.db.user.update({
            where: {
              id: player.id,
            },
            data: {
              score: 0,
            },
          });
        }
      } else {
        let gameOver = false;
        for (const player of players) {
          if (player.score >= 12) {
            gameOver = true;
          }
        }

        if (gameOver) {
          await ctx.db.lobby.update({
            where: {
              id: input.lobbyId,
            },
            data: {
              gameStarted: false,
              gameOver: true,
              roundOver: false
            },
          });

          await triggerEvent(input.lobbyId, "roundStarted-event");
          return;
        }
      }

      await ctx.db.lobby.update({
        where: {
          id: input.lobbyId,
        },
        data: {
          currentWord: newWord,
          previousWords: {
            push: newWord,
          },
          gameStarted: true,
          gameOver: false,
          roundOver: false,
        },
        include: {
          players: true,
        },
      });

      await triggerEvent(input.lobbyId, "roundStarted-event");
    }),

  endRound: publicProcedure
    .input(z.object({ lobbyId: z.string().length(4) }))
    .mutation(async ({ ctx, input }) => {
      const players = await ctx.db.user.findMany({
        where: {
          lobbyId: input.lobbyId,
        },
      });

      await ctx.db.lobby.update({
        where: {
          id: input.lobbyId,
        },
        data: {
          roundOver: true,
        },
      });

      // Map words to number of matches
      const wordsToMatches = new Map<string, number>();
      for (const player of players) {
        if (player.submittedWord === null || player.submittedWord === "") {
          continue;
        }

        const word = String(player.submittedWord).toLowerCase().trim();

        wordsToMatches.set(String(word), (wordsToMatches.get(String(word)) ?? 0) + 1);
      }

      // Calculate scores
      // Players get 2 points if their word matches exactly 1 other player's word
      // Players get 1 point if their word matches 2 or more other players' words
      for (const player of players) {
        if (player.submittedWord === null || player.submittedWord === "") {
          continue;
        }

        const word = String(player.submittedWord).toLowerCase().trim();

        const matches = wordsToMatches.get(String(word)) ?? 0;
        const score = matches === 2 ? 2 : matches > 2 ? 1 : 0;

        await ctx.db.user.update({
          where: {
            id: player.id,
          },
          data: {
            score: {
              increment: score,
            },
            roundScore: score,
          },
        });
      }
      
      await triggerEvent(input.lobbyId, "roundEnded-event");
    }),

  submitWord: publicProcedure
    .input(z.object({ playerId: z.string().uuid(), word: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const player = await ctx.db.user.update({
        where: {
          id: input.playerId,
        },
        data: {
          submittedWord: input.word,
        },
      });

      if (player.lobbyId !== null) {
        await triggerEvent(player.lobbyId, "lobbyUpdated-event");
      }
    }),
});
