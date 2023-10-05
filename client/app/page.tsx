'use client';
import { io } from 'socket.io-client';
import { GameBoard } from './components/GameBoard';
import { useEffect, useState } from 'react';
import random from '@/utils/randomNumber';
import { redirect } from 'next/navigation';
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
  //Set the word for the current game
  const [word, setWord] = useState('');
  //secret word for other clients
  const [secret, setSecret] = useState('');
  //input to guess the word
  const [input, setInput] = useState('');
  //input to set user name
  const [currName, setCurrName] = useState('');
  const [hasName, setHasName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  //other users name that joined
  const [newUser, setNewUser] = useState('');
  //state to disable onMouseDown when someone is drawing
  const [isPlaying, setIsPlaying] = useState(false);
  //state to show score
  const [score, setScore] = useState('');
  //chances to guess the drawing
  const [chances, setChances] = useState(3);

  function handleClick() {
    const newWord = randomWords[random()];
    setWord(newWord);
    socket.emit('chosen-word', newWord);
    setIsPlaying(true);
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
        const currentChance = chances - 1;
        setChances(currentChance);
        alert('fking wrong');
        setInput('');
        if (currentChance == 0) {
          socket.emit('clear');
          setSecret('');
          setChances(3);
        }
      }
    }
  }

  useEffect(() => {
    socket.on('new-joined', (name: string) => {
      setNewUser(name);
    });
    socket.on('current-word', (word: string) => {
      setIsPlaying(false);
      setSecret(word);
    });
    return () => {
      socket.off('get-users');
    };
  }, [secret]);

  return (
    <div className='w-full'>
      <h1 className='text-4xl mt-12 text-center'>Home</h1>
      <div className='w-full m-8'>
        <label className='flex justify-center'>Username</label>
        {!hasName && (
          <div className='flex justify-center gap-4'>
            <input
              type='text'
              onChange={(e) => setNameInput(e.target.value)}
              className='border-2 border-black'
            />
            <button
              className='border-2 border-black'
              onClick={() => {
                socket.emit('user-name', nameInput);
                setCurrName(nameInput);
                setHasName(true);
              }}
            >
              {' '}
              Join
            </button>
          </div>
        )}
        {hasName && <h2 className='text-center '>{currName}</h2>}
        {newUser.length > 0 && (
          <div className='text-center'>Opponent: {newUser}</div>
        )}
      </div>
      {hasName && (
        <>
          <h2 className='text-3xl mt-12 text-center'>Pick a word</h2>
          {!secret && (
            <div className='flex gap-4 justify-center'>
              {!isPlaying && (
                <button onClick={handleClick} className='flex justify-center'>
                  Start game
                </button>
              )}
              {word.length > 0 && <h2>Current Word: {word}</h2>}
            </div>
          )}{' '}
        </>
      )}
      {secret.length > 0 && hasName && (
        <h2 className='text-3xl mt-12 text-center'>
          Current Word: {secret.length > 0 ? secret.length : 'Nothing'}
        </h2>
      )}
      {hasName && !isPlaying && secret.length > 0 && (
        <div className='text-center'>
          <input
            type='text'
            value={input}
            className='border border-black'
            onKeyDown={handleInputChange}
          />
          <div>Chances: {chances}</div>
        </div>
      )}
      {hasName && <GameBoard key='word' isPlaying={isPlaying} />}
    </div>
  );
};

export default Home;
