/// <reference types="vitest" />
import { test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../store'
import App from '../App'

test('renders without crashing', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  )
  // アプリケーションが正常にレンダリングされることを確認
  expect(document.body).toBeInTheDocument()
})