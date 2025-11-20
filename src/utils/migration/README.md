# 로컬스토리지 → Supabase 마이그레이션 가이드

이 디렉토리에는 로컬스토리지에 저장된 메모 데이터를 Supabase 데이터베이스로 마이그레이션하는 유틸리티가 포함되어 있습니다.

## 사용 방법

### 방법 1: 클라이언트에서 직접 마이그레이션

```typescript
import { importLocalStorageToSupabase } from '@/utils/migration/importLocalStorage'

// 마이그레이션 실행
const result = await importLocalStorageToSupabase()

if (result.success) {
  console.log(`${result.importedCount}개의 메모가 성공적으로 가져왔습니다.`)
} else {
  console.error('마이그레이션 중 오류 발생:', result.errors)
}
```

### 방법 2: API 엔드포인트를 통한 마이그레이션

```typescript
// 로컬스토리지에서 메모 가져오기
import { localStorageUtils } from '@/utils/localStorage'

const localMemos = localStorageUtils.getMemos()

// API를 통해 Supabase로 가져오기
const response = await fetch('/api/memos/import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ memos: localMemos }),
})

const result = await response.json()

if (result.success) {
  console.log(`${result.importedCount}개의 메모가 성공적으로 가져왔습니다.`)
} else {
  console.error('마이그레이션 중 오류 발생:', result.errors)
}
```

## 주의사항

1. **중복 데이터**: 이미 Supabase에 존재하는 메모는 업데이트됩니다. 완전히 새로운 데이터만 가져오려면 먼저 Supabase 데이터를 확인하세요.

2. **ID 충돌**: 로컬스토리지의 UUID와 Supabase의 UUID가 다를 수 있습니다. 마이그레이션 시 새로운 ID가 생성됩니다.

3. **AI 요약**: 로컬스토리지에는 AI 요약이 없을 수 있습니다. 마이그레이션 후 필요시 다시 요약을 생성하세요.

4. **백업**: 마이그레이션 전에 로컬스토리지 데이터를 백업하는 것을 권장합니다.

## 마이그레이션 후

마이그레이션이 완료되면:

1. Supabase에서 데이터가 올바르게 저장되었는지 확인하세요.
2. 앱이 정상적으로 작동하는지 테스트하세요.
3. 모든 것이 정상이면 로컬스토리지 데이터를 삭제할 수 있습니다 (선택사항).

