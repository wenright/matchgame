import type { Lobby } from "@prisma/client";

import Timer from '~/components/timer';
import PlayerList from '~/components/playerlist';
import Button from '~/components/button';
import Input from '~/components/input';

import { api } from '~/utils/api';

import type { SetStateAction, Dispatch } from 'react';

const GameControls = (props: {lobby: Lobby, playerId: string, word: string, setWord: Dispatch<SetStateAction<string>>, wordSubmitted: boolean, setWordSubmitted: Dispatch<SetStateAction<boolean>>, showWord: boolean}) => {
  const submitWordMutation = api.lobby.submitWord.useMutation();

  const submitWord = (playerId: string, word: string) => async () => {
    console.log("submitting word");
    console.log(word);
    try {
      await submitWordMutation.mutateAsync({ playerId: playerId, word: word.toLowerCase() });
      props.setWordSubmitted(true);
    } catch (error) {
      console.log(error);
    }
  };

  if (!props.lobby.gameStarted) {
    return;
  }
  
  return (
    <div className='flex items-center h-full w-full'>
      {props.lobby.roundExpiration &&
        <div className='fixed text-center text-2xl inset-x-0 top-0 m-4'>
          <Timer expiration={props.lobby.roundExpiration} />
        </div>
      }

      {props.wordSubmitted ? (
        <div className="w-full py-4 rounded-lg bg-stone-800">
          {props.showWord ?
            <div>
              <h2 className='text-[14vw] font-bold text-center break-words'>{props.word}</h2>
            </div>
          :
            <div>
              <PlayerList className='my-8' lobbyId={props.lobby.id} playerId={props.playerId} hideKick={true} />
              <h2 className='text-stone-500 text-center'>Word submitted, waiting for other players...</h2>
            </div>
          }
        </div>
      ) : (
        <div className="w-full">
          <div className='flex flex-col content-center items-center'>
            <div className={'flex items-center text-lg ' + (props.lobby.currentWord?.startsWith('_') ? 'flex-row' : 'flex-row-reverse')}>
              <Input className='w-1/2' value={props.word} placeholder='' stateFn={props.setWord} onSubmit={submitWord(props.playerId, props.word)} />
              <h2 className={'text-lg w-1/2 border-2 border-transparent border-b-yellow-700 text-yellow-500 ' + (props.lobby.currentWord?.startsWith('_') ? '' : 'text-right')}>{props.lobby.currentWord?.replace('_', '')}</h2>
            </div>
            <div className='fixed inset-x-0 bottom-0 my-8'>
              <Button onClick={submitWord(props.playerId, props.word)} text='Submit' loading={submitWordMutation.isLoading} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameControls;