import type { Lobby, User } from "@prisma/client";

import GameControls from '~/components/GameControls';

import { UserPlus, Star } from 'react-feather';
import { Dispatch, SetStateAction } from "react";

const GameView = (props: {
    lobby: Lobby,
    localPlayer: User,
    openPlayerList: () => void
    word: string,
    setWord: Dispatch<SetStateAction<string>>,
    wordSubmitted: boolean,
    setWordSubmitted: Dispatch<SetStateAction<boolean>>}) => {
  const { lobby, localPlayer, openPlayerList, word, setWord, wordSubmitted, setWordSubmitted } = props;
  
  return (
    <div className='flex flex-col content-center justify-center h-full w-full'>
      <div className='fixed left-0 top-0 flex text-stone-200 m-4 p-2'>
        <Star size={24} />
        <p className='text-2xl ml-2'>
          {localPlayer.score}
        </p>
      </div>
      <button onClick={() => openPlayerList()} className='fixed right-0 top-0 p-2 text-stone-200 m-4 bg-stone-700 hover:bg-stone-500 rounded-md shadow-xl'>
        <UserPlus size={24} />
      </button>

      <GameControls lobby={lobby} playerId={localPlayer.id} word={word} setWord={setWord} wordSubmitted={wordSubmitted} setWordSubmitted={setWordSubmitted} />
    </div>
  );
};

export default GameView;