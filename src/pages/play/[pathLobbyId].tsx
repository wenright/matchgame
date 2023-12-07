import Timer from '~/components/timer';
import Button from '~/components/button';
import Input from '~/components/input';

import { faTrashCan, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Pusher from 'pusher-js';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { api } from '~/utils/api';
import { getOrSetPlayerId } from '~/utils/player';

const LobbyIdPage = () => {
  const router = useRouter();
  const { pathLobbyId } = router.query;

  const [joinedLobbyId, setJoinedLobbyId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [word, setWord] = useState<string>('');
  const [wordSubmitted, setWordSubmitted] = useState<boolean>(false);

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
      // TODO display error in UI
      console.log(error);
    }
  };

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
    await submitWordMutation.mutateAsync({ playerId: playerId, word: word.toLowerCase() });
    setWordSubmitted(true);
  };

  const savePlayerName = () => {
    localStorage.setItem('playerName', playerName);
  }

  useEffect(() => {    
    setPlayerName(localStorage.getItem('playerName') ?? '');

    setPlayerId(getOrSetPlayerId());
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
      setWordSubmitted(false);
      setWord('');
      await refetchLobby();
    });

    return channel;
  };

  return (
    <div className="bg-stone-900 text-stone-100 h-full w-full font-poppins flex flex-col justify-center content-center items-center p-8">
      {/* This should be an overlay, preventing players from interacting without first joining themselves */}
      {!lobby &&
        <div className=''>
          <h1 className='text-4xl my-8'>Game</h1>
          <div className='my-4'>
            <Input value={playerName} placeholder='Enter your name' stateFn={setPlayerName} />
          </div>
          <Button onClick={joinLobby} text='Join Lobby' />
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
                    <Input value={word} placeholder='Enter your word' stateFn={setWord} />
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
              {lobby.gameStarted && wordSubmitted &&
                <div>
                  <Button onClick={nextRound} text='End round' />
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
                      <button onClick={kickPlayer(player.id)} className='text-red-600 mx-2'><FontAwesomeIcon icon={faTrashCan} title='Kick player'/></button>
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
