import { useRef, useState, useEffect } from 'react'

export const Counter = () => {
  const [count, setCount] = useState(0)
  const prevCountRef = useRef(0)

  useEffect(() => {
    // 先记录上一次的值，再更新当前值
    prevCountRef.current = count
  }, [count])

  const prevCount = prevCountRef.current

  return (
    <div>
      <p>
        当前: {count}, 上一次: {prevCount}
      </p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  )
}
