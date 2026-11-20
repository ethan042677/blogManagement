<template>
    <div class="article-meta-layout">
        <div class="article-meta-main">
            <!-- 标题、分类、标签和简介属于 article 表元数据，不进入 Markdown。 -->
            <input
                :value="form.title"
                class="article-title-input"
                maxlength="200"
                placeholder="请输入标题"
                @input="update('title', ($event.target as HTMLInputElement).value)"
            >

            <div class="article-meta-row">
                <select
                    :value="form.categoryId"
                    class="article-category-select"
                    @change="update('categoryId', Number(($event.target as HTMLSelectElement).value))"
                >
                    <option :value="-1">选择分类</option>
                    <option v-for="category in categories" :key="category.id" :value="Number(category.id)">
                        {{ category.name }}
                    </option>
                </select>

                <!-- 文章标签仍以名称数组回传，后端沿用 article.label 的逗号分隔存储。 -->
                <div class="article-label-field">
                    <button
                        v-for="label in form.labels"
                        :key="label"
                        class="article-label-chip"
                        type="button"
                        :title="`移除标签 ${label}`"
                        @click="removeLabel(label)"
                    >
                        {{ label }} <span>×</span>
                    </button>
                    <button class="article-label-trigger" type="button" @click.stop="labelPanelOpen = !labelPanelOpen">
                        插入标签
                    </button>

                    <!-- 标签选项来自现有 label 表；新标签由主编辑器组件负责持久化。 -->
                    <div v-if="labelPanelOpen" class="article-label-panel" @click.stop>
                        <div class="article-label-panel-head">
                            <strong>标签</strong>
                            <button type="button" aria-label="关闭标签面板" @click="labelPanelOpen = false">×</button>
                        </div>
                        <input
                            v-model="labelInput"
                            class="article-label-input"
                            maxlength="20"
                            placeholder="输入新标签并按 Enter"
                            @keydown.enter.prevent="createLabel"
                        >
                        <div class="article-label-options">
                            <button
                                v-for="label in labelOptions"
                                :key="label.id"
                                type="button"
                                :class="{ active: form.labels.includes(String(label.name)) }"
                                @click="toggleLabel(String(label.name))"
                            >
                                {{ label.name }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <textarea
                :value="form.introduction"
                class="article-introduction-input"
                maxlength="1000"
                rows="2"
                placeholder="请输入简介"
                @input="update('introduction', ($event.target as HTMLTextAreaElement).value)"
            ></textarea>

            <!-- 正文编辑器由父级传入，元数据组件只控制整页网格和封面栏布局。 -->
            <slot name="body"></slot>
        </div>

        <aside class="article-cover-column">
            <input
                ref="coverInput"
                class="article-hidden-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                @change="selectCover"
            >
            <button
                class="article-cover-picker"
                type="button"
                :disabled="coverUploading"
                @click="coverInput?.click()"
            >
                <img v-if="form.cover" :src="resolveAssetUrl(form.cover)" alt="文章封面">
                <span v-else>
                    <b>{{ coverUploading ? '上传中...' : '+' }}</b>
                    封面 800×600
                </span>
            </button>
        </aside>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CategoryData, LabelData } from '../../utils/interface'
import { resolveAssetUrl } from '../../utils/request'
import type { ArticleFormModel } from './articleTypes'

// v-model 只同步文章元数据对象；正文由 Markdown 编辑器独立维护。
const form = defineModel<ArticleFormModel>({ required: true })

defineProps<{
    categories: CategoryData[]
    labelOptions: LabelData[]
    coverUploading: boolean
}>()

const emit = defineEmits<{
    'add-label': [name: string]
    'upload-cover': [file: File]
}>()

const coverInput = ref<HTMLInputElement>()
const labelPanelOpen = ref(false)
const labelInput = ref('')

// 统一更新 v-model 字段，避免模板中反复写完整对象展开逻辑。
function update<K extends keyof ArticleFormModel>(key: K, value: ArticleFormModel[K]) {
    form.value = { ...form.value, [key]: value }
}

