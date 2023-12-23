import { api } from '~/utils/api';

import { Trash2, Check } from 'react-feather';
import toast from 'react-hot-toast';
import { TRPCClientError } from '@trpc/client';

export default function PlayerList(props: { className?: string, lobbyId: string, playerId: string }) {
  const lobbyKickMutation = api.lobby.kick.useMutation();

  const { data: lobby } = api.lobby.get.useQuery({ lobbyId: props.lobbyId }, { enabled: !!props.lobbyId });

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
            <li key={player.id} className='flex'>
              <div className='inline-flex'>
                <div>{player.name} - {player.score}</div>
                {player.submittedWord &&
                  <div className='text-green-600 pl-2'><Check size={16} /></div>
                }
                {lobby.leaderId === props.playerId &&
                  <button onClick={kickPlayer(player.id)} className='text-red-600 mx-2'>
                    <Trash2 size={16} />
                  </button>
                }
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
