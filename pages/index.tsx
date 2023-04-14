import LandingPage from "@/components/landing-page/LandingPage";
import TiptapContextProvider from "context/TiptapContext";

export default function Home() {
  return (
    <TiptapContextProvider>
      <LandingPage />
    </TiptapContextProvider>
  );
}
