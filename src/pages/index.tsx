import { useRouter } from "next/navigation";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react"

import Button from '~/components/ui/button';

import { api } from "~/utils/api";
import { getOrSetPlayerId } from "~/utils/player";

export default function Home() {
  const lobbyCreateMutation = api.lobby.create.useMutation();
  const router = useRouter();

  const createLobby = async () => {
    try {
      const newLobby = await lobbyCreateMutation.mutateAsync({ playerId: getOrSetPlayerId() });

      router.push(`/play/${newLobby.id}`);
    } catch (error) {
      // TODO display error in UI

      console.log(error);
    }
  }

  return (
    <>
      <Head>
        <title>Mind [blank]</title>
        {/* TODO */}
        <meta name="description" content="fdsa" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="bg-stone-900 text-stone-100 h-full w-full font-poppins flex flex-col items-center justify-center">
          <h1 className='text-4xl my-8'>Game</h1>
          <Button onClick={createLobby} text='Create Lobby' loading={lobbyCreateMutation.isLoading} />
        </div>

        <Analytics />
      </main>
    </>
  );
}
