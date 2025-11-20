import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { content, memoId } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: '메모 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // Google Gemini AI 클라이언트 초기화
    const genAI = new GoogleGenAI({
      apiKey: apiKey,
    })

    // 메모 요약을 위한 프롬프트 구성
    const prompt = `다음 메모 내용을 간결하고 명확하게 요약해주세요. 핵심 내용과 중요한 포인트들을 포함하여 3-5문장으로 요약해주세요.

메모 내용:
${content}

요약:`

    // Gemini 2.0 Flash 모델로 콘텐츠 생성
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
      config: {
        maxOutputTokens: 200,
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
      },
    })

    const summary = response.candidates?.[0]?.content?.parts?.[0]?.text

    if (!summary) {
      return NextResponse.json(
        { error: '요약을 생성할 수 없습니다.' },
        { status: 500 }
      )
    }

    const trimmedSummary = summary.trim()

    // 메모 ID가 제공된 경우 Supabase에 요약 저장
    if (memoId) {
      try {
        const { error: updateError } = await supabase
          .from('memos')
          .update({ ai_summary: trimmedSummary })
          .eq('id', memoId)

        if (updateError) {
          console.error('Error saving AI summary to database:', updateError)
          // 요약 생성은 성공했지만 저장 실패 시에도 요약은 반환
        }
      } catch (dbError) {
        console.error('Error updating memo with AI summary:', dbError)
        // 요약 생성은 성공했지만 저장 실패 시에도 요약은 반환
      }
    }

    return NextResponse.json({
      summary: trimmedSummary,
      success: true,
    })
  } catch (error) {
    console.error('메모 요약 오류:', error)
    return NextResponse.json(
      { error: '요약 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
