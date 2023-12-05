import Timer from '~/components/timer';
import Button from '~/components/button';
import Input from '~/components/input';

import type { Lobby, User } from '@prisma/client';

import Pusher from 'pusher-js';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';

import { api } from '~/utils/api';

const LobbyIdPage = () => {
  const router = useRouter();
  const { pathLobbyId } = router.query;

  const [inputLobbyId, setInputLobbyId] = useState<string>(pathLobbyId as string ?? '');
  const [joinedLobbyId, setJoinedLobbyId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [word, setWord] = useState<string>('');
  const [wordSubmitted, setWordSubmitted] = useState<boolean>(false);

  const lobbyJoinMutation = api.lobby.join.useMutation();
  const lobbyCreateMutation = api.lobby.create.useMutation();
  const startGameMutation = api.lobby.startGame.useMutation();
  const nextRoundMutation = api.lobby.nextRound.useMutation();
  const lobbyKickMutation = api.lobby.kick.useMutation();
  const submitWordMutation = api.lobby.submitWord.useMutation();

  const { data: lobby, refetch: refetchLobby } = api.lobby.get.useQuery({ lobbyId: joinedLobbyId }, { enabled: !!joinedLobbyId });
  console.log(lobby);

  const utils = api.useUtils();

  Pusher.logToConsole = true;

  const joinLobby = async () => {
    if (!inputLobbyId) {
      return;
    }

    try {
      savePlayerName();

      await lobbyJoinMutation.mutateAsync({ lobbyId: inputLobbyId, playerName: playerName, playerId: playerId });
      setJoinedLobbyId(inputLobbyId);
    } catch (error) {
      // TODO display error in UI
      console.log(error);
    }
  };

  const createLobby = async () => {
    try {
      savePlayerName();

      const newLobby = await lobbyCreateMutation.mutateAsync({ playerName: playerName, playerId: playerId });
      if (newLobby.id) {
        console.log(newLobby.id);

        setJoinedLobbyId(newLobby.id);
      }
    } catch (error) {
      // TODO display error in UI

      console.log(error);
    }
  }

  const startGame = async () => {
    await startGameMutation.mutateAsync({ lobbyId: lobby?.id ?? '' });
  }

  const nextRound = async () => {
    await nextRoundMutation.mutateAsync({ lobbyId: lobby?.id ?? '' });
  }

  const kickPlayer = (playerId: string) => async () => {
    await lobbyKickMutation.mutateAsync({ lobbyId: lobby?.id ?? '', playerId: playerId });
  };

  const submitWord = (playerId: string, word: string) => async () => {
    await submitWordMutation.mutateAsync({ playerId: playerId, word: word });
    setWordSubmitted(true);
  };

  const savePlayerName = () => {
    localStorage.setItem('playerName', playerName);
  }

  useEffect(() => {
    if (typeof pathLobbyId !== 'string') {
      return;
    }

    setInputLobbyId(pathLobbyId);
  }, [pathLobbyId]);

  useEffect(() => {    
    setPlayerName(localStorage.getItem('playerName') ?? '');

    let playerId = localStorage.getItem('playerId');
    if (!playerId) {
      playerId = v4();
      localStorage.setItem('playerId', playerId);
    }

    setPlayerId(playerId);
  }, []);

  useEffect(() => {
    const channel = initPusher();

    return () => {
      channel?.unbind_all();
    };
  }, [joinedLobbyId]);

  const initPusher = () => {
    if (!joinedLobbyId) {
      console.log('No lobby ID, cannot subscribe to pusher');
      return;
    }
    
    const pusher = new Pusher('622c76977c5377aae795', {
      cluster: 'us2'
    });

    console.log('Subscribing to ' + `lobby-${joinedLobbyId}`);
    const channel = pusher.subscribe(`lobby-${joinedLobbyId}`);

    channel.bind('lobbyUpdated-event', async function () {
      console.log('Lobby updated');
      // await utils.lobby.get.invalidate({});
      await refetchLobby();
    });

    channel.bind('roundStarted-event', async function () {
      console.log('Round started');
      // await utils.lobby.get.invalidate({});
      await refetchLobby();
    });

    return channel;
  };

  return (
    <div className="bg-stone-900 text-stone-100 h-full font-poppins p-4 flex flex-col justify-center content-center items-center">
      {/* This should be an overlay, preventing players from interacting without first joining themselves */}
      {!lobby &&
        <div className=''>
          <h1 className='text-4xl my-8'>Game</h1>
          <div className='m-4'>
            <Input value={playerName} stateFn={setPlayerName} />
          </div>
          <h3>Lobby ID</h3>
          <Input value={inputLobbyId} stateFn={setInputLobbyId} />
          <Button onClick={joinLobby} text='Join Lobby' />
          <Button onClick={createLobby} text='Create Lobby' />
        </div>
      }
      {lobby &&
        <div>
          <h1>Lobby ID: {lobby.id}</h1>
          {playerName &&
            <div>
              <h2>Joined as '{playerName}'</h2>
            </div>
          }
          <h2>Current word: {lobby.currentWord}</h2>
          {lobby.gameStarted && 
            <div>
              {lobby.roundExpiration &&
                <div>
                  <h2>Time:</h2>
                  <Timer expiration={lobby.roundExpiration} />
                </div>
              }

              {/* Game controls */}
              {!wordSubmitted &&
                <div>
                  <h2>Enter your word</h2>
                  <div className='flex flex-col content-center items-center'>
                    <Input value={word} stateFn={setWord} />
                    <Button onClick={submitWord(playerId, word)} text='Submit' />
                  </div>
                </div>
              }
              {wordSubmitted &&
                <div>
                  <h2>Word submitted, waiting for other players...</h2>
                </div>
              }
            </div>
          }
          {/* Leader controls */}
          {lobby.leaderId === playerId &&
            <div className='flex flex-col content-center items-center'>
              {!lobby.gameStarted && 
                <div>
                  <Button onClick={startGame} text='Start' />
                </div>
              }
              {lobby.gameStarted &&
                <div>
                  <Button onClick={nextRound} text='Next round' />
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
                      <div>✅</div>
                    }
                    {lobby.leaderId === playerId &&
                      <button onClick={kickPlayer(player.id)}>❌</button>
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
