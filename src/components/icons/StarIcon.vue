<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 24 24" 
    :fill="color"
    class="star-icon"
  >
    <!-- 真正的四角星（四个尖角） -->
    <path d="M12 1 L15 9 L23 12 L15 15 L12 23 L9 15 L1 12 L9 9 Z"/>
  </svg>
</template>

<script>
export default {
  name: 'StarIcon',
  props: {
    size: {
      type: Number,
      default: 14  // 缩小默认尺寸
    },
    color: {
      type: String,
      default: '#FFD700'
    }
  }
};
</script>

<style scoped>
.star-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>