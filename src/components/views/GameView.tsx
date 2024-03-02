import type { Lobby, User } from "@prisma/client";

import LeaderControls from '~/components/LeaderControls';
import GameControls from '~/components/GameControls';

import { useEffect, useState } from 'react';
import { UserPlus, Star } from 'react-feather';
import Pusher from 'pusher-js';

const GameView = (props: {
    lobby: Lobby,
    localPlayer: User,
    joinedLobbyId: string,
    lobbyRefetch: () => void,
    openPlayerList: () => void}) => {
  const { lobby, localPlayer, joinedLobbyId, lobbyRefetch, openPlayerList } = props;

  const [word, setWord] = useState<string>('');
  const [wordSubmitted, setWordSubmitted] = useState<boolean>(false);
  const [showWord, setShowWord] = useState<boolean>(false);

  useEffect(() => {
    if (lobby && localPlayer) {
      setWordSubmitted(!!localPlayer.submittedWord);

      if (word.length === 0) {
        setWord(localPlayer.submittedWord ?? '')
      }
    }
  }, [lobby]);

  useEffect(() => {
    const pusher = new Pusher('622c76977c5377aae795', {
      cluster: 'us2'
    });

    console.log('Subscribing to ' + `lobby-${joinedLobbyId}`);
    const channel = pusher.subscribe(`lobby-${joinedLobbyId}`);

    channel.bind('roundStarted-event', async function () {
      console.log('Round started');
      setWordSubmitted(false);
      setWord('');
      setShowWord(false);
      lobbyRefetch();
    });

    channel.bind('roundEnded-event', async function () {
      console.log('Round ended');
      setShowWord(true);
      lobbyRefetch();
    });
  }, []);
  
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

      <GameControls lobby={lobby} playerId={localPlayer.id} word={word} setWord={setWord} wordSubmitted={wordSubmitted} setWordSubmitted={setWordSubmitted} showWord={showWord} />
      <LeaderControls lobby={lobby} playerId={localPlayer.id} wordSubmitted={wordSubmitted} showWord={showWord} />
    </div>
  );
};

export default GameView;