import { supabase } from '@/utils/supabaseClient'
import { Memo, MemoFormData } from '@/types/memo'

export const memoService = {
  // 모든 메모 가져오기
  async getMemos(): Promise<Memo[]> {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching memos:', error)
      throw error
    }

    // Supabase 데이터를 Memo 타입으로 변환
    return (
      data?.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        tags: item.tags || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || []
    )
  },

  // 메모 생성
  async createMemo(formData: MemoFormData): Promise<Memo> {
    const { data, error } = await supabase
      .from('memos')
      .insert({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags || [],
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating memo:', error)
      throw error
    }

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  // 메모 업데이트
  async updateMemo(id: string, formData: MemoFormData): Promise<Memo> {
    const { data, error } = await supabase
      .from('memos')
      .update({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags || [],
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating memo:', error)
      throw error
    }

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  // 메모 삭제
  async deleteMemo(id: string): Promise<void> {
    const { error } = await supabase.from('memos').delete().eq('id', id)

    if (error) {
      console.error('Error deleting memo:', error)
      throw error
    }
  },

  // 특정 메모 가져오기
  async getMemoById(id: string): Promise<Memo | null> {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // 데이터를 찾을 수 없음
        return null
      }
      console.error('Error fetching memo:', error)
      throw error
    }

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  // AI 요약 업데이트
  async updateAiSummary(id: string, summary: string): Promise<void> {
    const { error } = await supabase
      .from('memos')
      .update({ ai_summary: summary })
      .eq('id', id)

    if (error) {
      console.error('Error updating AI summary:', error)
      throw error
    }
  },

  // 메모 검색
  async searchMemos(query: string): Promise<Memo[]> {
    const searchPattern = `%${query}%`
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .or(
        `title.ilike.${searchPattern},content.ilike.${searchPattern}`
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching memos:', error)
      throw error
    }

    // 태그 검색은 클라이언트 사이드에서 필터링
    const results = data || []
    const filteredResults = results.filter(item => {
      const matchesTitle = item.title?.toLowerCase().includes(query.toLowerCase())
      const matchesContent = item.content?.toLowerCase().includes(query.toLowerCase())
      const matchesTags = item.tags?.some((tag: string) =>
        tag.toLowerCase().includes(query.toLowerCase())
      )
      return matchesTitle || matchesContent || matchesTags
    })

    return filteredResults.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      tags: item.tags || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))
  },

  // 카테고리별 메모 가져오기
  async getMemosByCategory(category: string): Promise<Memo[]> {
    const query = supabase.from('memos').select('*').order('created_at', {
      ascending: false,
    })

    if (category !== 'all') {
      query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching memos by category:', error)
      throw error
    }

    return (
      data?.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        tags: item.tags || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || []
    )
  },
}

