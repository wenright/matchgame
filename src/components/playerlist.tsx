import { api } from '~/utils/api';

import { Trash2, Check, MoreHorizontal, Star } from 'react-feather';
import toast from 'react-hot-toast';
import { TRPCClientError } from '@trpc/client';

export default function PlayerList(props: { className?: string, lobbyId: string, playerId: string, hideKick?: boolean, hideSubmitted?: boolean }) {
  const lobbyKickMutation = api.lobby.kick.useMutation();

  const { data: lobby } = api.lobby.get.useQuery({ lobbyId: props.lobbyId }, { enabled: !!props.lobbyId });

  const winner = lobby?.players.reduce((prev, current) => {
    return (prev.score > current.score) ? prev : current;
  });

  const kickPlayer = (playerId: string) => async () => {
    try {
      await lobbyKickMutation.mutateAsync({ lobbyId: lobby?.id ?? '', playerId: playerId });
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    }
  };
  
  if (!lobby) {
    return null;
  }
  
  return (
    <div className={props.className}>
      <ul>
        {lobby?.players.map((player) => {
          return (
            <li key={player.id} className={`flex justify-around items-center p-2 my-2 w-full
                ${player.id === props.playerId ? 'bg-stone-700' : ''}
                ${lobby.gameOver &&player.score === winner?.score ? 'bg-yellow-600' : ''}`}>
              <div className='flex flex-1 justify-center'>
                {player.name}
              </div>
              <div className='flex flex-1 justify-center'>
                {player.score}
                <Star className='pl-1' size={20} />
              </div>
              {!props.hideSubmitted &&
                <div className='flex flex-1 justify-center'>
                  {player.submittedWord ?
                    <Check className='text-emerald-600' size={16} />
                    :
                    <MoreHorizontal size={16} />
                  }
                </div>
              }
              {lobby.leaderId === props.playerId && !props.hideKick &&
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
