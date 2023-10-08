'use client';
import { io } from 'socket.io-client';
import { GameBoard } from './components/GameBoard';
import { useEffect, useState } from 'react';
import random from '@/utils/randomNumber';
import { useRouter } from 'next/navigation';
import { time } from 'console';
import { TimerDrawing } from './components/TimerDrawing';
import { TimerGuessing } from './components/TimerGuessing';
export const socket = io('http://localhost:3001');

export interface pageProps {}

export type DrawLineProps = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
};

const Home = () => {
  const router = useRouter();
  const randomWords = [
    'Elephant',
    'Cat',
    'Bubble',
    'Sunshine',
    'Dog',
    'Computer',
    'Rabbit',
    'Snack',
    'Pen',
    'Book',
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
  const [score, setScore] = useState(0);
  const [opScore, setOpScore] = useState(0);
  //chances to guess the drawing
  const [chances, setChances] = useState(3);
  //display timer

  const [timerDrawing, setTimerDrawing] = useState(30);
  const [timerGuessing, setTimerGuessing] = useState(30);
  //timer started
  const [timerStarted1, setTimerStarted1] = useState(false);
  const [timerStarted2, setTimerStarted2] = useState(false);
  //-----------------------------------------
  function handleClick() {
    const newWord = randomWords[random()];
    setWord(newWord);
    socket.emit('chosen-word', newWord);
    socket.emit('clear');
    setIsPlaying(true);
    setTimerStarted1(true);
  }

  function handleInputChange(e: React.KeyboardEvent<HTMLInputElement>) {
    //Press Escape to erase
    if (e.key === 'Escape') {
      setInput('');
    }
    //checking valid input
    const isValidCharacter =
      /^[a-zA-Z0-9.,!?;:'"()\-+=*/%&\[\]{}|\\<>\s]$/.test(e.key);
    if (isValidCharacter) setInput(() => input + e.key);

    //checking guesses
    if (e.key === 'Enter') {
      if (input == secret) {
        setChances(3);
        const newScore = score + 100;
        setScore(newScore);
        socket.emit('new-score', newScore);
        setIsPlaying(false);
        setSecret('');
        alert('You got it right!');
        setInput('');
      } else {
        const currentChance = chances - 1;
        setChances(currentChance);
        alert('You got it wrong!');
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
    if (score === 300) {
      socket.emit('winner', currName);
    }
    if (opScore === 300) {
      socket.emit('winner', newUser);
    }
    socket.on('game-over', (name: string) => {
      router.push(`/winner?name=${name}`);
    });
    socket.on('new-joined', (name: string) => {
      setNewUser(name);
    });
    socket.on('current-word', (word: string) => {
      setTimerStarted2(true);
      setIsPlaying(false);
      setSecret(word);
    });

    socket.on('next-turn', () => {
      setIsPlaying(true);
    });
    socket.on('op-score', (score: number) => {
      setOpScore(score);
    });

    return () => {
      socket.off('get-users');
    };
  }, []);

  return (
    <div className='w-full'>
      <h1 className='text-4xl mt-12 text-center'>✏️ SketchWar🖌️</h1>
      <div className='w-full m-8'>
        {!hasName && (
          <label className='flex justify-center mt-20'>
            Enter your user name to start!
          </label>
        )}
        {!hasName && (
          <div className='flex justify-center gap-4 mt-6'>
            <input
              type='text'
              onChange={(e) => setNameInput(e.target.value)}
              className='border-2 border-[rgb(2,2,85)] text-[rgb(2, 2, 85)]'
            />
            <button
              className='p-2 border mt-4 cursor-pointer hover:text-white hover:bg-black border-[rgb(2,2,85)] rounded-2xl'
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
        {hasName && (
          <>
            <h2 className='flex justify-center mt-5'>{currName}</h2>
            <h2 className='flex justify-center mt-5'>Points:{score}</h2>
          </>
        )}
        {newUser.length > 0 && (
          <div className='text-center mt-5'>
            <h2 className='flex justify-center mt-5'>Opponent {newUser} </h2>
            <h2 className='flex justify-center mt-5'>Points:{opScore}</h2>
          </div>
        )}
      </div>
      {hasName && (
        <>
          <h2 className='text-3xl mt-12 text-center'>Pick a word</h2>
          {!secret && (
            <div className='flex gap-4 justify-center'>
              {!isPlaying && (
                <button
                  onClick={handleClick}
                  className='p-2 border mt-4 cursor-pointer hover:text-white hover:bg-gradient-to-r from-red-500 via-orange-500 to-purple-500 transition duration-500 ease-in-out border-[rgb(2,2,85)] rounded-2xl'
                >
                  Start game
                </button>
              )}
            </div>
          )}{' '}
        </>
      )}

      {/*  */}
      {timerStarted1 && (
        <h2 className='text-3xl mt-12 text-center'>Current Word: {word}</h2>
      )}
      {timerStarted2 && secret.length > 0 && (
        <h2 className='text-3xl mt-12 text-center'>
          Word Length: {secret.length}
        </h2>
      )}
      {/*  */}
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

      {timerStarted1 && (
        <div className='text-center'>
          <TimerDrawing
            timerDrawing={timerDrawing}
            setTimerDrawing={setTimerDrawing}
            setTimerStarted1={setTimerStarted1}
          />
        </div>
      )}
      {timerStarted2 && secret.length > 0 && (
        <div className='text-center'>
          <TimerGuessing
            timerGuessing={timerGuessing}
            setTimerGuessing={setTimerGuessing}
            setTimerStarted2={setTimerStarted2}
          />
        </div>
      )}
      {hasName && <GameBoard key='word' isPlaying={isPlaying} />}
    </div>
  );
};

export default Home;
