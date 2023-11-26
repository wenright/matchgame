import type { Lobby, User } from '@prisma/client';

import Pusher from 'pusher-js';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';

import { api } from '~/utils/api';

type HydratedLobby = Lobby & {
  players: User[]
}

const safeStorageGet = (str: string): string => {
  if (typeof window === "undefined") {
    return '';
  }

  return localStorage.getItem(str) ?? '';
};

const LobbyIdPage = () => {
  const router = useRouter();
  const { pathLobbyId } = router.query;

  const [lobbyId, setLobbyId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>(safeStorageGet('playerName'));

  const [lobby, setLobby] = useState<HydratedLobby>();

  const lobbyJoinMutation = api.lobby.join.useMutation();
  const lobbyCreateMutation = api.lobby.create.useMutation();

  Pusher.logToConsole = true;

  const joinLobby = async () => {
    if (!lobbyId) {
      return;
    }

    try {
      savePlayerName();

      await lobbyJoinMutation.mutateAsync({ lobbyId: lobbyId, playerName: playerName, playerId: getPlayerId() });
    } catch (error) {
      // TODO display error in UI
      console.log(error);
    }
  };

  const createLobby = async () => {
    try {
      savePlayerName();

      const result = await lobbyCreateMutation.mutateAsync({ playerName: playerName, playerId: getPlayerId() });

      setLobby(result)
    } catch (error) {
      // TODO display error in UI

      console.log(error);
    }
  }

  const getPlayerId = () => {
    const playerId = safeStorageGet('playerId');
    if (playerId) {
      return playerId;
    }

    const newPlayerId = v4();
    localStorage.setItem('playerId', newPlayerId);
    return newPlayerId;
  };

  const savePlayerName = () => {
    localStorage.setItem('playerName', playerName);
  }

  const hasRun = useRef(false);
  useEffect(() => {
    if (typeof pathLobbyId !== 'string' || hasRun.current) {
      return;
    }
    hasRun.current = true;

    setLobbyId(pathLobbyId);

    const pusher = new Pusher('622c76977c5377aae795', {
      cluster: 'us2'
    });

    const channel = pusher.subscribe(`lobby-${pathLobbyId}`);
    channel.bind('playerJoined-event', function () {
      const lobbyGetQuery = api.lobby.get.useQuery({ lobbyId: pathLobbyId }, { enabled: false });

      if (!lobbyGetQuery.data || lobbyGetQuery.isError) {
        return;
      }

      setLobby(lobbyGetQuery.data);
    });
  }, [pathLobbyId]);

  return (
    <div>
      {!lobby &&
        <div className=''>
          <h2>Join Lobby</h2>
          <h3>Player Name</h3>
          <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} type='text' className='border-2 border-slate-500'></input>
          <h3>Lobby ID</h3>
          <input value={lobbyId} onChange={(e) => setLobbyId(e.target.value)} type='text' className='border-2 border-slate-500'></input>
          <button onClick={joinLobby}>Join Lobby</button>
          <button onClick={createLobby}>Create Lobby</button>
        </div>
      }
      {lobby &&
        <div>
          <h1>Lobby ID: {lobby.id}</h1>
          <h2>Current word: { }</h2>
          <h2>Players</h2>
          <ul>
            {lobby.players.map((player) => {
              return (
                <li key={player.id}>{player.name} - {player.score}</li>
              );
            })}
          </ul>
        </div>
      }
    </div>
  );
};

export default LobbyIdPage;
