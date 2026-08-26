<template>
    <yk-space size="m" class="reply">
        <yk-avatar v-if="isComment"
            img-url="https://www.huohuo90.com:3003/user/6353b034dd4b583975e77fbe.png"
        ></yk-avatar>
        <yk-space dir="vertical" size="s" class="reply-main">
            <div class="reply-name">
                <!-- 姓名 -->
                <yk-text strong>{{ content?.user.name }}</yk-text>
                <!-- 日期 -->
                <yk-text type="third" style="font-size: 12px;">{{ content?.moment }}</yk-text>
            </div>
            <!-- 评论内容 -->
            <yk-text type="secondary">{{ content?.comment }}</yk-text>
            <yk-space size="s" align="center" v-if="isComment">
                <yk-tag type="primary">
                    {{ content?.article?.title }}
                </yk-tag>
                <yk-text type="danger" v-show="content?.complaint! >0">举报 {{ content?.complaint }}</yk-text>
            </yk-space>
                <IconDeleteOutline class="reply-main-delete" @click.stop="deleteReply(props.content?.id)"/>
        </yk-space>
    </yk-space>
</template>

<script lang="ts" setup>
import { type ReplyProps } from './reply';

const props = withDefaults(defineProps<ReplyProps>(),{
    isComment:true,
})

/**
 * @description 删除单条评论方法
 */

const emits = defineEmits(["delete"])//传给父的值
const deleteReply = (id:number|undefined) =>{
    emits("delete",id)
}
</script>

<style lang="less">
.reply{
    width: 100%;
    .reply-main{
        border-bottom: 1px solid @line-color-s;
        width: 100%;
        padding-bottom: @space-l;
        flex:1;
        position: relative;

        .reply-main-delete{
            position: absolute;
            right: 0;
            top: 0;
            width: 16px;
            height: 16px;
            cursor: pointer;
            color: @font-color-s;
            opacity: 0;
            transform: translateX(8px);
            transition: opacity .3s ease, transform .3s ease;
            pointer-events: none;
        }
        .reply-name{
        display: flex;
        flex-direction: column;
        }
        &:hover{
            .reply-main-delete{
                opacity: 1;
                transform: translateX(0);
                pointer-events: auto;
            }
        }
    }
}
</style>