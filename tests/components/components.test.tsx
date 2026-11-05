// @vitest-environment happy-dom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BrandIcon } from '~/components/BrandIcon'
import { MorphingWord } from '~/components/MorphingWord'

afterEach(cleanup)

describe('BrandIcon', () => {
  it('is decorative unless it has a title', () => {
    const { container } = render(<BrandIcon icon="react" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('becomes an image with an accessible name when titled', () => {
    render(<BrandIcon icon="github" title="GitHub" />)
    expect(screen.getByRole('img', { name: 'GitHub' })).toBeInTheDocument()
  })

  it('uses the icon’s own viewBox and fill rule', () => {
    const { container } = render(<BrandIcon icon="linkedin" />)
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 72 72')
    expect(container.querySelector('path')).toHaveAttribute('fill-rule', 'evenodd')
  })
})

describe('MorphingWord', () => {
  it('cycles through words, reserving the width of the longest', () => {
    vi.useFakeTimers()
    const { container } = render(<MorphingWord words={['a', 'longest', 'mid']} interval={100} />)
    const [sizer, visible] = container.querySelectorAll('span > span')
    expect(sizer).toHaveTextContent('longest')
    expect(visible).toHaveTextContent('a')

    act(() => vi.advanceTimersByTime(100))
    expect(container.querySelectorAll('span > span')[1]).toHaveTextContent('longest')

    act(() => vi.advanceTimersByTime(200))
    expect(container.querySelectorAll('span > span')[1]).toHaveTextContent('a')
    vi.useRealTimers()
  })
})
