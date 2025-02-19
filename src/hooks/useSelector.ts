import { useContext, useDebugValue } from 'react'

// @ts-ignore
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

import { useReduxContext as useDefaultReduxContext } from './useReduxContext'
import { ReactReduxContext } from '../components/Context'
import { DefaultRootState, EqualityFn } from '../types'

const refEquality: EqualityFn<any> = (a, b) => a === b

/**
 * Hook factory, which creates a `useSelector` hook bound to a given context.
 *
 * @param {React.Context} [context=ReactReduxContext] Context passed to your `<Provider>`.
 * @returns {Function} A `useSelector` hook bound to the specified context.
 */
export function createSelectorHook(
  context = ReactReduxContext
): <TState = DefaultRootState, Selected = unknown>(
  selector: (state: TState) => Selected,
  equalityFn?: EqualityFn<Selected>
) => Selected {
  const useReduxContext =
    context === ReactReduxContext
      ? useDefaultReduxContext
      : () => useContext(context)

  return function useSelector<TState, Selected extends unknown>(
    selector: (state: TState) => Selected,
    equalityFn: EqualityFn<Selected> = refEquality
  ): Selected {
    if (process.env.NODE_ENV !== 'production') {
      if (!selector) {
        throw new Error(`You must pass a selector to useSelector`)
      }
      if (typeof selector !== 'function') {
        throw new Error(`You must pass a function as a selector to useSelector`)
      }
      if (typeof equalityFn !== 'function') {
        throw new Error(
          `You must pass a function as an equality function to useSelector`
        )
      }
    }

    const { store } = useReduxContext()!

    const selectedState = useSyncExternalStoreWithSelector(
      store.subscribe,
      store.getState,
      // TODO Need a server-side snapshot here
      store.getState,
      selector,
      equalityFn
    )

    useDebugValue(selectedState)

    return selectedState
  }
}

/**
 * A hook to access the redux store's state. This hook takes a selector function
 * as an argument. The selector is called with the store state.
 *
 * This hook takes an optional equality comparison function as the second parameter
 * that allows you to customize the way the selected state is compared to determine
 * whether the component needs to be re-rendered.
 *
 * @param {Function} selector the selector function
 * @param {Function=} equalityFn the function that will be used to determine equality
 *
 * @returns {any} the selected state
 *
 * @example
 *
 * import React from 'react'
 * import { useSelector } from 'react-redux'
 *
 * export const CounterComponent = () => {
 *   const counter = useSelector(state => state.counter)
 *   return <div>{counter}</div>
 * }
 */
export const useSelector = /*#__PURE__*/ createSelectorHook()
