import GameControls from '~/components/GameControls';

import type { Lobby, User } from "@prisma/client";

import { UserPlus } from 'react-feather';
import type { Dispatch, SetStateAction } from "react";

const GameView = (props: {
    lobby: Lobby,
    players: Array<User>,
    localPlayer: User,
    openPlayerList: () => void,
    roundEnded: boolean,
    word: string,
    setWord: Dispatch<SetStateAction<string>>,
    wordSubmitted: boolean,
    setWordSubmitted: Dispatch<SetStateAction<boolean>>}) => {
  const { lobby, players, localPlayer, roundEnded, openPlayerList, word, setWord, wordSubmitted, setWordSubmitted } = props;
  
  return (
    <div className='flex flex-col content-center justify-center h-full w-full my-8'>
      <button onClick={() => openPlayerList()} className='fixed right-0 top-0 p-2 text-stone-200 m-4 bg-stone-700 hover:bg-stone-500 rounded-md shadow-xl'>
        <UserPlus size={24} />
      </button>
      <GameControls lobby={lobby} players={players} playerId={localPlayer.id} roundEnded={roundEnded} word={word} setWord={setWord} wordSubmitted={wordSubmitted} setWordSubmitted={setWordSubmitted} />
    </div>
  );
};

export default GameView;