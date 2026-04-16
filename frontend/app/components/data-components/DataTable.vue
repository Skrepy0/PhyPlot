<script setup lang="ts">
import { ref, watch, nextTick, inject } from 'vue'
import type { DialogOptions } from '~/composables/interface/dialog'
import type { ToastFunction } from '~/composables/interface/toast'

type SingleRow = { id: number; value: string }
type DoubleRow = { id: number; x: string; y: string }
type Row = SingleRow | DoubleRow
const dialog = inject<(options: DialogOptions) => Promise<boolean>>('dialog')
const toast = inject<ToastFunction>('toast')
const numberRegex = /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/
const inputStart = ref<HTMLInputElement | null>(null)
const props = defineProps<{
  variableType: 'single' | 'double'
  modelValue?: Row[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Row[]): void
}>()

const normalizeRows = (input: any[]): Row[] => {
  if (!Array.isArray(input)) return []
  return input.map((item) => {
    const id = typeof item.id === 'string' ? parseInt(item.id, 10) : (item.id as number)
    if (props.variableType === 'single') {
      return { id, value: item.value !== undefined ? String(item.value) : '0' }
    } else {
      return {
        id,
        x: item.x !== undefined ? String(item.x) : '0',
        y: item.y !== undefined ? String(item.y) : '0',
      }
    }
  })
}

const rows = ref<Row[]>(normalizeRows(props.modelValue || []))

watch(
  () => props.modelValue,
  (newVal) => {
    rows.value = normalizeRows(newVal || [])
    nextId = getNextId()
  },
  { deep: true }
)

watch(
  rows,
  (val) => {
    emit('update:modelValue', val)
    nextId = getNextId()
  },
  { deep: true }
)

const getNextId = (): number => {
  if (rows.value.length === 0) return 1
  return Math.max(...rows.value.map((r) => r.id)) + 1
}
let nextId = getNextId()

const getX = (row: Row): string => {
  if (props.variableType === 'single') {
    return (row as SingleRow).value
  } else {
    return (row as DoubleRow).x
  }
}

const getY = (row: Row): string => {
  return props.variableType === 'double' ? (row as DoubleRow).y : ''
}

const setX = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  editBuffer.value.value = val
  editBuffer.value.x = val
}

const setY = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  editBuffer.value.y = val
}

const addRow = () => {
  if (props.variableType === 'single') {
    rows.value.push({ id: nextId++, value: '0' })
  } else {
    rows.value.push({ id: nextId++, x: '0', y: '0' })
  }
}

const deleteRow = (id: number) => {
  rows.value = rows.value.filter((r) => r.id !== id)
}

const editingId = ref<number | null>(null)
const editBuffer = ref<any>({})
const lastAddedId = ref<number | null>(null)

const startEdit = (row: Row) => {
  editingId.value = row.id
  if (props.variableType === 'single') {
    editBuffer.value = { value: (row as SingleRow).value }
  } else {
    editBuffer.value = { x: (row as DoubleRow).x, y: (row as DoubleRow).y }
  }
}

const saveEdit = (id: number) => {
  const index = rows.value.findIndex((r) => r.id === id)
  if (index === -1) return
  if (props.variableType === 'single') {
    ;(rows.value[index] as SingleRow).value = editBuffer.value.value ?? '0'
  } else {
    ;(rows.value[index] as DoubleRow).x = editBuffer.value.x ?? '0'
    ;(rows.value[index] as DoubleRow).y = editBuffer.value.y ?? '0'
  }
  cancelEdit()
}

const cancelEdit = () => {
  editingId.value = null
  editBuffer.value = {}
}

