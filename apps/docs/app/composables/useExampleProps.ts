import { type MaybeRefOrGetter, computed, toValue } from 'vue'

import { type ControlValue, changedProps, defaultsOf, findControls } from '~/lib/example-controls'

export const useExampleProps = (name: MaybeRefOrGetter<string>) => {
  const state = useState<Record<string, Record<string, ControlValue>>>('example-props', () => ({}))
  const controls = computed(() => findControls(toValue(name)))
  const values = computed({
    get: () => ({ ...defaultsOf(controls.value), ...state.value[toValue(name)] }),
    set: (next: Record<string, ControlValue>) => {
      state.value = { ...state.value, [toValue(name)]: next }
    },
  })
  const changed = computed(() => changedProps(controls.value, values.value))
  const reset = () => {
    const { [toValue(name)]: _, ...rest } = state.value
    state.value = rest
  }
  return { controls, values, changed, reset }
}
