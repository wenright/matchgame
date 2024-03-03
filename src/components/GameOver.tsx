import PlayerList from '~/components/PlayerList';

import type { Lobby, User } from "@prisma/client";

const GameOver = (props: {lobby: Lobby, players: Array<User>, playerId: string, winners: Array<User>}) => {
  const { lobby, players, playerId, winners } = props;
  
  return (
    <div className='flex flex-col content-center justify-center h-full text-center'>
      <div className='text-4xl my-8'>Game over,
        <p className='inline text-yellow-500'>
          {winners?.map((winner, i, row) => {
            return (
              <span key={winner.id}> {winner.name}{i+1 != row.length ? ',' : ''} </span>
            );
          })}
        </p>
        win{(winners?.length ?? 0) > 1 ? '' : 's'}!
      </div>
      <PlayerList className='my-8' lobby={lobby} players={players} playerId={playerId} roundEnded={true} hideKick={true} hideSubmitStatus={true} />
    </div>
  );
}

export default GameOver;
