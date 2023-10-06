'use client';
import { useEffect } from 'react';
import { socket } from '@/app/page';
type Props = {
  timerDrawing: number;
  setTimerDrawing: React.Dispatch<React.SetStateAction<number>>;
  setTimerStarted1: React.Dispatch<React.SetStateAction<boolean>>;
};

export const TimerDrawing = ({
  timerDrawing,
  setTimerDrawing,
  setTimerStarted1,
}: Props) => {
  useEffect(() => {
    if (timerDrawing == 0) {
      setTimerStarted1(false);
      socket.emit('clear');
      socket.emit('chosen-word', '');
      setTimerDrawing(3);
      return;
    }
    if (timerDrawing > 0) {
      const newT = timerDrawing - 1;
      const token = setInterval(() => {
        setTimerDrawing(newT);
        clearInterval(token);
      }, 1000);
    }
  }, [timerDrawing]);
  return <div>TimerDrawing : {timerDrawing}</div>;
};