const newRowBuffer = ref(props.variableType === 'single' ? { value: '' } : { x: '', y: '' })
const isValidNumber = (val: string) => {
  return numberRegex.test(val.trim())
}
const commitAdd = () => {
  const check = (val: string) => {
    if (!isValidNumber(val)) {
      toast?.(`非法输入: ${val}`, { type: 'error' })
      return false
    }
    return true
  }

  let newId = nextId

  if (props.variableType === 'single') {
    const v = newRowBuffer.value.value || '0'

    if (!check(v)) return

    rows.value.push({
      id: newId++,
      value: v,
    })

    newRowBuffer.value = { value: '' }
  } else {
    const x = newRowBuffer.value.x || '0'
    const y = newRowBuffer.value.y || '0'

    if (!check(x) || !check(y)) return

    rows.value.push({
      id: newId++,
      x,
      y,
    })

    newRowBuffer.value = { x: '', y: '' }
  }

  lastAddedId.value = newId - 1

  nextTick(() => {
    const wrapper = document.querySelector('.table-wrapper') as HTMLElement
    if (wrapper) wrapper.scrollTop = wrapper.scrollHeight

    setTimeout(() => {
      lastAddedId.value = null
    }, 1000)
  })
  const saved = localStorage.getItem('userSettings')
  let autoFocus = false
  if (saved) {
    try {
      autoFocus = JSON.parse(saved).autoFocus
    } catch (e) {}
  }
  if (autoFocus) inputStart.value?.focus() // 自动对焦
}

const resetData = () => {
  rows.value = []
  nextId = 1
}
const clearAll = async () => {
  if (rows.value.length === 0) {
    toast?.('当前没有数据可清空', { type: 'warning' })
    return
  }

  const confirmed = await dialog?.({
    title: '删除确认',
    message: '确定要清空所有数据吗？',
  })

  if (!confirmed) return

  rows.value = []
  nextId = 1

  newRowBuffer.value = props.variableType === 'single' ? { value: '' } : { x: '', y: '' }

  toast?.('数据已清空', { type: 'success' })
}
// 在现有 ref 声明后面添加
const fileInputRef = ref<HTMLInputElement | null>(null)

