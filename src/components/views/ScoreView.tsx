import GameControls from '~/components/GameControls';
import LeaderControls from '~/components/LeaderControls';

import type { Lobby, User } from '@prisma/client';

import { Star } from 'react-feather';

const GameView = (props: {lobby: Lobby, localPlayer: User }) => {
  const { lobby, localPlayer } = props;
  
  return (
    <div className='flex flex-col content-center justify-center h-full w-full'>
      <div className='fixed left-0 top-0 flex text-stone-200 m-4 p-2'>
        <Star size={24} />
        <p className='text-2xl ml-2'>
          {localPlayer.score}
        </p>
      </div>

      

      <div className={'flex w-full ' + (lobby.currentWord?.startsWith('_') ? 'flex-col-reverse' : 'flex-col')}>
        <h4 className='text-[9vw] text-center break-words text-stone-500'>{lobby.currentWord?.replace('_', '')}</h4>
        <h2 className='text-[14vw] font-bold text-center break-words py-4 my-4 rounded-lg bg-stone-800'>{localPlayer.submittedWord}</h2>
      </div>
    </div>
  );
};

export default GameView;