import { NextResponse } from 'next/server';

import { getCacheTime } from '@/lib/config';
import { DoubanItem, DoubanResult } from '@/lib/types';

async function fetchDoubanData(url: string): Promise<{
  subjects: Array<{
    id: string;
    title: string;
    rate: string;
    cover: string;
    url: string;
  }>;
}> {
  const fetchOptions = {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      Referer: 'https://movie.douban.com/',
      Accept: 'application/json, text/plain, */*',
    },
  };

  // 最多重试2次
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (attempt === 1) throw error;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('请求失败');
}

export const runtime = 'edge';

// 电视剧二级分类映射到豆瓣tag
const tvTagMap: Record<string, string> = {
  tv: '热门',
  tv_domestic: '国产剧',
  tv_american: '美剧',
  tv_japanese: '日剧',
  tv_korean: '韩剧',
  tv_animation: '日本动画',
  tv_documentary: '纪录片',
};

// 综艺二级分类映射
const showTagMap: Record<string, string> = {
  show: '综艺',
  show_domestic: '综艺',
  show_foreign: '综艺',
};

// 电影一级分类映射
const moviePrimaryTagMap: Record<string, string> = {
  热门: '热门',
  最新: '最新',
  豆瓣高分: '豆瓣高分',
  冷门佳片: '冷门佳片',
};

// 电影二级地区映射
const movieRegionTagMap: Record<string, string> = {
  全部: '',
  华语: '华语',
  欧美: '欧美',
  韩国: '韩国',
  日本: '日本',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const kind = searchParams.get('kind') || 'movie';
  const category = searchParams.get('category') || '热门';
  const type = searchParams.get('type') || '';
  const pageLimit = parseInt(searchParams.get('limit') || '20');
  const pageStart = parseInt(searchParams.get('start') || '0');

  try {
    let doubanType: string;
    let tag: string;

    if (kind === 'movie') {
      doubanType = 'movie';
      // 电影：一级分类 + 二级地区组合tag
      const primaryTag = moviePrimaryTagMap[category] || '热门';
      const regionTag = movieRegionTagMap[type] || '';
      tag = regionTag ? `${regionTag}` : primaryTag;
      // 如果选了地区，豆瓣的tag是组合形式如"华语 热门"，但search_subjects只支持单个tag
      // 所以优先用地区tag，如果是"全部"则用一级分类tag
      if (regionTag && type !== '全部') {
        tag = regionTag;
      }
    } else if (category === 'show') {
      doubanType = 'tv';
      tag = showTagMap[type] || '综艺';
    } else {
      // 电视剧
      doubanType = 'tv';
      tag = tvTagMap[type] || '热门';
    }

    const target = `https://movie.douban.com/j/search_subjects?type=${doubanType}&tag=${encodeURIComponent(tag)}&sort=recommend&page_limit=${pageLimit}&page_start=${pageStart}`;

    const doubanData = await fetchDoubanData(target);

    const list: DoubanItem[] = (doubanData.subjects || []).map((item) => ({
      id: item.id,
      title: item.title,
      poster: item.cover || '',
      rate: item.rate || '',
      year: '',
    }));

    const response: DoubanResult = {
      code: 200,
      message: '获取成功',
      list: list,
    };

    const cacheTime = await getCacheTime();
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: '获取豆瓣数据失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}
