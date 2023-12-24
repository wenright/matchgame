import { api } from '~/utils/api';
import { getOrSetPlayerId } from '~/utils/player';

import Button from '~/components/button';
import Input from '~/components/input';
import Modal from '~/components/modal';
import LeaderControls from '~/components/leadercontrols';
import GameControls from '~/components/gamecontrols';

import Pusher from 'pusher-js';
import { type Channel } from 'pusher-js';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import PlayerList from '~/components/playerlist';
import { UserPlus, Star } from 'react-feather';
import QRCode from 'react-qr-code';
import { Toaster } from 'react-hot-toast';

const LobbyIdPage = () => {
  const router = useRouter();
  const { pathLobbyId } = router.query;

  const [joinedLobbyId, setJoinedLobbyId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [playerListIsOpen, setPlayerListIsOpen] = useState<boolean>(false);
  const [word, setWord] = useState<string>('');
  const [wordSubmitted, setWordSubmitted] = useState<boolean>(false);
  const [showWord, setShowWord] = useState<boolean>(false);
  const [lobbyUrl, setLobbyUrl] = useState<string>('');

  const pusherChannel = useRef<Channel | null>(null);

  const lobbyJoinMutation = api.lobby.join.useMutation();

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

      const player = lobby?.players?.find(p => p.id === playerId);
      if (player) {
        setWordSubmitted(!!player.submittedWord);

        if (word.length === 0) {
          setWord(player.submittedWord ?? '')
        }
      }
    }
  }, [lobby]);

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

    return channel;
  };

  return (
    <div className={'bg-stone-900 text-stone-100 h-full w-full font-poppins flex flex-col justify-center items-center p-8'}>
      <Toaster />
      <Modal title="Players" open={playerListIsOpen} setOpen={setModalIsOpen} body={
        <>
          <PlayerList lobbyId={pathLobbyId as string} playerId={playerId} />
          <div className='flex content-center justify-center'>
            <QRCode value={lobbyUrl} className='m-8' />
          </div>
        </>
      } />

      {lobby ?
        <div className='flex flex-col content-center justify-center h-full w-full'>
          <div className='fixed left-0 top-0 flex text-stone-200 m-4'>
            <Star size={24} />
            <p className='text-2xl ml-2'>
              {lobby.players.find(p => p.id === playerId)?.score ?? 0}
            </p>
          </div>
          <button onClick={() => setPlayerListIsOpen(true)} className='fixed right-0 top-0 text-stone-200 m-4'>
            <UserPlus size={24} />
          </button>

          {!lobby.gameStarted &&
            <div className='flex flex-col content-center justify-center h-full'>
              <h1 className='text-4xl my-8'>Waiting for game to start</h1>
            </div>
          }

          <GameControls lobby={lobby} playerId={playerId} word={word} setWord={setWord} wordSubmitted={wordSubmitted} setWordSubmitted={setWordSubmitted} showWord={showWord} />
          <LeaderControls lobby={lobby} playerId={playerId} wordSubmitted={wordSubmitted} showWord={showWord} />
        </div>
        :
        <div className=''>
          <h1 className='text-4xl my-8'>Join a Game</h1>
          <div className='my-4'>
            <Input value={playerName} placeholder='Enter your name' stateFn={setPlayerName} onSubmit={joinLobby} />
          </div>
          <Button onClick={joinLobby} text='Join Lobby' loading={lobbyJoinMutation.isLoading} />
        </div>
      }
    </div>
  );
};

export default LobbyIdPage;
