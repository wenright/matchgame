import Timer from '~/components/timer';
import Button from '~/components/button';
import Input from '~/components/input';
import { Vector3 } from '~/utils/vector3';
import { api } from '~/utils/api';
import { getOrSetPlayerId } from '~/utils/player';

import { TRPCClientError } from '@trpc/client';

import { faTrashCan, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast, { Toaster } from 'react-hot-toast';
import Pusher from 'pusher-js';
import { type Channel } from 'pusher-js';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';

const LobbyIdPage = () => {
  const router = useRouter();
  const { pathLobbyId } = router.query;

  const [joinedLobbyId, setJoinedLobbyId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [word, setWord] = useState<string>('');
  const [wordSubmitted, setWordSubmitted] = useState<boolean>(false);
  const [showWord, setShowWord] = useState<boolean>(false);
  const [flashGreen, setFlashGreen] = useState<boolean>(false);
  const [flashGrey, setFlashGrey] = useState<boolean>(false);
  
  const pusherChannel = useRef<Channel | null>(null);
  const orientation = useRef<Vector3>(new Vector3(0, 0, 0));
  const flipped = useRef<boolean>(false);

  const lobbyJoinMutation = api.lobby.join.useMutation();
  const startGameMutation = api.lobby.startGame.useMutation();
  const nextRoundMutation = api.lobby.nextRound.useMutation();
  const lobbyKickMutation = api.lobby.kick.useMutation();
  const submitWordMutation = api.lobby.submitWord.useMutation();

  const { data: lobby, refetch: refetchLobby } = api.lobby.get.useQuery({ lobbyId: joinedLobbyId }, { enabled: !!joinedLobbyId });
  console.log(lobby);

  Pusher.logToConsole = true;

  const joinLobby = async () => {
    if (pathLobbyId === undefined || typeof pathLobbyId !== 'string') {
      return;
    }

    try {
      savePlayerName();

      await lobbyJoinMutation.mutateAsync({ lobbyId: pathLobbyId, playerName: playerName, playerId: playerId });
      setJoinedLobbyId(pathLobbyId);
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    }
  };

  const startGame = async () => {
    try {
      await startGameMutation.mutateAsync({ lobbyId: lobby?.id ?? '' });
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    }
  }

  const nextRound = async () => {
    try {
      await nextRoundMutation.mutateAsync({ lobbyId: lobby?.id ?? '' });
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    }
  }

  const kickPlayer = (playerId: string) => async () => {
    try {
      await lobbyKickMutation.mutateAsync({ lobbyId: lobby?.id ?? '', playerId: playerId });
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    }
  };

  const submitWord = (playerId: string, word: string) => async () => {
    try {
      await submitWordMutation.mutateAsync({ playerId: playerId, word: word.toLowerCase() });
      setWordSubmitted(true);
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    }
  };

  const savePlayerName = () => {
    localStorage.setItem('playerName', playerName);
  }

  useEffect(() => {    
    setPlayerName(localStorage.getItem('playerName') ?? '');

    setPlayerId(getOrSetPlayerId());

    addEventListener("devicemotion", (event) => {
      const motion = new Vector3(event.rotationRate?.alpha ?? 0, event.rotationRate?.beta ?? 0, event.rotationRate?.gamma ?? 0);
      orientation.current = orientation.current.scale(0.75).add(motion.scale(0.25));

      if (orientation.current.magnitude() > 200) {
        if (!flipped.current && pusherChannel.current) {
          pusherChannel.current.trigger('client-orientation-event', {
            submittedWord: wordSubmitted,
          });

          flipped.current = true;
        }
      }
    });

    return () => {
      removeEventListener("devicemotion", () => ({}));
    }
  }, []);

  useEffect(() => {
    pusherChannel.current = initPusher();

    return () => {
      pusherChannel.current?.unbind_all();
    };
  }, [joinedLobbyId]);

  const initPusher = (): Channel | null => {
    if (!joinedLobbyId) {
      console.log('No lobby ID, cannot subscribe to pusher');
      return null;
    }
    
    const pusher = new Pusher('622c76977c5377aae795', {
      cluster: 'us2'
    });

    console.log('Subscribing to ' + `lobby-${joinedLobbyId}`);
    const channel = pusher.subscribe(`lobby-${joinedLobbyId}`);

    channel.bind('lobbyUpdated-event', async function () {
      console.log('Lobby updated');
      await refetchLobby();
    });

    channel.bind('roundStarted-event', async function () {
      console.log('Round started');
      setWordSubmitted(false);
      setWord('');
      setShowWord(false);
      await refetchLobby();
    });

    channel.bind('roundEnded-event', async function () {
      console.log('Round ended');
      setShowWord(true);
      await refetchLobby();
    });

    channel.bind('client-orientation-event', function (data: { submittedWord: string }) {
      // TODO need to handle show order, not flashing if haven't shown or matched with someone who hasn't shown
      if (data.submittedWord === word) {
        setFlashGreen(true);
      }
    });

    return channel;
  };

  return (
    <div
      className={`${
        flashGreen && "animate-flashGreen"
      } ${
        flashGrey && "animate-flashGrey"
      } bg-stone-900 text-stone-100 h-full w-full font-poppins flex flex-col justify-center items-center p-8`}
      onAnimationEnd={() => {
        setFlashGreen(false);
        setFlashGrey(false);
      }}
    >
      <Toaster />
      {/* This should be an overlay, preventing players from interacting without first joining themselves */}
      {!lobby &&
        <div className=''>
          <h1 className='text-4xl my-8'>Game</h1>
          <div className='my-4'>
            <Input value={playerName} placeholder='Enter your name' stateFn={setPlayerName} />
          </div>
          <Button onClick={joinLobby} text='Join Lobby' loading={lobbyJoinMutation.isLoading} />
        </div>
      }
      {lobby &&
        <div>
          {lobby.gameStarted && 
            <div>
              {lobby.roundExpiration &&
                <div className='fixed text-center text-2xl inset-x-0 top-0 m-4'>
                  <Timer expiration={lobby.roundExpiration} />
                </div>
              }

              {/* Game controls */}
              {!wordSubmitted &&
                <div>
                  <div className='flex flex-col content-center items-center'>
                    <div className={'flex items-center text-lg ' + (lobby.currentWord?.startsWith('_') ? 'flex-row' : 'flex-row-reverse')}>
                      <Input className='w-1/2' value={word} placeholder='' stateFn={setWord} />
                      <h2 className={'text-lg w-1/2 border-2 border-transparent border-b-stone-700 text-stone-500 ' + (lobby.currentWord?.startsWith('_') ? '' : 'text-right')}>{lobby.currentWord?.replace('_', '')}</h2>
                    </div>
                    <Button onClick={submitWord(playerId, word)} text='Submit' loading={submitWordMutation.isLoading} />
                  </div>
                </div>
              }
              {wordSubmitted &&
                <div>
                  {showWord &&
                    <div>
                      <h2 className='text-xl'>{word}</h2>
                    </div>
                  }
                  {!showWord &&
                    <div>
                      <h2>Word submitted, waiting for other players...</h2>
                    </div>
                  }
                </div>
              }
            </div>
          }
          {/* Leader controls */}
          {lobby.leaderId === playerId &&
            <div className='flex flex-col content-center items-center'>
              {!lobby.gameStarted &&
                <div>
                  <Button onClick={startGame} text='Start' loading={startGameMutation.isLoading} />
                </div>
              }
              {lobby.gameStarted && wordSubmitted &&
                <div>
                  <Button onClick={nextRound} text='End round' loading={nextRoundMutation.isLoading} />
                </div>
              }
            </div>
          }
          {/* Player list */}
          <h2>Players</h2>
          <ul>
            {lobby?.players.map((player) => {
              return (
                <li key={player.id} className='flex'>
                  <div className='inline-flex'>
                    <div>{player.name} - {player.score}</div>
                    {player.submittedWord &&
                      <div className='text-green-600 pl-2'><FontAwesomeIcon icon={faCheckCircle} title='Word submitted' /></div>
                    }
                    {lobby.leaderId === playerId &&
                      <button onClick={kickPlayer(player.id)} className='text-red-600 mx-2'>
                        <FontAwesomeIcon icon={faTrashCan} title='Kick player'/>
                      </button>
                    }
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      }
    </div>
  );
};

export default LobbyIdPage;
