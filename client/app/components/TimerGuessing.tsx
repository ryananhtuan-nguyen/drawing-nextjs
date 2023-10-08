'use client';

import { useEffect } from 'react';
type Props = {
  timerGuessing: number;
  setTimerGuessing: React.Dispatch<React.SetStateAction<number>>;
  setTimerStarted2: React.Dispatch<React.SetStateAction<boolean>>;
};

export const TimerGuessing = ({
  timerGuessing,
  setTimerGuessing,
  setTimerStarted2,
}: Props) => {
  useEffect(() => {
    if (timerGuessing == 0) {
      setTimerStarted2(false);
      setTimerGuessing(30);
      return;
    }
    if (timerGuessing > 0) {
      const token = setInterval(() => {
        const newT = timerGuessing - 1;
        setTimerGuessing(newT);
        clearInterval(token);
      }, 1000);
    }
  }, [timerGuessing]);
  return <div>TimerGuessing : {timerGuessing}</div>;
};
