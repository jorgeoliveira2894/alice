import { useState } from 'react';
import { APPS, appById, type AppDef } from './apps';
import { AppGrid } from './components/AppTile';
import { Dashboard } from './components/Dashboard';
import { MapsApp, WazeApp } from './components/MapsApp';
import { NotesApp } from './components/NotesApp';
import { RadioApp } from './components/RadioApp';
import { SettingsApp } from './components/SettingsApp';
import { Sidebar } from './components/Sidebar';
import { WeatherApp } from './components/WeatherApp';
import { load, save } from './storage';
import { useCoords } from './useCoords';
import { useRadio } from './useRadio';
import { useWeather } from './useWeather';

const RECENTS_KEY = 'tesla-carplay:recents';
const DEFAULT_RECENTS = ['maps', 'radio', 'spotify'];

export default function App() {
  // 'home' = app grid, 'dashboard' = CarPlay dashboard, otherwise an app id.
  const [view, setView] = useState('home');
  const [recentIds, setRecentIds] = useState<string[]>(() => load(RECENTS_KEY, DEFAULT_RECENTS));
  const coords = useCoords();
  const weather = useWeather(coords);
  // Lives here, not in RadioApp, so music keeps playing on other screens.
  const radio = useRadio();

  const open = (app: AppDef) => {
    const next = [app.id, ...recentIds.filter((id) => id !== app.id)].slice(0, 3);
    setRecentIds(next);
    save(RECENTS_KEY, next);
    if (app.mode === 'navigate' && app.url) window.location.href = app.url;
    else setView(app.id);
  };
  const openId = (id: string) => open(appById(id)!);
  const home = () => setView('home');

  const recents = recentIds.map(appById).filter((a): a is AppDef => Boolean(a));

  const screen = (() => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            coords={coords}
            radio={radio}
            weather={weather}
            onMaps={() => openId('maps')}
            onRadio={() => openId('radio')}
            onWeather={() => openId('weather')}
          />
        );
      case 'maps':
        return <MapsApp coords={coords} onBack={home} />;
      case 'waze':
        return <WazeApp coords={coords} onBack={home} />;
      case 'radio':
        return <RadioApp radio={radio} onBack={home} />;
      case 'weather':
        return <WeatherApp weather={weather} coords={coords} onBack={home} />;
      case 'notes':
        return <NotesApp onBack={home} />;
      case 'settings':
        return <SettingsApp coords={coords} onBack={home} />;
      default:
        return <AppGrid apps={APPS} onOpen={open} />;
    }
  })();

  return (
    <div className="flex h-full">
      <Sidebar
        recents={recents}
        radio={radio}
        onOpen={open}
        onHome={home}
        onDashboard={() => setView('dashboard')}
        onRadio={() => openId('radio')}
        homeActive={view === 'home'}
      />
      <main className="min-w-0 flex-1 p-6">{screen}</main>
    </div>
  );
}
