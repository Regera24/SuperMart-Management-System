import { useState, useEffect, useCallback } from "react"

/**
 * Custom hook cho data fetching với loading/error states
 */
export function useApi(apiFn, { params = null, immediate = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (overrideParams) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFn(overrideParams || params)
      setData(result)
      return result
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Có lỗi xảy ra"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFn, params])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, []) // eslint-disable-line

  return { data, loading, error, execute, setData }
}

/**
 * Hook cho paginated data
 */
export function usePageApi(apiFn, { initialParams = {} } = {}) {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 20 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const fetch = useCallback(async (overrideParams) => {
    const mergedParams = { ...params, ...overrideParams }
    setLoading(true)
    setError(null)
    try {
      const result = await apiFn(mergedParams)
      setData(result)
      return result
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Có lỗi xảy ra")
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFn, params]) // eslint-disable-line

  useEffect(() => {
    fetch()
  }, [params]) // eslint-disable-line

  const goToPage = (page) => setParams((p) => ({ ...p, page }))
  const setSearch = (search) => setParams((p) => ({ ...p, search, page: 0 }))
  const setFilter = (key, value) => setParams((p) => ({ ...p, [key]: value, page: 0 }))

  return { data, loading, error, fetch, params, setParams, goToPage, setSearch, setFilter }
}
