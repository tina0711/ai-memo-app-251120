import { localStorageUtils } from '@/utils/localStorage'
import { memoService } from '@/services/memoService'
import { Memo } from '@/types/memo'

/**
 * 로컬스토리지의 메모 데이터를 Supabase로 마이그레이션합니다.
 * @returns 마이그레이션된 메모 개수
 */
export async function importLocalStorageToSupabase(): Promise<{
  success: boolean
  importedCount: number
  errors: string[]
}> {
  const errors: string[] = []
  let importedCount = 0

  try {
    // 로컬스토리지에서 메모 가져오기
    const localMemos = localStorageUtils.getMemos()

    if (localMemos.length === 0) {
      return {
        success: true,
        importedCount: 0,
        errors: ['로컬스토리지에 저장된 메모가 없습니다.'],
      }
    }

    // Supabase에서 기존 메모 확인
    const existingMemos = await memoService.getMemos()
    const existingIds = new Set(existingMemos.map(m => m.id))

    // 로컬스토리지의 각 메모를 Supabase로 가져오기
    for (const memo of localMemos) {
      try {
        // 이미 존재하는 메모는 건너뛰기 (또는 업데이트)
        if (existingIds.has(memo.id)) {
          // 기존 메모 업데이트
          await memoService.updateMemo(memo.id, {
            title: memo.title,
            content: memo.content,
            category: memo.category,
            tags: memo.tags,
          })
        } else {
          // 새 메모 생성 (ID는 Supabase가 생성)
          await memoService.createMemo({
            title: memo.title,
            content: memo.content,
            category: memo.category,
            tags: memo.tags,
          })
        }
        importedCount++
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `메모 "${memo.title}" 가져오기 실패`
        errors.push(errorMessage)
        console.error(`Failed to import memo ${memo.id}:`, error)
      }
    }

    return {
      success: errors.length === 0,
      importedCount,
      errors,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : '로컬스토리지 데이터 가져오기 중 오류가 발생했습니다.'
    errors.push(errorMessage)
    console.error('Failed to import localStorage data:', error)

    return {
      success: false,
      importedCount,
      errors,
    }
  }
}

/**
 * 로컬스토리지 데이터를 Supabase로 마이그레이션하는 API 엔드포인트용 함수
 * @param memos 마이그레이션할 메모 배열
 * @returns 마이그레이션 결과
 */
export async function importMemosToSupabase(
  memos: Memo[]
): Promise<{
  success: boolean
  importedCount: number
  errors: string[]
}> {
  const errors: string[] = []
  let importedCount = 0

  try {
    for (const memo of memos) {
      try {
        await memoService.createMemo({
          title: memo.title,
          content: memo.content,
          category: memo.category,
          tags: memo.tags,
        })
        importedCount++
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `메모 "${memo.title}" 가져오기 실패`
        errors.push(errorMessage)
        console.error(`Failed to import memo ${memo.id}:`, error)
      }
    }

    return {
      success: errors.length === 0,
      importedCount,
      errors,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : '메모 가져오기 중 오류가 발생했습니다.'
    errors.push(errorMessage)
    console.error('Failed to import memos:', error)

    return {
      success: false,
      importedCount,
      errors,
    }
  }
}

