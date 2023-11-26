import { User } from '@prisma/client';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import { api } from '~/utils/api';

const LobbyIdPage = () => {
  const router = useRouter();
  const { pathLobbyId } = router.query;
  
  const [ lobbyId, setLobbyId ] = useState<string>('');
  const [ playerName, setPlayerName ] = useState<string>('');

  const [ playerList, setPlayerList ] = useState<User[]>([]);

  const [ joined, setJoined ] = useState<boolean>(false);

  const lobbyJoinMutation = api.lobby.join.useMutation();
  const lobbyCreateMutation = api.lobby.create.useMutation();
  
  const joinLobby = async () => {
    if (!lobbyId) {
      return;
    }

    const result = await lobbyJoinMutation.mutateAsync({ lobbyId: lobbyId, playerName: playerName });
    // localStorage.setItem('playerId', result.result.result.data.playerId);
    setPlayerList(result.players);

    setJoined(true);
  };

  const createLobby = async () => {
    const result = await lobbyCreateMutation.mutateAsync({ playerName: playerName });

    console.log(result);
    setLobbyId(result.id);
    setPlayerList(result.players);

    setJoined(true);
  }
  
  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) {
      return;
    }
    hasRun.current = true;

    setLobbyId(pathLobbyId as string);
  }, [pathLobbyId]);

  return (
    <div>
      {!joined && 
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
      {joined &&
        <div>
          <h1>Lobby ID: {lobbyId}</h1>
          <h2>Players</h2>
          <ul>
            {playerList.map((player) => {
              return (
                <li>{player.name} - {player.score}</li>
              );
            })}
          </ul>
        </div>
      }
    </div>
  );
};

export default LobbyIdPage;
