import type { User } from '@prisma/client';

const WordDisplay = (props: {localPlayer: User }) => {
  const { localPlayer } = props;

  return (
    <>
      <div className='flex flex-col content-center justify-center h-full w-full'>
        <h2 className='text-[14vw] font-bold text-center break-words py-4 my-4 rounded-lg bg-stone-800'>{localPlayer.submittedWord}</h2>
      </div>
    </>
  );
};

export default WordDisplay;