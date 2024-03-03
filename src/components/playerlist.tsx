import { api } from '~/utils/api';
import type { Lobby, User } from "@prisma/client";

import { Trash2, Check, MoreHorizontal, Star } from 'react-feather';
import toast from 'react-hot-toast';
import { TRPCClientError } from '@trpc/client';

export default function PlayerList(props: { className?: string, lobby: Lobby, players: Array<User>, playerId: string, roundEnded: boolean, hideKick?: boolean, hideSubmitStatus?: boolean }) {
  const { className, lobby, playerId, roundEnded, hideKick, hideSubmitStatus } = props;
  let { players } = props;
  
  const lobbyKickMutation = api.lobby.kick.useMutation();

  const winner = players.reduce((prev, current) => {
    return (prev.score > current.score) ? prev : current;
  });

  if (roundEnded) {
    players = players.sort((p1: User, p2: User) => p1.submittedWord?.localeCompare(p2.submittedWord ?? '') ?? 0);
  }

  const kickPlayer = (playerId: string) => async () => {
    try {
      await lobbyKickMutation.mutateAsync({ lobbyId: lobby?.id ?? '', playerId: playerId });
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    }
  };
  
  return (
    <div className={className}>
      <ul>
        {players.map((player) => {
          return (
            <li key={player.id} className={`flex justify-around items-center p-2 my-2 w-full
                ${player.id === playerId ? 'bg-stone-700' : ''}
                ${lobby.gameOver && player.score === winner?.score ? 'bg-yellow-600' : ''}`}>
              <div className='flex flex-1 justify-center'>
                {player.name}
              </div>
              {roundEnded &&
                <div className='flex flex-1 justify-center'>{player.submittedWord}</div>
              }
              <div className='flex flex-1 justify-center'>
                {player.score}
                <Star className='pl-1' size={20} />
              </div>
              {!hideSubmitStatus &&
                <div className='flex flex-1 justify-center'>
                  {player.submittedWord ?
                    <Check className='text-emerald-600' size={16} />
                    :
                    <MoreHorizontal size={16} />
                  }
                </div>
              }
              {lobby.leaderId === playerId && !hideKick &&
                <button onClick={kickPlayer(player.id)} className='text-red-600 mx-2'>
                  <Trash2 size={16} />
                </button>
              }
            </li>
          );
        })}
      </ul>
    </div>
  );
};