function toggleLabel(name: string) {
    const labels = form.value.labels.includes(name)
        ? form.value.labels.filter((item) => item !== name)
        : [...form.value.labels, name]
    update('labels', labels)
}

function removeLabel(name: string) {
    update('labels', form.value.labels.filter((item) => item !== name))
}

// 已有标签直接选中；新标签交给父级请求 labelApi 后再同步最新选项。
function createLabel() {
    const name = labelInput.value.trim()
    if (!name) return
    emit('add-label', name)
    labelInput.value = ''
}

function selectCover(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (file) emit('upload-cover', file)
    // 允许用户连续选择同一文件重试。
    input.value = ''
}
</script>

<style scoped lang="less">
/* 左侧表单与右侧封面构成设计图中的编辑纸张。 */
.article-meta-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 230px;
    gap: 54px;
    min-height: 680px;
    padding: 48px 62px 72px;
}

.article-meta-main {
    min-width: 0;
}

.article-title-input {
    width: 100%;
    border: 0;
    outline: 0;
    color: #242a35;
    font: 600 28px/1.4 inherit;

    &::placeholder {
        color: #8e97a6;
    }
}

.article-meta-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-top: 22px;
    color: #8a93a3;
    font-size: 12px;
}

.article-category-select {
    height: 30px;
    border: 0;
    outline: 0;
    background: transparent;
    color: #6f7887;
    font: inherit;
}

.article-label-field {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 7px;
    min-height: 30px;
}

.article-label-chip,
.article-label-trigger {
    height: 26px;
    border: 0;
    border-radius: 13px;
    background: #f1f3f6;
    color: #687181;
    font: inherit;
    cursor: pointer;
}

.article-label-chip {
    padding: 0 10px;

    span {
        margin-left: 4px;
        color: #a1a8b3;
    }
}

.article-label-trigger {
    padding: 0 12px;
    background: transparent;
    color: #2b65e9;
}

.article-label-panel {
    position: absolute;
    top: 38px;
    left: 0;
    z-index: 20;
    width: 360px;
    border: 1px solid #edf0f4;
    border-radius: 8px;
    background: #fff;
    padding: 18px;
    box-shadow: 0 16px 50px rgba(34, 45, 66, 0.16);
}

.article-label-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    button {
        border: 0;
        background: transparent;
        color: #8a93a3;
        font-size: 20px;
        cursor: pointer;
    }
}

.article-label-input {
    box-sizing: border-box;
    width: 100%;
    height: 34px;
    margin: 12px 0;
    border: 0;
    border-radius: 5px;
    outline: 0;
    background: #f4f5f7;
    padding: 0 10px;
    color: #4c5564;
    font: inherit;
}

.article-label-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    button {
        border: 0;
        border-radius: 14px;
        background: #f4f5f7;
        padding: 6px 11px;
        color: #687181;
        cursor: pointer;
    }

    button.active {
        background: #e8efff;
        color: #2b65e9;
    }
}

.article-introduction-input {
    box-sizing: border-box;
    width: 100%;
    margin-top: 14px;
    border: 0;
    outline: 0;
    resize: vertical;
    color: #687181;
    font: 13px/1.8 inherit;

    &::placeholder {
        color: #9aa2af;
    }
}

.article-cover-column {
    padding-top: 5px;
}

.article-hidden-input {
    display: none;
}

.article-cover-picker {
    position: relative;
    width: 184px;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border: 0;
    border-radius: 5px;
    background: #f5f6f8;
    color: #9aa2af;
    cursor: pointer;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    span {
        display: grid;
        place-content: center;
        gap: 8px;
        height: 100%;
        font-size: 11px;
    }

    b {
        color: #b0b7c2;
        font-size: 24px;
        font-weight: 400;
    }
}

@media (max-width: 900px) {
    .article-meta-layout {
        grid-template-columns: 1fr;
        padding: 30px 28px 46px;
    }

    .article-cover-column {
        grid-row: 1;
    }
}
</style>