// 实现 loadData
const loadData = async (event: Event) => {
  // 如果是按钮点击（event.target 是按钮，没有 files 属性），则触发隐藏 input
  const target = event.target as HTMLElement
  if (target.tagName !== 'INPUT' || (target as HTMLInputElement).type !== 'file') {
    fileInputRef.value?.click()
    return
  }

  // 来自 file input 的 change 事件
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const importedData = JSON.parse(content)

      // 验证数据格式
      if (!Array.isArray(importedData)) {
        toast?.('导入的数据必须是数组格式', { type: 'error' })
        return
      }

      // 根据 variableType 验证并转换每一行
      const newRows: Row[] = []
      for (const item of importedData) {
        if (props.variableType === 'single') {
          if (item.value === undefined) {
            toast?.('单变量数据缺少 value 字段', { type: 'error' })
            return
          }
          newRows.push({
            id: typeof item.id === 'number' ? item.id : Date.now() + Math.random(),
            value: String(item.value)
          })
        } else {
          if (item.x === undefined || item.y === undefined) {
            toast?.('双变量数据缺少 x 或 y 字段', { type: 'error' })
            return
          }
          newRows.push({
            id: typeof item.id === 'number' ? item.id : Date.now() + Math.random(),
            x: String(item.x),
            y: String(item.y)
          })
        }
      }

      // 替换现有数据
      rows.value = newRows
      nextId = getNextId()  // 重新计算下一个可用 ID
      toast?.(`成功导入 ${newRows.length} 条数据`, { type: 'success' })

      // 清空 file input 的值，以便再次导入同一个文件时能触发 change
      input.value = ''
    } catch (err) {
      console.error(err)
      toast?.('JSON 解析失败，请检查文件格式', { type: 'error' })
    }
  }
  reader.readAsText(file, 'UTF-8')
}
const downloadData = () => {
  if (rows.value.length === 0) {
    toast?.('当前没有数据可下载', { type: 'warning' })
    return
  }

  // 处理数据下载逻辑
  const dataStr = JSON.stringify(rows.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'data.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  toast?.('数据已准备好下载', { type: 'success' })
}

defineExpose({ addRow, deleteRow, resetData })
</script>

<template>
  <div class="data-table-container">
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>序号</th>
            <th>X</th>
            <th v-if="variableType === 'double'">Y</th>
            <th class="action-col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="row.id" :class="{ 'new-row': lastAddedId === row.id }">
            <td>{{ index + 1 }}</td>
            <td>
              <template v-if="editingId === row.id">
                <input type="text" :value="getX(row)" @input="setX" class="edit-input" @keydown.enter="saveEdit(row.id)" />
              </template>
              <template v-else>
                {{ getX(row) }}
              </template>
            </td>
            <td v-if="variableType === 'double'">
              <template v-if="editingId === row.id">
                <input type="text" :value="getY(row)" @input="setY" class="edit-input" @keydown.enter="saveEdit(row.id)" />
              </template>
              <template v-else>
                {{ getY(row) }}
              </template>
            </td>
            <td class="action-buttons">
              <template v-if="editingId === row.id">
                <button class="action-btn save-btn" @click="saveEdit(row.id)">保存</button>
                <button class="action-btn cancel-btn" @click="cancelEdit">取消</button>
              </template>
              <template v-else>
                <button class="action-btn edit-btn" @click="startEdit(row)">编辑</button>
                <button class="action-btn delete-btn" @click="deleteRow(row.id)">删除</button>
              </template>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td :colspan="variableType === 'double' ? 4 : 3" class="empty-placeholder">暂无数据，请添加</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="add-form">
      <div class="form-title">添加新数据</div>
      <div class="form-fields">
        <input
          type="text"
          v-model="newRowBuffer.value"
          v-if="variableType === 'single'"
          placeholder="X"
          class="form-input"
          @keydown.enter="commitAdd"
        />
        <template v-else>
          <input type="text" v-model="newRowBuffer.x" placeholder="X" class="form-input" ref="inputStart" />
          <input type="text" v-model="newRowBuffer.y" placeholder="Y" class="form-input" @keydown.enter="commitAdd" />
        </template>
        <button class="add-btn" @click="commitAdd">+ 添加</button>
        <button class="clear-btn" @click="clearAll">清空</button>
        <button class="download-btn" @click="downloadData">下载数据</button>
        <button class="load-btn" @click="loadData">导入数据</button>
        <input type="file" accept=".json" ref="fileInputRef" style="display: none" @change="loadData" />
      </div>
    </div>
  </div>
  <Dialog ref="dialogRef" />
</template>

<style scoped lang="scss">
@import '../../../assets/scss/_modern-theme.scss';

.data-table-container {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-strength));
  border-radius: var(--radius-lg);
  padding: 20px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-primary);
  transition: var(--transition-normal);
  animation: slideInUp 0.5s ease-out;

  &:hover {
    border-color: var(--border-primary);
    box-shadow: var(--shadow-primary), var(--shadow-glow);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  margin-bottom: 24px;
  max-height: 200px;
  border-radius: 12px;
  background: var(--bg-card);
  padding: 4px;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(46, 204, 113, 0.1);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(46, 204, 113, 0.4);
    border-radius: 10px;
    transition: background 0.3s;

    &:hover {
      background: rgba(46, 204, 113, 0.7);
    }
  }
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text-primary);
  font-size: 0.9rem;

  th,
  td {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(46, 204, 113, 0.2);
    transition: all 0.2s ease;
  }

  th {
    background: var(--bg-primary);
    border-radius: 2px;
    color: var(--primary-green);
    font-weight: 600;
    text-align: left;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  tbody tr {
    transition: all 0.2s ease;

    &:hover {
      background: rgba(46, 204, 113, 0.1);
      transform: scale(1.01);
    }

    /* 新行动画 */
    &.new-row {
      animation: newRowSlide 0.5s ease-out;
      background: rgba(46, 204, 113, 0.15);
      box-shadow: inset 0 0 10px rgba(46, 204, 113, 0.2);
    }
  }
}

