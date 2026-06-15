import { GameProvider, useGame } from './context/GameContext';
import SetupScreen from './screens/SetupScreen';
import GameScreen from './screens/GameScreen';
import EndScreen from './screens/EndScreen';
import RestoreModal from './components/RestoreModal';

function AppContent() {
  const { state } = useGame();

  return (
    <>
      <RestoreModal />
      {state.screen === 'setup' && <SetupScreen />}
      {state.screen === 'game' && <GameScreen />}
      {state.screen === 'end' && <EndScreen />}
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
