import { type AppType } from "next/app";
import { useRouter } from 'next/router';
import { AnimatePresence } from "framer-motion";

import { api } from "~/utils/api";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter()
  const pageKey = router.asPath
  
  return (
    <AnimatePresence mode="popLayout" initial={true}>
      <Component key={pageKey} {...pageProps} />
    </AnimatePresence>
  )
};

export default api.withTRPC(MyApp);
