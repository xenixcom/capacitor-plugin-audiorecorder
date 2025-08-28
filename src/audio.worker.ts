/// <reference lib="webworker" />

console.log(`[Worker] script loaded`);

self.onmessage = (e: MessageEvent) => {
  const data = e.data
  switch (data.cmd) {
    case 'init': {
      console.log(`[Worker] init data: ${JSON.stringify(data)}`)
      break
    }
    case 'encode': {
      console.log(`[Worker] encode data: ${JSON.stringify(data)}`)
      break
    }
    case 'finish': {
      console.log(`[Worker] finish data: ${JSON.stringify(data)}`)
      ;(self as any).postMessage({ cmd: 'end', url: 'test' })
      break
    }
  }
}