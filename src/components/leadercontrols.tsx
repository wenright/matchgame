import Button from "~/components/button";
import { api } from '~/utils/api';

import type { Lobby } from "@prisma/client";

const LeaderControls = (props: {lobby: Lobby, playerId: string, wordSubmitted: boolean, showWord: boolean}) => {
  const startRoundMutation = api.lobby.startRound.useMutation();
  const endRoundMutation = api.lobby.endRound.useMutation();

  if (props.lobby.leaderId !== props.playerId) {
    return;
  }
  
  return (
    <div className='fixed inset-x-0 bottom-0 text-stone-200 m-4'>
      <div className='flex justify-center'>
        {!props.lobby.gameStarted &&
          <div>
            <Button onClick={() => startRoundMutation.mutate({ lobbyId: props.lobby.id ?? '' })} text='Start' loading={startRoundMutation.isLoading} />
          </div>
        }
        {props.lobby.gameStarted && props.wordSubmitted &&
          <div>
            {props.showWord ?
              <Button onClick={() => startRoundMutation.mutateAsync({ lobbyId: props.lobby.id ?? '' })} text='Next round' loading={startRoundMutation.isLoading} />
            :
              <Button onClick={() => endRoundMutation.mutateAsync({ lobbyId: props.lobby.id ?? '' })} text='End round' loading={endRoundMutation.isLoading} />
            }
          </div>
        }
      </div>
    </div>
  )
}

export default LeaderControls;
