# Supabase 설정 가이드

이 문서는 메모 앱을 Supabase 데이터베이스로 마이그레이션하는 방법을 안내합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인하고 새 프로젝트를 생성합니다.
2. 프로젝트가 생성되면 **Settings** > **API**에서 다음 정보를 확인합니다:
   - Project URL
   - `anon` `public` 키 (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - `service_role` 키 (SUPABASE_SERVICE_ROLE_KEY) - 서버 사이드에서만 사용

## 2. 환경 변수 설정

`.env.local` 파일을 생성하거나 기존 파일에 다음 환경 변수를 추가합니다:

```env
# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role Key (서버 사이드에서만 사용)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 3. 데이터베이스 마이그레이션 적용

### 방법 1: Supabase MCP 사용 (권장)

Supabase MCP가 설정되어 있다면 다음 명령으로 마이그레이션을 적용할 수 있습니다:

```bash
# 마이그레이션 적용
# MCP를 통해 apply_migration을 호출하거나

# Supabase CLI 사용
supabase db push
```

### 방법 2: Supabase CLI 사용

1. [Supabase CLI](https://supabase.com/docs/guides/cli)를 설치합니다.

2. 프로젝트를 Supabase에 연결합니다:

```bash
supabase login
supabase link --project-ref your-project-ref
```

3. 마이그레이션을 적용합니다:

```bash
# 마이그레이션만 적용
supabase db push

# 마이그레이션 + 시드 데이터 적용
supabase db push --include-seed
```

### 방법 3: Supabase Dashboard 사용

1. Supabase Dashboard에서 **SQL Editor**로 이동합니다.
2. `supabase/migrations/20250101000000_create_memos_table.sql` 파일의 내용을 복사하여 실행합니다.
3. `supabase/seed.sql` 파일의 내용을 복사하여 실행합니다 (선택사항).

## 4. 애플리케이션 실행

환경 변수가 설정되고 마이그레이션이 적용되었다면 애플리케이션을 실행합니다:

```bash
npm run dev
```

## 5. 로컬스토리지 데이터 마이그레이션 (선택사항)

기존 로컬스토리지에 저장된 메모가 있다면 Supabase로 마이그레이션할 수 있습니다.

### 브라우저 콘솔에서 실행

브라우저 개발자 도구 콘솔에서 다음 코드를 실행합니다:

```javascript
// 로컬스토리지에서 메모 가져오기
const localMemos = JSON.parse(localStorage.getItem('memo-app-memos') || '[]')

// API를 통해 Supabase로 가져오기
fetch('/api/memos/import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ memos: localMemos }),
})
  .then(res => res.json())
  .then(result => {
    if (result.success) {
      console.log(`${result.importedCount}개의 메모가 성공적으로 가져왔습니다.`)
    } else {
      console.error('마이그레이션 중 오류 발생:', result.errors)
    }
  })
```

자세한 내용은 `src/utils/migration/README.md`를 참조하세요.

## 6. 확인 사항

마이그레이션이 성공적으로 완료되었는지 확인:

1. **Supabase Dashboard**에서 `memos` 테이블이 생성되었는지 확인
2. **시드 데이터**가 올바르게 삽입되었는지 확인
3. **애플리케이션**에서 메모 CRUD 작업이 정상적으로 작동하는지 확인
4. **AI 요약 기능**이 정상적으로 작동하고 데이터베이스에 저장되는지 확인

## 문제 해결

### 환경 변수 오류

환경 변수가 제대로 설정되지 않으면 다음 오류가 발생할 수 있습니다:

```
Supabase 환경 변수가 설정되지 않았습니다.
```

`.env.local` 파일이 프로젝트 루트에 있고, 환경 변수가 올바르게 설정되었는지 확인하세요.

### 마이그레이션 오류

마이그레이션 적용 중 오류가 발생하면:

1. Supabase Dashboard의 **Logs**에서 오류 메시지를 확인합니다.
2. SQL 문법 오류가 있는지 확인합니다.
3. RLS 정책이 올바르게 설정되었는지 확인합니다.

### 데이터베이스 연결 오류

데이터베이스 연결이 실패하면:

1. `NEXT_PUBLIC_SUPABASE_URL`이 올바른지 확인합니다.
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 올바른지 확인합니다.
3. 네트워크 연결을 확인합니다.

## 추가 리소스

- [Supabase 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

