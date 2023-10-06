'use client'
import { io } from 'socket.io-client'
import { GameBoard } from './components/GameBoard'
import { useEffect, useState } from 'react'
import random from '@/utils/randomNumber'
import { useRouter } from 'next/navigation'

export const socket = io('http://localhost:3001')

export interface pageProps {}

export type DrawLineProps = {
  prevPoint: Point | null
  currentPoint: Point
  color: string
}

const Home = () => {
  const router = useRouter()
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
  ]
  //Set the word for the current game
  const [word, setWord] = useState('')
  //secret word for other clients
  const [secret, setSecret] = useState('')
  //input to guess the word
  const [input, setInput] = useState('')
  //input to set user name
  const [currName, setCurrName] = useState('')
  const [hasName, setHasName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  //other users name that joined
  const [newUser, setNewUser] = useState('')
  //state to disable onMouseDown when someone is drawing
  const [isPlaying, setIsPlaying] = useState(false)
  //state to show score
  const [score, setScore] = useState(0)
  const [opScore, setOpScore] = useState(0)
  //chances to guess the drawing
  const [chances, setChances] = useState(3)
  //display timer
  const [timer, setTimer] = useState(3)
  //timer started
  const [timerStarted, setTimerStarted] = useState(false)
  //-----------------------------------------
  function handleClick() {
    const newWord = randomWords[random()]
    setWord(newWord)
    socket.emit('chosen-word', newWord)
    setIsPlaying(true)
  }

  function handleInputChange(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setInput('')
    }
    const isValidCharacter =
      /^[a-zA-Z0-9.,!?;:'"()\-+=*/%&\[\]{}|\\<>\s]$/.test(e.key)
    if (isValidCharacter) setInput(() => input + e.key)
    if (e.key === 'Enter') {
      if (input == secret) {
        setChances(3)
        const newScore = score + 100
        setScore(newScore)
        socket.emit('new-score', newScore)
        setIsPlaying(false)
        setSecret('')
        alert('fking correct')
        setInput('')
      } else {
        const currentChance = chances - 1
        setChances(currentChance)
        alert('fking wrong')
        setInput('')
        if (currentChance == 0) {
          socket.emit('clear')
          setSecret('')
          setChances(3)
        }
      }
    }
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (score === 200) {
      socket.emit('winner', currName)
    }
    if (opScore === 200) {
      socket.emit('winner', newUser)
    }

    socket.on('game-over', (name: string) => {
      router.push(`/winner?name=${name}`)
    })
    socket.on('new-joined', (name: string) => {
      setNewUser(name)
    })
    socket.on('current-word', (word: string) => {
      setIsPlaying(false)
      setSecret(word)
      if (word.length > 0) {
        setTimerStarted(true)
        const token = setTimeout(() => {
          alert('times up')
          socket.emit('chosen-word', '')
          socket.emit('next-turn')
          setSecret('')
          setTimerStarted(false)
          clearTimeout(token)
        }, 3000)
      }
    })

    socket.on('next-turn', () => {
      setIsPlaying(true)
    })
    socket.on('op-score', (score: number) => {
      setOpScore(score)
    })

    return () => {
      socket.off('get-users')
      if (timer == 0) {
        clearInterval(timeoutId)
        setTimerStarted(false)
        setTimer(3)
      }
    }
  }, [timer, timerStarted])

  return (
    <div className="w-full">
      <h1 className="text-4xl mt-12 text-center">SketchWar🖌️</h1>
      <div className="w-full m-8">
        <label className="flex justify-center mt-20">
          Enter your user name to start!
        </label>
        {!hasName && (
          <div className="flex justify-center gap-4 mt-6">
            <input
              type="text"
              onChange={(e) => setNameInput(e.target.value)}
              className="border-2 border-[rgb(2,2,85)] text-[rgb(2, 2, 85)]"
            />
            <button
              className="p-2 border mt-4 cursor-pointer hover:text-white hover:bg-black border-[rgb(2,2,85)] rounded-2xl"
              onClick={() => {
                socket.emit('user-name', nameInput)
                setCurrName(nameInput)
                setHasName(true)
              }}
            >
              {' '}
              Join
            </button>
          </div>
        )}
        {hasName && (
          <h2 className="text-center mt-5">
            {currName},{score}
          </h2>
        )}
        {newUser.length > 0 && (
          <div className="text-center mt-5">
            Opponent: {newUser},{opScore}
          </div>
        )}
      </div>
      {hasName && (
        <>
          <h2 className="text-3xl mt-12 text-center">Pick a word</h2>
          {!secret && (
            <div className="flex gap-4 justify-center">
              {!isPlaying && (
                <button
                  onClick={handleClick}
                  className="p-2 border mt-4 cursor-pointer hover:text-white hover:bg-black border-[rgb(2,2,85)] rounded-2xl"
                >
                  Start game
                </button>
              )}
              {word.length > 0 && <h2 className="mt-5">Word: {word}</h2>}
            </div>
          )}{' '}
        </>
      )}
      {secret.length > 0 && hasName && (
        <h2 className="text-3xl mt-12 text-center">
          Current Word: {secret.length > 0 ? secret.length : 'Nothing'}
        </h2>
      )}
      {hasName && !isPlaying && secret.length > 0 && (
        <div className="text-center">
          <input
            type="text"
            value={input}
            className="border border-black"
            onKeyDown={handleInputChange}
          />
          <div>Chances: {chances}</div>
        </div>
      )}
      <h1>{timer}</h1>
      {hasName && <GameBoard key="word" isPlaying={isPlaying} />}
    </div>
  )
}

export default Home
