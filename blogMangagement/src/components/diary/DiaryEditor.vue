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
                <yk-upload
                    :upload-url="submitUrl"
                    :file-list="diaryFrom.picture"
                    accept="image/*"
                ></yk-upload>
            </div>
        </div>
        <!-- 取消和新建笔记 -->
        <div class="diary-editor-footer">
            <yk-space size="s">
                <yk-button type="secondary">取消</yk-button>
                <yk-button>新建笔记</yk-button>
            </yk-space>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref,computed } from 'vue';
import { weatherList } from '../../utils/weather';

type DiaryForm = {
    title:string,
    weatherId:number,
    content:string,
    picture?:string[]
}
//表单信息
const diaryFrom = ref<DiaryForm>({title:'',weatherId:0,content:''})
/**天气图标 */
const weatherUrl = computed(()=>{
    return `./src/assets/${weatherList[diaryFrom.value.weatherId].icon}`
})
/**选择天气方法 */
const selectWeather = (id:number)=>{
    diaryFrom.value.weatherId = id
}
/**上传地址 */
const submitUrl = '/'
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