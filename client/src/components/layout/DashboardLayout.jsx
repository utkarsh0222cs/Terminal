import { useState, useCallback } from 'react';
import Header from './Header';

export default function DashboardLayout({ children }) {
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  const toggleLeft = useCallback(() => setLeftDrawerOpen(p => !p), []);
  const toggleRight = useCallback(() => setRightDrawerOpen(p => !p), []);
  const closeLeft = useCallback(() => setLeftDrawerOpen(false), []);
  const closeRight = useCallback(() => setRightDrawerOpen(false), []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header
        onToggleLeftDrawer={toggleLeft}
        onToggleRightDrawer={toggleRight}
      />
      <main className="flex-1 overflow-hidden">
        {typeof children === 'function'
          ? children({ leftDrawerOpen, rightDrawerOpen, closeLeft, closeRight })
          : children
        }
      </main>
    </div>
  );
}
