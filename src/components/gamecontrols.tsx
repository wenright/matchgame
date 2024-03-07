import type { Lobby, User } from "@prisma/client";

import Timer from '~/components/ui/timer';
import PlayerList from '~/components/PlayerList';
import Button from '~/components/ui/button';
import Input from '~/components/ui/input';

import { api } from '~/utils/api';

import type { SetStateAction, Dispatch } from 'react';
import toast from 'react-hot-toast';
import reactStringReplace from 'react-string-replace';

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

  const allSubmitted = players.every((player) => player.submittedWord !== null);

  // Replace player name
  let formattedPhrase = reactStringReplace(lobby.currentPhrase ?? '', '[n]', (match, i) => (
    <span key={'victim'} className='text-yellow-500'>{players.find((player) => player.id === lobby.victimId)?.name}</span>
  ));

  // Replace word
  formattedPhrase = reactStringReplace(formattedPhrase, '[w]', (match, i) => (
    <span key={'word'} className='text-yellow-500 min-w-8'>{word === '' ? '[blank]' : word}</span>
  ));

  if (!lobby.gameStarted || lobby.gameOver) {
    return;
  }
  
  return (
    <div className='flex flex-col justify-center items-center h-full w-full'>
      {lobby.roundExpiration &&
        <div className='fixed text-center text-2xl inset-x-0 top-0 m-4'>
          <Timer expiration={lobby.roundExpiration} />
        </div>
      }

      {wordSubmitted ? (
        <>
          <div className={'text-2xl my-12'}>
            {formattedPhrase}
          </div>
          <div className='w-full rounded-lg bg-stone-800'>
            <PlayerList className='' lobby={lobby} players={players} playerId={playerId} roundEnded={roundEnded} hideKick={true} hideSubmitStatus={roundEnded} />
            
            {!roundEnded && !allSubmitted && 
              <h2 className='text-stone-500 m-4 text-center'>Word submitted, waiting for other players...</h2>
            }
          </div>
        </>
      ) : (
        <div className='w-full'>
          <div className='flex flex-col content-center items-center'>
            <div className={'inline text-2xl flex-row'}>
              {formattedPhrase}
            </div>
            <div className='my-12'>
              <Input
                className='inline-flex border-2 border-transparent text-yellow-500 text-2xl'
                value={word}
                placeholder=''
                stateFn={setWord}
                onSubmit={submitWord(playerId, word)} />
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