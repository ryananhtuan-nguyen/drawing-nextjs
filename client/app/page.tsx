'use client';
import { io } from 'socket.io-client';
import { GameBoard } from './components/GameBoard';
import { useEffect, useState } from 'react';
import random from '@/utils/randomNumber';
export const socket = io('http://localhost:3001');

export interface pageProps {}

export type DrawLineProps = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
};

const Home = () => {
  const randomWords = [
    'Elephant',
    'Harmony',
    'Bubble',
    'Sunshine',
    'Velvet',
    'Enchanting',
    'Serendipity',
    'Tranquil',
    'Radiant',
    'Whimsical',
  ];
  const [word, setWord] = useState('');
  const [secret, setSecret] = useState('');
  const [input, setInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  function handleClick() {
    setWord(randomWords[random()]);
    socket.emit('chosen-word', word);
    setIsPlaying(true);
    const token = setTimeout(() => {
      socket.emit('clear');
      socket.emit('chosen-word', '');
      socket.emit('time-out');
      setIsPlaying(false);
    }, 20000);
  }

  function handleInputChange(e: React.KeyboardEvent<HTMLInputElement>) {
    const isValidCharacter =
      /^[a-zA-Z0-9.,!?;:'"()\-+=*/%&\[\]{}|\\<>\s]$/.test(e.key);
    if (isValidCharacter) setInput(() => input + e.key);
    if (e.key === 'Enter') {
      if (input == secret) {
        alert('fking correct');
        setInput('');
      } else {
        alert('fking wrong');
        setInput('');
      }
    }
  }

  useEffect(() => {
    socket.on('time-out', () => {
      alert('Time is fucking up');
    });
    socket.on('current-word', (word: string) => {
      if (secret.length === 0) setSecret(word);
    });
    return () => {
      socket.off('time-out');
      socket.off('current-word');
    };
  }, [secret]);

  return (
    <div className='w-full'>
      <h1 className='text-4xl mt-12 text-center'>Home</h1>
      <h2 className='text-3xl mt-12 text-center'>Pick a word</h2>
      {!secret && (
        <div className='flex gap-4 justify-center'>
          <button onClick={handleClick} className='flex justify-center'>
            Start game
          </button>
          {word.length > 0 && <h2>Current Word: {word}</h2>}
        </div>
      )}
      {secret.length > 0 && (
        <h2 className='text-3xl mt-12 text-center'>
          Current Word: {secret.length > 0 ? secret.length : 'Nothing'}
        </h2>
      )}
      <div className='text-center'>
        <input
          type='text'
          value={input}
          className='border border-black'
          onKeyDown={handleInputChange}
        />
      </div>
      <GameBoard key='word' isPlaying={isPlaying} />
    </div>
  );
};

export default Home;
