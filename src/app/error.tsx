'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('页面错误:', error);
  }, [error]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center px-4 bg-white dark:bg-black'>
      <div className='text-6xl mb-4'>😵</div>
      <h1 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>出了点问题</h1>
      <p className='text-gray-500 dark:text-gray-500 mb-8 text-center max-w-md'>
        页面加载时发生错误，请尝试刷新
      </p>
      <div className='flex gap-3'>
        <button
          onClick={reset}
          className='px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
        >
          重试
        </button>
        <a
          href='/'
          className='px-6 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-colors'
        >
          返回首页
        </a>
      </div>
    </div>
  );
}
