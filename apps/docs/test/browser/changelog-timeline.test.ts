import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'

import ChangelogTimeline from '~/components/ChangelogTimeline.vue'

const releases = [
  {
    package: 'registry' as const,
    version: '0.9.0',
    date: '2026-10-02T18:20:57.000Z',
    entries: [
      { hash: 'f3e1bd4', url: 'https://example.test/f3e1bd4', text: 'New `AlertDialog`: parts.\n\nSecond paragraph.' },
    ],
  },
  { package: 'core' as const, version: '0.8.0', date: '2026-10-01T10:00:00.000Z', entries: [] },
]

it('lists releases newest first as an ordered list, the newest active', () => {
  const wrapper = mount(ChangelogTimeline, { props: { releases }, attachTo: document.body })
  const steps = wrapper.findAll('ol > li')
  expect(steps).toHaveLength(2)
  expect(steps[0]!.attributes('data-state')).toBe('active')
  expect(steps[0]!.text()).toContain('registry 0.9.0')
  expect(steps[0]!.find('time').attributes('datetime')).toBe('2026-10-02T18:20:57.000Z')
  expect(steps[0]!.find('time').text()).toBe('Oct 2, 2026')
  expect(steps[0]!.find('a').attributes('href')).toBe('https://example.test/f3e1bd4')
  expect(steps[0]!.find('code').text()).toBe('AlertDialog')
  expect(steps[0]!.findAll('p')).toHaveLength(2)
  expect(steps[1]!.attributes('data-state')).toBe('inactive')
})
