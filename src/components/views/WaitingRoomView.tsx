import type { User } from "@prisma/client";

const WaitingRoomView = (props: {localPlayer: User|undefined, leader: User|undefined, numPlayers: number}) => {
  const { localPlayer, leader, numPlayers } = props;

  return (
    <div className='flex flex-col content-center justify-center h-full'>
      <h1 className='text-4xl my-8 text-center'>
        {leader?.id === localPlayer?.id ?
          <>
            Click <p className='inline text-yellow-500'>Start</p> to start the game
          </>
          :
          <>
            Waiting for <p className='inline text-yellow-500'>{leader?.name ?? 'leader'}</p> to start the game
          </>
        }
      </h1>
      <div className='flex my-1 text-center justify-center'>
        <div className='mx-0.5 text-lg leading-4 h-4 text-stone-500'>{numPlayers} joined</div>
      </div>
    </div>
  );
}

export default WaitingRoomView;