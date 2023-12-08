import { useRouter } from "next/navigation";

import Head from "next/head";

import Button from '~/components/button';

import { api } from "~/utils/api";
import { getOrSetPlayerId } from "~/utils/player";
import Layout from "~/components/Layout";

export default function Home() {
  const lobbyCreateMutation = api.lobby.create.useMutation();
  const router = useRouter();

  const createLobby = async () => {
    try {
      const newLobby = await lobbyCreateMutation.mutateAsync({ playerId: getOrSetPlayerId() });
      if (newLobby.id) {
        console.log(newLobby.id);
      }

      router.push(`/play/${newLobby.id}`);
    } catch (error) {
      // TODO display error in UI

      console.log(error);
    }
  }

  return (
    <Layout>
      <div className="bg-stone-900 text-stone-100 h-full w-full font-poppins flex flex-col items-center justify-center">
        <h1 className='text-4xl my-8'>Game</h1>
        <Button onClick={createLobby} text='Create Lobby' />
      </div>
    </Layout>
  );
}
