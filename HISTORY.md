# 0.9.4

- NEW: `basis.event.events.*` functions have verbose name in dev mode now (was `anonymous function` before)
- API: `basis.data.property.DataObjectSet` reset `value`/`state` changed flags before set/compute new `value`/`state`, it makes possible trigger recalc `value`/`state` inside event callbacks
- API: `basis.net.rpc` actions handle `abort` event and turn `origin` into `UNDEFINED` state
- API: `basis.net.rpc.callback` was removed ([backward patch](https://gist.github.com/lahmatiy/5891561))
- API: `basis.net.AbstractRequest` don't emit `failure` event and turn request object into `UNDEFINED` state (it's settable via `AbstractRequest#stateOnAbort`) on `abort` ([backward patch](https://gist.github.com/lahmatiy/5891591))
- FIX: add new syntax for `sourceURL` (avoid warnings in Chrome Canary)
- API: `basis.data.property.AbstractData` moved to `basis.data.Value`
- API: `basis.data.Value#updateCount` was removed ([backward patch](https://gist.github.com/lahmatiy/5895614))
- API: `forceEvent` argument for `basis.data.Value#set` was removed ([backward patch](https://gist.github.com/lahmatiy/5895982))
- API: `basis.data.property.AbstractData` and `basis.data.DataObject` aliases are removed
- FIX: `basis.template.makeDeclaration` left html tokens as is when token not resolved
- FIX: double `groupingChanged` event emit was fixed ([issue #8](https://github.com/basisjs/basisjs/issues/8))
- FIX: dataset indexes become more stable for incorrect values (avoid `NaN` as value)
- NEW: new class `basis.data.property.Expression` implemented (how to use it see [Data indexes](https://github.com/basisjs/basisjs/blob/master/demo/defile/data_index.html) or [TodoMVC](https://github.com/basisjs/basisjs/tree/master/demo/apps/todomvc/basis/js) demos)
- NEW: `basis.router` debug info output is optional now (set `basis.router.debug` = `true`/`false` to turn on/off debug output)
- NEW: `basis.resource('..').ready` method implemented, useful for async callback on init attach
- TodoMVC refactored
- Basis.js templates become more independent from host object implementation
- Various small fixes and code clean up