@keyframes newRowSlide {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.edit-input {
  background: var(--glass-bg);
  border: 2px solid rgba(46, 204, 113, 0.3);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
  outline: none;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 8px rgba(46, 204, 113, 0.3);
  }

  &:hover {
    border-color: rgba(46, 204, 113, 0.5);
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.action-btn {
  border: 1px solid rgba(46, 204, 113, 0.4);
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.8rem;
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &.edit-btn {
    border-color: rgba(46, 204, 113, 0.4);
    color: rgba(46, 204, 113, 0.7);

    &:hover {
      background: rgba(46, 204, 113, 0.1);
      border-color: var(--primary-green);
      color: var(--primary-green);
    }
  }

  &.delete-btn {
    border-color: rgba(220, 53, 69, 0.4);
    color: rgba(220, 53, 69, 0.7);

    &:hover {
      background: rgba(220, 53, 69, 0.1);
      border-color: #dc3545;
      color: #dc3545;
    }
  }

  &.save-btn {
    background: var(--primary-green);
    border-color: var(--primary-green);
    color: white;
    font-weight: 600;

    &:hover {
      background: #1e8f5e;
      box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
    }
  }

  &.cancel-btn {
    border-color: rgba(200, 200, 200, 0.4);
    color: rgba(200, 200, 200, 0.7);

    &:hover {
      background: rgba(200, 200, 200, 0.1);
      border-color: rgba(200, 200, 200, 0.7);
      color: rgba(200, 200, 200, 0.9);
    }
  }
}

.empty-placeholder {
  text-align: center;
  color: var(--text-secondary);
  padding: 40px 20px;
  font-style: italic;
}

.add-form {
  border-top: 1px solid rgba(46, 204, 113, 0.3);
  padding-top: 20px;
  animation: slideInUp 0.5s ease-out 0.1s both;
}

.form-title {
  font-size: 1rem;
  color: var(--primary-green);
  margin-bottom: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.form-fields {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.form-input {
  background: var(--glass-bg);
  border: 2px solid rgba(46, 204, 113, 0.3);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-primary);
  flex: 1;
  min-width: 100px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  outline: none;

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 8px rgba(46, 204, 113, 0.3);
    background: var(--bg-primary);
  }

  &:hover {
    border-color: rgba(46, 204, 113, 0.5);
  }
}

.add-btn {
  background: var(--primary-green);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #1e8f5e;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(46, 204, 113, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}
.clear-btn {
  background: transparent;
  border: 1px solid rgba(220, 53, 69, 0.5);
  color: rgba(220, 53, 69, 0.8);
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(220, 53, 69, 0.15);
    border-color: #dc3545;
    color: #dc3545;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}
.load-btn,
.download-btn {
  background: transparent;
  border: 1px solid rgba(46, 204, 113, 0.4);
  color: var(--primary-green);
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(46, 204, 113, 0.1);
    border-color: var(--primary-green);
    color: var(--primary-green);
  }

  &:active {
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .data-table-container {
    padding: 18px;
    border-radius: 18px;
  }

  .table-wrapper {
    max-height: 250px;
  }

  .form-fields {
    gap: 10px;
  }

  .form-input {
    width: auto;
  }
}

@media (max-width: 768px) {
  .data-table-container {
    padding: 16px;
    border-radius: 16px;
  }

  .table-wrapper {
    max-height: 300px;
  }

  .data-table th,
  .data-table td {
    padding: 8px 12px;
    font-size: 0.85rem;
  }

  .form-fields {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .form-input {
    width: auto;
  }

  .add-btn,
  .clear-btn,
  .download-btn {
    width: 100%;
    justify-content: center;
    padding: 12px;
    font-size: 0.9rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .action-btn {
    width: 100%;
    padding: 6px 8px;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .data-table-container {
    padding: 12px;
    border-radius: 12px;
  }

  .table-wrapper {
    max-height: 200px;
  }

  .data-table {
    font-size: 0.8rem;
  }

  .data-table th,
  .data-table td {
    padding: 6px 8px;
  }

  .form-title {
    font-size: 0.9rem;
    margin-bottom: 8px;
  }

  .form-fields {
    gap: 6px;
  }

  .add-btn,
  .clear-btn {
    padding: 10px;
    font-size: 0.85rem;
  }

  .action-btn {
    padding: 4px 6px;
    font-size: 0.7rem;
  }

  .empty-placeholder {
    padding: 20px 10px;
    font-size: 0.8rem;
  }
}
</style>
