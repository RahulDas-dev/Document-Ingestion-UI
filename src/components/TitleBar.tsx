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
    <div className="w-full p-2 border-b bg-neutral-200 dark:bg-gray-950 border-gray-200 dark:border-gray-800">
      <div className="container flex justify-between items-center">
        <h1 className="text-lg font-montserrat text-gray-900 dark:text-white">
          {title}
        </h1>
        
        <Button 
          onClick={handleToggleTheme} 
          variant="icon" 
          size="small"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        > 
          {isDark ? <IoSunnyOutline className="w-5 h-5" /> : <IoMoonOutline className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
});