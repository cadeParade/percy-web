/*
|-----------------------------------------------------------------------------
| Shadows                                https://tailwindcss.com/docs/shadows
|-----------------------------------------------------------------------------
|
| Here is where you define your shadow utilities. As you can see from
| the defaults we provide, it's possible to apply multiple shadows
| per utility using comma separation.
|
| If a `default` shadow is provided, it will be made available as the non-
| suffixed `.shadow` utility.
|
| Class name: .shadow-{size?}
|
*/

export default {
  'purple-underline': '0 1px 0 var(--purple-600)',
  'input-focus': '0px 0px 8px rgba(158, 102, 191, 0.2);',
  'purple-lg': '0 4px 12px rgba(158, 102, 191, 0.4);',
  default: '0 2px 4px 0 rgba(0,0,0,0.10)',
  md: '0 4px 8px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.08)',
  lg: '0 4px 12px rgba(63, 58, 64, 0.06)',
  inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
  none: 'none'
};
