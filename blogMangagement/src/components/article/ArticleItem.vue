<template>
    <div class="article-item">
        <yk-space size="xl">
            <!-- 文章图片 -->
            <div class="article-item-cover">
                <yk-image
                    :src="coverUrl"
                    width="160px"
                    height="120px"
                    :is-lazy="true"
                    :preview="false"
                    fit="cover"
                />
                <p class="article-item-unpublish" v-if="props.data?.state === 0">未发布</p>
            </div>
            <div style="width: 100%;">
                <p class="article-item-title">{{ props.data?.title }}</p>
                <p class="article-item-introduction">{{ props.data?.introduction }}</p>
                <div class="article-item-data">
                    <!-- 标签以及日期等标记 (左边)-->
                    <yk-space class="article-item-left">
                        <yk-text type="secondary">
                            {{ CategoryStore.categoryName(props.data?.categoryId) }}
                            <yk-text type="secondary" v-if="props.data!.label!.length > 0">
                                /<span v-for="item in props.data?.label">{{ item }}</span>
                            </yk-text>
                        </yk-text>
                        <yk-text type="third">{{ resultTime }}</yk-text>
                        <yk-space>
                            <yk-text type="third">
                                <IconEyeOutline/>{{ props.data?.views }}
                            </yk-text>
                            <yk-text type="third">
                                <IconLikeOutline/>{{ props.data?.praise }}
                            </yk-text>
                            <yk-text type="third">
                                <IconCommentOutline/>{{ props.data?.comment }}
                            </yk-text>
                        </yk-space>
                    </yk-space>
                    <!-- 撤回（右边） -->
                    <yk-space class="article-item-right" size="xl">
                        <yk-tooltip placement="top" title="发布" v-if="props.data?.state === 0">
                            <IconSendOutline @click="updateState(props.data.id,1)"/>
                        </yk-tooltip>
                        <yk-tooltip placement="top" title="撤回" v-else-if="props.data?.state === 1">
                            <IconRevokeOutline @click="updateState(props.data.id,0)"/>
                        </yk-tooltip>
                        <!-- 编辑 -->
                        <yk-tooltip placement="top" title="编辑" >
                            <IconFillOutline/>
                        </yk-tooltip>
                        <!-- 删除 -->
                        <yk-popconfirm
                            trigger="click"
                            title="确定删除"
                            placement="topRight"
                            content="删除将不可恢复"
                            @cancel="cancel"
                            @confirm="deleteArticle(props.data?.id)"
                        >
                            <IconDeleteOutline/>
                        </yk-popconfirm>
                    </yk-space>
                </div>
            </div>
        </yk-space>
    </div>
</template>

<script lang="ts" setup>
import { computed,getCurrentInstance } from 'vue';
import type { ArticleData } from '../../utils/interface';
import { useCategoryStore } from '../../store/category';
import { resolveAssetUrl } from '../../utils/request';

const CategoryStore = useCategoryStore()


/**拿到父级传的数据 */
type ArticleItemProps = {
    data : ArticleData
}
const props = withDefaults(defineProps<ArticleItemProps>(),{})
//传给父级处理的删除操作和更新状态
const emits = defineEmits(['deleteArticle','updateState'])

/** 图片url*/
const coverUrl = computed(()=>{
    return resolveAssetUrl(props.data?.cover)
})
/**截取时间 */
const resultTime = computed(()=>{
    // 只保留年月日，避免列表时间过长
    return props.data?.moment.substring(0,10)
})

/**删除气泡框 */
const proxy: any = getCurrentInstance()?.proxy
function cancel() {
    proxy.$message({ type: 'warning', message: '取消删除' })
}
function deleteArticle(id:number) {
    // 弹窗只负责确认，真正删除由父组件调用接口
    emits("deleteArticle",id)
}
/** 修改状态 */
const updateState = (id:number,state:number)=>{
    // 发布/撤回由父组件请求接口后刷新列表
    emits("updateState",{id,state})
}
</script>

<style lang="less" scoped>
.article-item{
    width: 100%;
    border-radius: @radius-m;
    background: @bg-color-l;
    padding: @space-xl;

    &-cover{
        position: relative;
        border-radius: @radius-m;
        overflow: hidden;
        width: 160px;
        height: 120px;
    }
    &-unpublish{
        width: 100%;
        height: 36px;
        position: absolute;
        bottom: 0;
        text-align: center;
        background: rgba(43, 90, 237, 0.8);
        color: @white;
        line-height: 36px;
        font-weight: 600;
    }
    &-title{
        font-size: 20px;
        font-weight: 600;
        padding-bottom: @space-s;
    }
    &-introduction{
        .font-m();
        height: 48px;
        overflow: hidden;
        display: -webkit-box;
        line-clamp: 2;
        text-overflow: ellipsis;
        color: @font-color-l;
        margin-bottom: @space-m;
        max-width: 720px;
    }
    &-data{
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    &-right{
        .yk-icon{
            width: 20px;
            height: 20px;
            color: @font-color-m;
            cursor: pointer;
            &:hover{
                color: @pcolor;
            }
        }
    }
}
</style>
