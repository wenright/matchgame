import Button from "~/components/ui/button";

import { api } from '~/utils/api';

import type { Lobby } from "@prisma/client";

const LeaderControls = (props: {lobby: Lobby, roundEnded: boolean}) => {
  const { lobby, roundEnded } = props;
  
  const startRoundMutation = api.lobby.startRound.useMutation();
  const endRoundMutation = api.lobby.endRound.useMutation();
  
  return (
    <div className='fixed inset-x-0 bottom-0 text-stone-200 m-4'>
      <div className='flex justify-center'>
        <div>
          {roundEnded ?
            <Button onClick={() => startRoundMutation.mutateAsync({ lobbyId: lobby.id ?? '' })} text='Next round' loading={startRoundMutation.isLoading} />
          :
            <Button onClick={() => endRoundMutation.mutateAsync({ lobbyId: lobby.id ?? '' })} text='End round' loading={endRoundMutation.isLoading} />
          }
        </div>
      </div>
    </div>
  )
}

export default LeaderControls;
