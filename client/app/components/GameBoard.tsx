'use client';
import { FC, useEffect, useState } from 'react';
import { useDraw } from '@/hooks/useDraw';
import { ChromePicker } from 'react-color';
import { drawLine } from '@/utils/drawLine';
import { pageProps, socket, DrawLineProps } from '../page';

export const GameBoard = ({ isPlaying }: { isPlaying: boolean }) => {
  const [color, setColor] = useState<string>('#000');
  const { canvasRef, onMouseDown, clear } = useDraw(createLine);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');

    // socket.emit('client-ready');
    socket.on('get-canvas-state', () => {
      if (!canvasRef.current?.toDataURL()) return;
      socket.emit('canvas-state', canvasRef.current.toDataURL());
    });

    socket.on('canvas-state-from-server', (state: string) => {
      console.log('received state');
      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
    });

    socket.on(
      'draw-line',
      ({ prevPoint, currentPoint, color }: DrawLineProps) => {
        console.log('hi');
        if (!ctx) return console.log('no ctx here');
        drawLine({ prevPoint, currentPoint, ctx, color });
      }
    );
    socket.on('clear', clear);

    return () => {
      socket.off('get-canvas-state');
      socket.off('canvas-state-from-server');
      socket.off('draw-line');
      socket.off('clear');
    };
  }, [canvasRef]);

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit('draw-line', { prevPoint, currentPoint, color });
    drawLine({ prevPoint, currentPoint, ctx, color });
  }
  return (
    <div className='w-screen h-screen bg-white flex justify-center items-center'>
      <div className='flex flex-col mr-10'>
        <ChromePicker color={color} onChange={(e) => setColor(e.hex)} />
        <button
          type='button'
          className='p-2 border mt-4 cursor-pointer hover:text-white hover:bg-black border-black rounded-2xl text-black'
          onClick={() => socket.emit('clear')}
        >
          Clear canvas
        </button>
        <button
          type='button'
          className='p-2 border mt-4 cursor-pointer hover:text-white hover:bg-black border-black rounded-2xl text-black'
          onClick={() => socket.emit('client-ready')}
        >
          Connect
        </button>
      </div>
      <canvas
        onMouseDown={!isPlaying ? () => {} : onMouseDown}
        ref={canvasRef}
        width={750}
        height={750}
        className='border border-black rounded-md'
      />
    </div>
  );
};
