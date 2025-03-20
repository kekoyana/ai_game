import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../store'
import App from '../App'

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )
    // アプリケーションが正常にレンダリングされることを確認
    expect(document.body).toBeInTheDocument()
  })
}) 