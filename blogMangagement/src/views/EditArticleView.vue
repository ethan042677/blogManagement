<template>
    <div class="edit-article-page">
        <!-- 视图层只负责全屏页面壳和导航；所有编辑交互由 editor 目录组件承担。 -->
        <HeaderNav />
        <main class="edit-article">
            <EditArticle />
        </main>
    </div>
</template>

<script lang="ts" setup>
import HeaderNav from '../components/HeaderNav.vue'
import EditArticle from '../components/editor/EditArticle.vue'
</script>

<style scoped lang="less">
.edit-article-page {
    min-height: 100vh;
    background: #f5f6f8;
}

.edit-article {
    padding: 88px 70px 56px;
}

@media (max-width: 900px) {
    .edit-article {
        padding: 84px 20px 30px;
    }
}
</style>
