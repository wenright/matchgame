import Timer from '~/components/timer';

import type { Lobby, User } from '@prisma/client';

import Pusher from 'pusher-js';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';

import { api } from '~/utils/api';

const LobbyIdPage = () => {
  const router = useRouter();
  const { pathLobbyId } = router.query;

  const [lobbyId, setLobbyId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');

  const lobbyJoinMutation = api.lobby.join.useMutation();
  const lobbyCreateMutation = api.lobby.create.useMutation();
  const startGameMutation = api.lobby.startGame.useMutation();
  const nextRoundMutation = api.lobby.nextRound.useMutation();
  const lobbyKickMutation = api.lobby.kick.useMutation();
  // Could change to lobbyId !== '' if we want to load immediately
  const { data: lobby, refetch: refetchLobby } = api.lobby.get.useQuery({ lobbyId: lobbyId }, { enabled: false });
  console.log(lobby);

  const utils = api.useUtils();

  Pusher.logToConsole = true;

  const joinLobby = async () => {
    await refetchLobby();

    if (!lobbyId) {
      return;
    }

    try {
      savePlayerName();

      await lobbyJoinMutation.mutateAsync({ lobbyId: lobbyId, playerName: playerName, playerId: playerId });
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
        setLobbyId(newLobby.id);
        await refetchLobby();
      }
    } catch (error) {
      // TODO display error in UI

      console.log(error);
    }
  }

  const startGame = async () => {
    await startGameMutation.mutateAsync({ lobbyId: lobbyId });
  }

  const nextRound = async () => {
    await nextRoundMutation.mutateAsync({ lobbyId: lobbyId });
  }

  const kickPlayer = (playerId: string) => async () => {
    await lobbyKickMutation.mutateAsync({ lobbyId: lobbyId, playerId: playerId });
  };

  const savePlayerName = () => {
    localStorage.setItem('playerName', playerName);
  }

  useEffect(() => {
    if (typeof pathLobbyId !== 'string') {
      return;
    }

    setLobbyId(pathLobbyId);
  }, [pathLobbyId]);

  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) {
      return;
    }
    hasRun.current = true;
    
    setPlayerName(localStorage.getItem('playerName') ?? '');

    let playerId = localStorage.getItem('playerId');
    if (!playerId) {
      playerId = v4();
      localStorage.setItem('playerId', playerId);
    }

    setPlayerId(playerId);

    const pusher = new Pusher('622c76977c5377aae795', {
      cluster: 'us2'
    });

    const channel = pusher.subscribe(`lobby-${lobbyId}`);

    channel.bind('lobbyUpdated-event', async function () {
      console.log('Lobby updated');
      await utils.lobby.get.invalidate({ lobbyId: lobbyId });
    });
    
    channel.bind('roundStarted-event', async function () {
      console.log('Round started');
      await utils.lobby.get.invalidate({ lobbyId: lobbyId });
    });
  }, []);

  return (
    <div>
      {/* This should be an overlay, preventing players from interacting without first joining themselves */}
      <div>
        <h3>Player Name</h3>
        <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} type='text' className='border-2 border-slate-500'></input>
      </div>
      {!lobby &&
        <div className=''>
          <h2>Join Lobby</h2>
          <h3>Lobby ID</h3>
          <input value={lobbyId} onChange={(e) => setLobbyId(e.target.value)} type='text' className='border-2 border-slate-500'></input>
          <button onClick={joinLobby}>Join Lobby</button>
          <button onClick={createLobby}>Create Lobby</button>
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
          {lobby.roundExpiration && 
            <div>
              <h2>Time:</h2>
              <Timer expiration={lobby.roundExpiration} />
            </div>
          }
          {lobby.leaderId === playerId &&
            <div>
              {!lobby.gameStarted && 
                <div>
                  <button onClick={startGame}>Start</button>
                </div>
              }
              {lobby.gameStarted &&
                <div>
                  <button onClick={nextRound}>Next round</button>
                </div>
              }
            </div>
          }
          {/* {lobby.roundExpiration} */}
          <h2>Players</h2>
          <ul>
            {lobby?.players.map((player) => {
              return (
                <li key={player.id} className='flex'>
                  <div className='inline-flex'>
                    <div>{player.name} - {player.score}</div>
                    <button onClick={kickPlayer(player.id)}>❌</button>
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
