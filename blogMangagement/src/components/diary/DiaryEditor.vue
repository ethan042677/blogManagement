<template>
    <div class="diary-editor">
        <div class="diary-editor-form">
            <div class="diary-editor-form-top">
                <!-- 标题输入框 -->
                <input type="text" class="diary-editor-form-top-title" placeholder="请输入标题" v-model="diaryFrom.title">
                <!-- 天气选择 -->
                <yk-popover placement="bottomRight" title="选择天气">
                    <template #content>
                        <!-- 渲染天气图标数组 -->
                        <yk-space wrap :size="[32,20]" style="padding: 10px 0 16px 15px;">
                            <div 
                                class="diary-editor-form-top-weather" 
                                v-for="item in weatherList" 
                                :class="{selected:diaryFrom.weatherId === item.id}"
                                @click="selectWeather(item.id)"
                            >
                                <img :src="`./src/assets/${item.icon}`" alt="" style="width: 25px;height: 25px;">
                            </div>
                        </yk-space>
                    </template>
                    <img :src="weatherUrl" style="width: 20px;height: 20px;">
                </yk-popover>
            </div>
            <!-- 文本输入域（auto-size：高度自适应） -->
            <yk-text-area
                v-model="diaryFrom.content"
                placeholder="请输入..."
                :max-length="1600"
                :auto-size="{
                    minRows: 24,
                    maxRows: 24,
                }"
            ></yk-text-area>
            <div class="diary-editor-form-picture">
                <label class="picture-picker">
                    <input type="file" accept="image/*" multiple @change="selectPictures">
                    <IconPlusOutline /> 添加本地图片
                </label>
                <div class="picture-preview" v-if="previews.length">
                    <img v-for="item in previews" :key="item" :src="item" alt="日记图片预览">
                </div>
            </div>
        </div>
        <!-- 取消和新建笔记 -->
        <div class="diary-editor-footer">
            <yk-space size="s">
                <yk-button type="secondary" @click="cancel">取消</yk-button>
                <yk-button :disabled="submitting" @click="submit">{{ submitting ? '保存中...' : '新建笔记' }}</yk-button>
            </yk-space>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref,computed,getCurrentInstance,onBeforeUnmount } from 'vue';
import { weatherList } from '../../utils/weather';
import { diaryApi, fileApi } from '../../api';
import { formatDate } from '../../utils/formatDate';

type DiaryForm = {
    title:string,
    weatherId:number,
    content:string,
}
// 日记表单数据
const diaryFrom = ref<DiaryForm>({title:'',weatherId:0,content:''})
// 获取组件实例，用于全局消息提示
const proxy:any = getCurrentInstance()?.proxy
// 新建成功后通知父组件刷新列表
const emits = defineEmits(['created'])
// 已选择的本地图片
const selectedFiles = ref<File[]>([])
// 本地图片预览地址
const previews = ref<string[]>([])
// 是否正在提交
const submitting = ref(false)

// 根据当前天气 id 显示对应图标，找不到时回退到晴天
const weatherUrl = computed(()=>{
    const weather = weatherList.find((item) => item.id === diaryFrom.value.weatherId) ?? weatherList[0]
    return `./src/assets/${weather.icon}`
})
// 选择天气
const selectWeather = (id:number)=>{
    diaryFrom.value.weatherId = id
}

// 选择本地图片并生成预览地址
const selectPictures = (event: Event) => {
    const input = event.target as HTMLInputElement
    selectedFiles.value = Array.from(input.files || [])
    previews.value.forEach((url) => URL.revokeObjectURL(url))
    previews.value = selectedFiles.value.map((file) => URL.createObjectURL(file))
}

// 取消编辑：清空表单、文件和预览
const cancel = () => {
    diaryFrom.value = { title: '', weatherId: 0, content: '' }
    selectedFiles.value = []
    previews.value.forEach((url) => URL.revokeObjectURL(url))
    previews.value = []
}

// 新建日记：先上传本地图片，再保存日记正文
const submit = async () => {
    if (!diaryFrom.value.title.trim()) {
        proxy.$message({ type: 'warning', message: '请输入标题' })
        return
    }
    // 正在提交
    submitting.value = true
    try {
        const uploaded = selectedFiles.value.length
            ? await fileApi.upload(selectedFiles.value)
            : []
        await diaryApi.create({
            ...diaryFrom.value,
            title: diaryFrom.value.title.trim(),
            picture: uploaded.map((file) => file.url),
            moment: formatDate()
        })
        cancel()
        emits('created')
        proxy.$message({ type: 'primary', message: '新建成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '新建失败' })
    } finally {
        submitting.value = false
    }
}

// 组件卸载时释放图片预览地址
onBeforeUnmount(() => {
    previews.value.forEach((url) => URL.revokeObjectURL(url))
})
</script>

<style lang="less" scoped>
.diary-editor{
    background: @bg-color-l;
    width: 100%;
    border-radius: @radius-m;
    &-form{
        padding: @space-xl;
        &-top{
            display: flex;
            justify-content: space-between;
            align-items: center;
            input{
                // 去除边框
                border: none;
                background: transparent;
                outline: none;
            }
            &-title{
                font-size: @size-l;
                font-weight: bold;
                color: @font-color-l;
                padding-bottom:@space-m ;
                //placeholder的字的颜色
                &::placeholder{
                    color: @gray-4;
                }
            }
            &-weather{
                // 伪元素用绝对定位，需要父级做定位参照
                position: relative;
                // 伪元素常驻，通过 scale / opacity 做显隐，才有过渡的起点
                &::before{
                    content: "";
                    display: block;
                    width: 8px;
                    height: 8px;
                    border-radius: 4px;
                    background: @pcolor;
                    position: absolute;
                    bottom: -6px;
                    left: 8px;
                    transform: scale(0);
                    opacity: 0;
                    transition: transform 0.2s ease, opacity 0.2s ease;
                }
                &.selected::before{
                    transform: scale(1);
                    opacity: 1;
                }
            }
            &-picture{
                padding-top: @space-xl;
            }
        }
    }
    &-footer{
        display: flex;
        justify-content: end;
        padding: @space-m;
        border-top: 1px solid @line-color-s;
    }
}
</style>

<style lang="less">
.picture-picker {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 8px;
    background: @pcolor-1;
    color: @pcolor;
    cursor: pointer;

    input {
        display: none;
    }
}

.picture-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;

    img {
        width: 72px;
        height: 72px;
        border-radius: 8px;
        object-fit: cover;
    }
}

.diary-editor{
    .yk-text-area{
        background-color: transparent;
        border: none;
        border-radius: 0;
        padding: 0;

        // 组件库在 hover / focus 态会把边框和底色加回来，必须一并覆盖，
        // 否则鼠标一移上去蓝色边框和灰底就冒出来了
        &:hover,
        &--focus,
        &--focus:hover{
            background-color: transparent;
            border: none;
        }
    }
    .yk-text-area__inner{
        font-size: @size-m;
        line-height: 1.5;
        &::placeholder{
            color: @gray-4;
        }
    }
}
</style>
