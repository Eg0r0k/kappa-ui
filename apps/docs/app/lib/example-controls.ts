import type { ControlValue, ExampleControl, ExampleControls } from '#scripts/lib/example-controls'

import generated from '~/generated/controls.json'

export type { ControlValue, ExampleControl }

const all = generated as ExampleControls

export const findControls = (name: string): ExampleControl[] => all[name]?.controls ?? []

export const defaultsOf = (controls: readonly ExampleControl[]) =>
  Object.fromEntries(controls.map((control) => [control.prop, control.default])) as Record<string, ControlValue>

export const changedProps = (controls: readonly ExampleControl[], values: Readonly<Record<string, ControlValue>>) =>
  Object.fromEntries(
    controls
      .filter((control) => control.prop in values && values[control.prop] !== control.default)
      .map((control) => [control.prop, values[control.prop]!]),
  ) as Record<string, ControlValue>

export const controlKind = (control: ExampleControl) => {
  if (control.values.every((value) => typeof value === 'boolean')) return 'switch'
  return control.values.length <= 5 ? 'segmented' : 'select'
}
