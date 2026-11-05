<template>
    <div class="edit-article">
        <ItemTop name="新建博客文章" @cancel="router.push('/article')"/>
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import ItemTop from '../components/ItemTop.vue';


//路由实例
const router = useRouter()
</script>

<style scoped lang="less">
.edit-article{
    padding: @space-xl 80px;
}
</style>