<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['show-sidebar'])

const ballRef = ref<HTMLElement | null>(null)

const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const startLeft = ref(0)
const startTop = ref(0)

const left = ref(0)
const top = ref(0)

const edgePadding = 20
let ballWidth = 0
let ballHeight = 0

const getClientCoords = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
  if ('touches' in e) {
    const touch = e.touches[0]
    if (touch) {
      return { x: touch.clientX, y: touch.clientY }
    }
    return { x: 0, y: 0 }
  }
  return { x: e.clientX, y: e.clientY }
}

const initPosition = () => {
  if (!ballRef.value) return
  const { innerWidth, innerHeight } = window
  left.value = 10
  top.value = innerHeight - ballHeight - edgePadding + 10
  updatePosition()
}

const updatePosition = () => {
  if (!ballRef.value) return
  ballRef.value.style.left = `${left.value}px`
  ballRef.value.style.top = `${top.value}px`
}

const clampPosition = (x: number, y: number) => {
  const maxX = window.innerWidth - ballWidth
  const maxY = window.innerHeight - ballHeight
  return {
    x: Math.min(Math.max(x, 0), maxX),
    y: Math.min(Math.max(y, 0), maxY),
  }
}

const snapToEdge = () => {
  const { innerWidth } = window
  const distanceToLeft = left.value
  const distanceToRight = innerWidth - ballWidth - left.value

  if (distanceToLeft < distanceToRight) {
    left.value = edgePadding - 10
  } else {
    left.value = innerWidth - ballWidth - edgePadding - 10
  }
  const { y } = clampPosition(left.value, top.value)
  top.value = y
  updatePosition()
}

const onStart = (e: MouseEvent | TouchEvent) => {
  e.preventDefault()
  const { x, y } = getClientCoords(e)

  startX.value = x
  startY.value = y
  startLeft.value = left.value
  startTop.value = top.value

  isDragging.value = true

  if (ballRef.value) {
    ballRef.value.style.transition = 'none'
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onEnd)
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onEnd)
}

const onMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  e.preventDefault()

  const { x, y } = getClientCoords(e)

  let newLeft = startLeft.value + (x - startX.value)
  let newTop = startTop.value + (y - startY.value)

  const clamped = clampPosition(newLeft, newTop)
  left.value = clamped.x
  top.value = clamped.y

  updatePosition()
}

const onEnd = () => {
  if (!isDragging.value) return

  isDragging.value = false

  if (ballRef.value) {
    ballRef.value.style.transition = 'left 0.2s ease, top 0.2s ease'
  }

  snapToEdge()

  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onEnd)
  window.removeEventListener('touchmove', onMove)
  window.removeEventListener('touchend', onEnd)
}

const handleClick = () => {
  if (!isDragging.value) {
    emit('show-sidebar')
  }
}

const onResize = () => {
  if (!ballRef.value) return
  ballWidth = ballRef.value.offsetWidth
  ballHeight = ballRef.value.offsetHeight

  const clamped = clampPosition(left.value, top.value)
  left.value = clamped.x
  top.value = clamped.y
  updatePosition()
  snapToEdge()
}

onMounted(() => {
  if (!ballRef.value) return
  ballWidth = ballRef.value.offsetWidth
  ballHeight = ballRef.value.offsetHeight
  initPosition()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onEnd)
  window.removeEventListener('touchmove', onMove)
  window.removeEventListener('touchend', onEnd)
})
</script>

<template>
  <Transition name="scale-fade" appear>
    <div
      ref="ballRef"
      class="floating-ball"
      :style="{ left: left + 'px', top: top + 'px' }"
      @mousedown="onStart"
      @touchstart="onStart"
      @click="handleClick"
    >
      <div class="inner">
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
          <path
            d="M741.658197 70.618522C741.624512 70.618522 741.510198 970.8933 741.510198 970.8933 741.510198 967.484367 744.402062 960.328787 757.172574 955.341177 765.103987 952.243531 772.645392 953.032622 778.15685 955.73258 779.929322 956.60087 780.347896 956.945082 780.026811 956.581185L538.476226 682.823858C524.419874 666.893325 499.580126 666.893325 485.523774 682.823858L243.973189 956.581185C243.625181 956.975607 244.002266 956.664356 245.716407 955.815063 251.170364 953.112862 258.658982 952.274232 266.612622 955.317131 279.571439 960.274922 282.489802 967.49526 282.489802 970.8933L282.489802 70.729905C282.489802 70.66506 741.658197 70.618522 741.658197 70.618522ZM211.87128 970.8933C211.87128 1023.036375 262.443093 1042.384138 296.925623 1003.303936L538.476226 729.54659 485.523774 729.54659 727.074377 1003.303936C761.63909 1042.477283 812.12872 1022.758279 812.12872 970.8933L812.12872 70.729905C812.12872 31.552656 780.676537 0 741.658197 0L282.341803 0C243.451901 0 211.87128 31.745727 211.87128 70.729905L211.87128 970.8933Z"
            fill="#ffffff"
          ></path>
        </svg>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.floating-ball {
  position: fixed;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #419972, #2c6e4f);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: grab;
  user-select: none;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  &:active {
    cursor: grabbing;
    transform: scale(0.9);
    transition: transform 0.3s;
  }

  .inner {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 300;
    color: white;
    line-height: 1;
    transform: translateY(-1px);
  }
}

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.3s ease;
}

.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0);
  transform-origin: center;
}
</style>
