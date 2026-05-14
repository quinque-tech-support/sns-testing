import { render, screen, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/app/components/ThemeContext'
import React from 'react'

const TestComponent = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  )
}

describe('ThemeContext', () => {
  let store: Record<string, string> = {}
  
  beforeEach(() => {
    jest.clearAllMocks()
    store = {}
    const localStorageMock = {
      getItem:  jest.fn((k: string) => store[k] ?? null),
      setItem:  jest.fn((k: string, v: string) => { store[k] = v }),
      clear:    jest.fn(() => { store = {} }),
      removeItem: jest.fn((k: string) => { delete store[k] }),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock, writable: true
    })
    document.documentElement.className = ''
  })

  it('should default to light when nothing in localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('should read dark from localStorage on mount', () => {
    store = { 'gravia-theme': 'dark' }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme').textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should toggle from light to dark', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    act(() => {
      screen.getByText('Toggle').click()
    })

    expect(screen.getByTestId('theme').textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(window.localStorage.setItem).toHaveBeenCalledWith('gravia-theme', 'dark')
  })

  it('should toggle from dark to light', () => {
    store = { 'gravia-theme': 'dark' }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    act(() => {
      screen.getByText('Toggle').click()
    })

    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(window.localStorage.setItem).toHaveBeenCalledWith('gravia-theme', 'light')
  })

  it('should toggle twice and return to original theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    act(() => {
      screen.getByText('Toggle').click()
    })
    act(() => {
      screen.getByText('Toggle').click()
    })

    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('should ignore invalid localStorage value and default to light', () => {
    store = { 'gravia-theme': 'invalid_value' }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme').textContent).toBe('light')
  })
})
