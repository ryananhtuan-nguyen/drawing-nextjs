'use client';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
const Winner = () => {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  return (
    <>
      <div>Winner : {name?.toUpperCase()}</div>
      <Link href='/' className='border-2 border-black py-2 px-4'>
        Start Again
      </Link>
    </>
  );
};

export default Winner;
