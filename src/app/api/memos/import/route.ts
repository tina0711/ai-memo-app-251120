import { NextRequest, NextResponse } from 'next/server'
import { importMemosToSupabase } from '@/utils/migration/importLocalStorage'
import { Memo } from '@/types/memo'

export async function POST(request: NextRequest) {
  try {
    const { memos } = await request.json()

    if (!Array.isArray(memos)) {
      return NextResponse.json(
        { error: '메모 배열이 필요합니다.' },
        { status: 400 }
      )
    }

    // 메모 타입 검증
    const validMemos = memos.filter(
      (memo: any): memo is Memo =>
        memo &&
        typeof memo.title === 'string' &&
        typeof memo.content === 'string' &&
        typeof memo.category === 'string' &&
        Array.isArray(memo.tags)
    )

    if (validMemos.length === 0) {
      return NextResponse.json(
        { error: '유효한 메모가 없습니다.' },
        { status: 400 }
      )
    }

    const result = await importMemosToSupabase(validMemos)

    return NextResponse.json({
      success: result.success,
      importedCount: result.importedCount,
      errors: result.errors,
    })
  } catch (error) {
    console.error('메모 가져오기 오류:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '메모 가져오기 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

