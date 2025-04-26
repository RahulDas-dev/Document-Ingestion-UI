import { memo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/Button';
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5';

interface TitleBarProps {
  title: string;
}

export const TitleBar = memo(({ title }: TitleBarProps) => {
  const { toggleTheme, isDark } = useTheme();

  const handleToggleTheme = () => {
    toggleTheme();
  };

  return (
    <div className="w-full p-2 border-b bg-zinc-200 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 fixed top-0 left-0 right-0 z-50">
      <div className="container flex justify-between items-center">
        <h1 className="text-lg font-montserrat text-zinc-900 dark:text-white">{title}</h1>

        <Button
          onClick={handleToggleTheme}
          variant="icon"
          size="small"
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {isDark ? <IoSunnyOutline className="w-5 h-5" /> : <IoMoonOutline className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
});
