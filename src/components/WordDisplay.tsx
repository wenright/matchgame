import type { Lobby, User } from '@prisma/client';

const WordDisplay = (props: {lobby: Lobby, localPlayer: User }) => {
  const { lobby, localPlayer } = props;

  return (
    <>
      <div className='flex flex-col content-center justify-center h-full w-full'>
        <div className={'flex w-full ' + (lobby.currentWord?.startsWith('_') ? 'flex-col-reverse' : 'flex-col')}>
          <h4 className='text-[9vw] text-center break-words text-stone-500'>{lobby.currentWord?.replace('_', '')}</h4>
          <h2 className='text-[14vw] font-bold text-center break-words py-4 my-4 rounded-lg bg-stone-800'>{localPlayer.submittedWord}</h2>
        </div>
      </div>
    </>
  );
};

export default WordDisplay;