<template>
    <div class="top-bar">
        <!-- 标题 -->
        <p class="top-bar-title">{{ props.name }}</p>
        <!-- 右边按钮 -->
        <yk-space>
            <yk-button type="secondary" @click="emits('cancel')">取消</yk-button>
            <yk-button :disabled="loading" @click="emits('publish')">{{ loading ? '发布中...' : '发布' }}</yk-button>
        </yk-space>
    </div>

</template>

<script lang="ts" setup>
type TypeProps = {
    name:string,
    loading?:boolean,
}

const props = withDefaults(defineProps<TypeProps>(),{
    name:'', // 页面标题
    loading:false, // 是否正在发布
})
// 取消和发布事件
const emits = defineEmits(['cancel','publish'])
</script>

<style lang="less" scoped>
.top-bar{
    margin-bottom: @space-l;
    border-radius: @radius-m;
    background: @bg-color-l;
    padding: @space-l @space-xl;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-title{
        .font-xl();
        font-weight: 600;
    }
}
</style>
