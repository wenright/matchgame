import Button from "~/components/ui/button";

import { api } from '~/utils/api';

import type { Lobby } from "@prisma/client";

const LeaderControls = (props: {lobby: Lobby, playerId: string, wordSubmitted: boolean, showWord: boolean}) => {
  const { lobby, playerId, wordSubmitted, showWord } = props;
  
  const startRoundMutation = api.lobby.startRound.useMutation();
  const endRoundMutation = api.lobby.endRound.useMutation();

  if (lobby.leaderId !== playerId) {
    return;
  }
  
  return (
    <div className='fixed inset-x-0 bottom-0 text-stone-200 m-4'>
      <div className='flex justify-center'>
        {lobby.gameStarted && wordSubmitted &&
          <div>
            {showWord ?
              <Button onClick={() => startRoundMutation.mutateAsync({ lobbyId: lobby.id ?? '' })} text='Next round' loading={startRoundMutation.isLoading} />
            :
              <Button onClick={() => endRoundMutation.mutateAsync({ lobbyId: lobby.id ?? '' })} text='End round' loading={endRoundMutation.isLoading} />
            }
          </div>
        }
      </div>
    </div>
  )
}

export default LeaderControls;
