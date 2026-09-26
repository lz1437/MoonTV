import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center px-4 bg-white dark:bg-black'>
      <div className='text-8xl font-bold text-gray-200 dark:text-gray-800 mb-4'>404</div>
      <h1 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>页面找不到了</h1>
      <p className='text-gray-500 dark:text-gray-500 mb-8 text-center'>
        你访问的页面不存在或已被移动
      </p>
      <Link
        href='/'
        className='px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
      >
        返回首页
      </Link>
    </div>
  );
}
