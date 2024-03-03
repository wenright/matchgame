import { api } from '~/utils/api';
import { getOrSetPlayerId } from '~/utils/player';

import Button from '~/components/ui/button';
import Input from '~/components/ui/input';
import Modal from '~/components/ui/modal';
import PlayerList from '~/components/PlayerList';
import GameOver from '~/components/GameOver';
import GameView from '~/components/views/GameView';
import WaitingRoomView from '~/components/views/WaitingRoomView';
import ScoreView from '~/components/views/ScoreView';
import LeaderControls from '~/components/LeaderControls';

import Pusher from 'pusher-js';
import { type Channel } from 'pusher-js';
import { useRouter } from 'next/router';
import { Analytics } from "@vercel/analytics/react"
import { useEffect, useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Toaster } from 'react-hot-toast';
import colors from 'tailwindcss/colors'

const LobbyIdPage = () => {
  const router = useRouter();
  const { pathLobbyId } = router.query;

  const [joinedLobbyId, setJoinedLobbyId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [playerListIsOpen, setPlayerListIsOpen] = useState<boolean>(false);
  const [lobbyUrl, setLobbyUrl] = useState<string>('');
  const [roundEnded, setRoundEnded] = useState<boolean>(false);
  const [word, setWord] = useState<string>('');
  const [wordSubmitted, setWordSubmitted] = useState<boolean>(false);

  const pusherChannel = useRef<Channel | null>(null);

  const lobbyJoinMutation = api.lobby.join.useMutation();

  const { data: lobby, refetch: refetchLobby } = api.lobby.get.useQuery({ lobbyId: joinedLobbyId }, { enabled: !!joinedLobbyId });

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
      console.log(error);
    }
  };

  const savePlayerName = () => {
    localStorage.setItem('playerName', playerName);
  }

  const setModalIsOpen = (isOpen: boolean) => {
    setPlayerListIsOpen(isOpen);
  }

  useEffect(() => {
    setPlayerName(localStorage.getItem('playerName') ?? '');

    setPlayerId(getOrSetPlayerId());
  }, []);

  useEffect(() => {
    pusherChannel.current = initPusher();

    return () => {
      pusherChannel.current?.unbind_all();
    };
  }, [joinedLobbyId]);

  useEffect(() => {
    if (lobby) {
      setLobbyUrl(window.location.href);

      if (localPlayer) {
        setWordSubmitted(!!localPlayer.submittedWord);

        if (word.length === 0) {
          setWord(localPlayer.submittedWord ?? '')
        }
      }
    }
  }, [lobby]);

  const winner = lobby?.players.reduce((prev, current) => (prev.score > current.score) ? prev : current);
  const winners = lobby?.players.filter((player) => player.score === winner?.score);
  const localPlayer = lobby?.players.find((player) => player.id === playerId);
  const leader = lobby?.players.find((player) => player.id === lobby.leaderId);

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
      setRoundEnded(false);

      await refetchLobby();
    });

    channel.bind('roundEnded-event', async function () {
      console.log('Round ended');
      setRoundEnded(true);

      await refetchLobby();
    });

    return channel;
  };

  return (
    <div className={'bg-stone-900 text-stone-100 h-full w-full font-poppins flex flex-col justify-center items-center p-8'}>
      <Toaster />
      <Modal title="Players" open={playerListIsOpen} setOpen={setModalIsOpen} body={
          <>
            <PlayerList lobbyId={pathLobbyId as string} playerId={playerId} />
            <div className='flex content-center justify-center'>
              <QRCode value={lobbyUrl} className='m-8' fgColor={colors.stone[800]} bgColor={colors.stone[200]} />
            </div>
          </>
        } />

      {lobby && localPlayer ?
        <>
          {lobby.gameStarted ? 
            <>
              {lobby.gameOver ?
                <GameOver lobby={lobby} playerId={playerId} winners={winners ?? []} />
                :
                <>
                  {roundEnded ?
                    <ScoreView lobby={lobby} localPlayer={localPlayer} />
                    :
                    <GameView lobby={lobby} localPlayer={localPlayer} openPlayerList={() => setPlayerListIsOpen(true)} word={word} setWord={setWord} wordSubmitted={wordSubmitted} setWordSubmitted={setWordSubmitted} />
                  }

                  {lobby.leaderId == localPlayer.id && wordSubmitted &&
                    <LeaderControls lobby={lobby} roundEnded={roundEnded} />
                  }
                </>
              }
            </>
          :
            <WaitingRoomView lobby={lobby} localPlayer={localPlayer} leader={leader} numPlayers={lobby.players.length} />
          }
        </>
        :
        <div>
          <h1 className='text-4xl my-8 text-center'>Join Game</h1>
          <div className='my-4'>
            <Input value={playerName} placeholder='Enter your name' stateFn={setPlayerName} onSubmit={joinLobby} />
          </div>
          <Button onClick={joinLobby} text='Join Lobby' loading={lobbyJoinMutation.isLoading} />
        </div>
      }

      <Analytics />
    </div>
  );
};

export default LobbyIdPage;
