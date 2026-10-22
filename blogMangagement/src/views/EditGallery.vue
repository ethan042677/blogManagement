<template>
    <div class="edit-gallery">
        <ItemTop name="新建摄影图库" :loading="submitting" @cancel="router.push('/gallery')" @publish="publish"/>
        <yk-space style="width: 100%; align-items:flex-start;" size="l">
            <UploadGallery @change="photos = $event" @coverChange="cover = $event"/>
            <form class="edit-gallery-form" @submit.prevent="publish">
                <label>
                    <span>标题</span>
                    <input v-model.trim="form.title" required placeholder="请输入图库标题">
                </label>
                <label>
                    <span>分类</span>
                    <select v-model.number="form.categoryId">
                        <option :value="-1">未分类</option>
                        <option v-for="item in categories" :key="item.id" :value="Number(item.id)">
                            {{ item.name }}
                        </option>
                    </select>
                </label>
                <label>
                    <span>标签</span>
                    <input v-model.trim="form.label" placeholder="多个标签用逗号分隔">
                </label>
                <label>
                    <span>简介</span>
                    <textarea v-model.trim="form.introduction" rows="6" placeholder="写一段图库简介"></textarea>
                </label>
                <p class="edit-gallery-count">已选择 {{ photos.length }} 张图片，封面：{{ cover ? '已设置' : '未设置' }}</p>
            </form>
        </yk-space>
    </div>
</template>

<script lang="ts" setup>
import { onMounted,reactive,ref } from 'vue'
import { useRouter } from 'vue-router'
import ItemTop from '../components/ItemTop.vue'
import UploadGallery from '../components/gallery/UploadGallery.vue'
import { articleApi, categoryApi } from '../api'
import type { CategoryData, FileData } from '../utils/interface'

// 路由实例，用于发布后返回图库页
const router = useRouter()
// 图库分类列表
const categories = ref<CategoryData[]>([])
// 图库包含的本地图片
const photos = ref<FileData[]>([])
// 当前封面图片地址
const cover = ref('')
// 是否正在发布
const submitting = ref(false)
// 新建图库表单
const form = reactive({
    title: '',
    categoryId: -1,
    label: '',
    introduction: '',
})

// 获取图库分类
const loadCategories = async () => {
    try {
        categories.value = (await categoryApi.list(1)).list
    } catch (error) {
        console.error('获取图库分类失败', error)
    }
}

// 发布图库：提交图片列表、封面和表单信息
const publish = async () => {
    // 标题和图片是图库发布的必要条件
    if (!form.title) {
        window.alert('请输入标题')
        return
    }
    if (!photos.value.length) {
        window.alert('请先上传或选择图片')
        return
    }
    submitting.value = true
    try {
        // content 保存全部图片，cover 单独保存封面
        await articleApi.create({
            ...form,
            classify: 1,
            content: photos.value.map((item) => item.url),
            cover: cover.value || photos.value[0].url,
            state: 1,
            moment: new Date().toISOString(),
        })
        await router.push('/gallery')
    } catch (error) {
        window.alert(error instanceof Error ? error.message : '发布失败')
    } finally {
        submitting.value = false
    }
}

// 生命周期：进入编辑页后加载分类
onMounted(loadCategories)
</script>

<style lang="less" scoped>
.edit-gallery{
    padding: @space-xl 80px;

    &-form{
        background: @bg-color-l;
        min-height: 400px;
        width: 440px;
        flex: none;
        border-radius: @radius-m;
        padding: 28px;
        display: grid;
        align-content: start;
        gap: 20px;

        label {
            display: grid;
            gap: 8px;
            color: @font-color-m;
            font-size: 13px;
        }

        input,
        select,
        textarea {
            width: 100%;
            border: 1px solid @line-color-s;
            border-radius: 8px;
            background: #fff;
            color: @font-color-l;
            font: inherit;
            padding: 11px 12px;
            outline: none;

            &:focus {
                border-color: @pcolor;
            }
        }

        textarea {
            resize: vertical;
        }
    }

    &-count {
        margin: 0;
        color: @font-color-s;
        font-size: 12px;
    }
}
</style>
