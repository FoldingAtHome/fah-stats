import {reactive} from 'vue'

const ui = reactive({toasts: [], modal: null})
let nextId = 1

export function toast(msg, type = 'info', ms = 4000) {
  const t = {id: nextId++, msg, type}
  ui.toasts.push(t)
  if (ms) setTimeout(() => dismissToast(t.id), ms)
}
export function dismissToast(id) {
  const i = ui.toasts.findIndex(t => t.id === id)
  if (i !== -1) ui.toasts.splice(i, 1)
}
export function apiError(e) {
  toast(e && e.message ? e.message : String(e), 'error', 6000)
}

export default ui
