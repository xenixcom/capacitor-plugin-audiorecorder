# @xinexcom/capacitor-plugin-audiorecorder

An Audio Recorder Capacitor Plugin for web/ios/android.

## Install

```bash
npm install @xinexcom/capacitor-plugin-audiorecorder
npx cap sync
```

## API

<docgen-index>

* [`getVersion()`](#getversion)
* [`start()`](#start)
* [`stop()`](#stop)
* [`addListener('stateChanged', ...)`](#addlistenerstatechanged-)
* [`removeAllListeners()`](#removealllisteners)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### getVersion()

```typescript
getVersion() => Promise<{ value: string; }>
```

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### start()

```typescript
start() => Promise<void>
```

--------------------


### stop()

```typescript
stop() => Promise<void>
```

--------------------


### addListener('stateChanged', ...)

```typescript
addListener(eventName: 'stateChanged', listenerFunc: (data: { state: RecorderState; }) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'stateChanged'</code>                                                            |
| **`listenerFunc`** | <code>(data: { state: <a href="#recorderstate">RecorderState</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### removeAllListeners()

```typescript
removeAllListeners() => Promise<void>
```

--------------------


### Interfaces


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


### Type Aliases


#### RecorderState

<code>'idle' | 'recording'</code>

</docgen-api>
