import type { Lobby, User } from "@prisma/client";

import Timer from '~/components/ui/timer';
import PlayerList from '~/components/PlayerList';
import Button from '~/components/ui/button';
import Input from '~/components/ui/input';

import { api } from '~/utils/api';

import type { SetStateAction, Dispatch } from 'react';
import toast from 'react-hot-toast';

const GameControls = (props: {
    lobby: Lobby,
    players: Array<User>,
    playerId: string,
    roundEnded: boolean,
    word: string,
    setWord: Dispatch<SetStateAction<string>>,
    wordSubmitted: boolean,
    setWordSubmitted: Dispatch<SetStateAction<boolean>>}) => {
  const { lobby, players, playerId, roundEnded, word, setWord, wordSubmitted, setWordSubmitted } = props;
      
  const submitWordMutation = api.lobby.submitWord.useMutation();

  const submitWord = (playerId: string, word: string) => async () => {
    console.log("submitting word", word);

    if (word.length === 0) {
      toast.error('Word cannot be empty');
      return;
    }
    
    try {
      await submitWordMutation.mutateAsync({ playerId: playerId, word: word.toLowerCase() });
      setWordSubmitted(true);
    } catch (error) {
      console.log(error);
    }
  };

  if (!lobby.gameStarted || lobby.gameOver) {
    return;
  }
  
  return (
    <div className='flex items-center h-full w-full'>
      {lobby.roundExpiration &&
        <div className='fixed text-center text-2xl inset-x-0 top-0 m-4'>
          <Timer expiration={lobby.roundExpiration} />
        </div>
      }

      {wordSubmitted ? (
        <div className='w-full'>
          <div className='w-full py-4 rounded-lg bg-stone-800'>
            <PlayerList className='my-8' lobby={lobby} players={players} playerId={playerId} roundEnded={roundEnded} hideKick={true} hideSubmitStatus={roundEnded} />
            
            {!roundEnded && <h2 className='text-stone-500 text-center'>Word submitted, waiting for other players...</h2>}
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className='flex flex-col content-center items-center'>
            <div className={'flex items-center text-2xl ' + (lobby.currentWord?.startsWith('_') ? 'flex-row' : 'flex-row-reverse')}>
              <Input className='w-1/2 text-2xl' value={word} placeholder='' stateFn={setWord} onSubmit={submitWord(playerId, word)} />
              <h2 className={'text-2xl w-1/2 border-2 border-transparent border-b-yellow-700 text-yellow-500 ' + (lobby.currentWord?.startsWith('_') ? '' : 'text-right')}>{lobby.currentWord?.replace('_', '')}</h2>
            </div>
            <div className='fixed inset-x-0 bottom-0 my-8'>
              <Button onClick={submitWord(playerId, word)} text='Submit' loading={submitWordMutation.isLoading} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameControls;