import { api } from '~/utils/api';
import type { Lobby, User } from "@prisma/client";

import { Trash2, Check, MoreHorizontal, Star } from 'react-feather';
import toast from 'react-hot-toast';
import { TRPCClientError } from '@trpc/client';
import CountUp from 'react-countup';
import { useState } from 'react';

export default function PlayerList(props: { className?: string, lobby: Lobby, players: Array<User>, playerId: string, roundEnded: boolean, hideKick?: boolean, hideSubmitStatus?: boolean }) {
  const { className, lobby, playerId, roundEnded, hideKick, hideSubmitStatus } = props;
  let { players } = props;
  
  const winner = players.reduce((prev, current) => {
    return (prev.score > current.score) ? prev : current;
  });

  const wordToColor: Record<string, string> = {};
  let colorIndex = 0;
  for (const player of players) {
    if (player?.submittedWord) {
      let color = 'bg-sky-500';
      
      if (colorIndex === 0) {
        color = 'bg-sky-500';
      } else if (colorIndex === 1) {
        color = 'bg-rose-500';
      } else if (colorIndex === 2) {
        color = 'bg-amber-500';
      } else if (colorIndex === 3) {
        color = 'bg-violet-500';
      }
      wordToColor[player.submittedWord ?? ''] = `${color}`;
      colorIndex++;
    }
  }

  if (roundEnded) {
    players = players.sort((p1: User, p2: User) => p1.submittedWord?.localeCompare(p2.submittedWord ?? '') ?? 0);
  }
  
  return (
    <div className={className}>
      <ul>
        {players.map((player, index) => {
          return <PlayerListItem key={player.id} lobby={lobby} player={player} winner={winner} playerId={playerId} index={index} wordToColor={wordToColor} roundEnded={roundEnded} hideKick={hideKick} hideSubmitStatus={hideSubmitStatus} />;
        })}
      </ul>
    </div>
  );
};

const PlayerListItem = (props: { lobby: Lobby, player: User, winner: User, playerId: string, index: number, wordToColor: Record<string, string>, roundEnded: boolean, hideKick?: boolean, hideSubmitStatus?: boolean }) => {
  const { lobby, player, winner, playerId, index, wordToColor, roundEnded, hideKick, hideSubmitStatus } = props;
  
  const [showPoints, setShowPoints] = useState(false);

  const lobbyKickMutation = api.lobby.kick.useMutation();

  const kickPlayer = (playerId: string) => async () => {
    try {
      await lobbyKickMutation.mutateAsync({ lobbyId: lobby?.id ?? '', playerId: playerId });
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    }
  };

  return (
    <li key={player.id} className={`flex justify-around items-center p-2 my-2 w-full
        ${player.id === playerId ? 'bg-stone-700' : ''}
        ${lobby.gameOver && player.score === winner?.score ? 'bg-yellow-600' : ''}`}>
      <div className='flex flex-1 justify-center'>
        {player.name}
      </div>
      {roundEnded &&
        <div className='flex flex-1 justify-center'>{player.submittedWord}</div>
      }
      <div className='flex flex-1 justify-center relative'>
        {roundEnded ?
          <>
            <CountUp
              start={player.score - player.roundScore}
              end={player.score}
              duration={2}
              delay={index * 0.5}
              onStart={() => setShowPoints(true)}
              onEnd={() => setShowPoints(false)} />
            <Star className='pl-1' size={20} />
            {showPoints && player.roundScore > 0 &&
              <div className={`absolute right-0 rounded-full w-7 h-7 rotate-[20deg] p-1 ${wordToColor[player?.submittedWord ?? '']}`}>+{player.roundScore}</div>
            }
          </>
          :
          <>
            {player.score}
            <Star className='pl-1' size={20} />
          </>
        }
      </div>
      {!hideSubmitStatus &&
        <div className='flex flex-1 justify-center'>
          {player.submittedWord ?
            <Check className='text-emerald-600' size={16} />
            :
            <MoreHorizontal size={16} />
          }
        </div>
      }
      {lobby.leaderId === playerId && !hideKick &&
        <button onClick={kickPlayer(player.id)} className='text-red-600 mx-2'>
          <Trash2 size={16} />
        </button>
      }
    </li>
  );
};
