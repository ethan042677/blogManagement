<template>
    <div class="category">
        <yk-space wrap>
            <!-- 分组：全部 -->
            <div class="category-menu" :class="{'category-menu-selected':selected== '-1all'}" @click="changeCategory(-1,'all')">
                全部 {{ categoryStore.count }}
            </div>
            <!-- 分组：文章发布状态 -->
            <div v-if="classify === 0" class="category-menu" v-for="item in articleState" :key="item.id" :class="{'category-menu-selected':selected==item.id +'articleState'}" @click="changeCategory(item.id,'articleState')">
                {{ item.name }} {{ item.value }}
            </div>
            <!-- 未分类 -->
            <div class="category-menu" :class="{'category-menu-selected':selected== categoryStore.calculateUncategorized.id +'calculateUncategorized'}" @click="changeCategory(categoryStore.calculateUncategorized.id,'calculateUncategorized')">
                {{ categoryStore.calculateUncategorized.name }} {{ categoryStore.calculateUncategorized.value }}
            </div>
            <!-- 分组：细化分类 -->
            <div class="category-menu" v-for="item in categoryStore.data" :key="item.id" :class="{'category-menu-selected':selected== item.id +'category'}" @click="changeCategory(item.id,'category')">
                {{ item.name }} {{ item.value }}
            </div>
        </yk-space>
        <yk-space style="flex: none;">
            <!-- 新建 -->
            <yk-popconfirm
                title="新建分组"
                @cancel="cancel"
                @confirm="confirm"
                trigger="click"
                placement="bottom"
            >
                <yk-text type="primary">
                    <IconCirclePlusOutline style="margin-right: 4px;"/>新建
                </yk-text>
                <template #content>
                    <div style="margin: 8px 4px 16px;">
                        <yk-input
                            show-counter
                            :limit="6"
                            placeholder="请输入..."
                            style="width:208px"
                            v-model="inputValue"
                        ></yk-input>
                    </div>
                </template>
            </yk-popconfirm>
            <!-- 管理分组 -->
            <yk-text type="primary" @click="showModal">
                <IconSettingsOutline style="margin-right: 4px;"/>管理分组
            </yk-text>
        </yk-space>
        <yk-modal v-model="visible" title="管理分组">
            <CategoryMessage @changed="getCategory" />
            <template #footer>
                <yk-button @click="showModal">确定</yk-button>
            </template>
        </yk-modal>
    </div>
</template>
<script setup lang="ts">
import { onMounted,ref,getCurrentInstance } from 'vue';
import { articleApi, categoryApi } from '../../api';
import { useCategoryStore } from '../../store/category';
import  CategoryMessage  from './CategoryMessage.vue'

// [联调新增] 文章、图库、文件页面复用该组件，通过 classify 拉取对应分类。
const props = withDefaults(defineProps<{ classify?: number }>(), {
    classify: 0,
})
const articleState = ref<{ id:number; name:string; value:number }[]>([])
//store
const categoryStore = useCategoryStore();
//变量
const selected = ref<number|string>("-1all")
const emits = defineEmits(['nowCategory'])

//新建-输入框的值
const inputValue = ref<number|string>()
// modal对话框
const visible = ref<boolean>(false)
const showModal = () => {
    visible.value = !visible.value;
}

/**
 * @description 获取分组方法
 */
const getCategory = async ()=>{
    try {
        // 分类数量与文章状态统计互不依赖，并行请求
        const requests:any[] = [categoryApi.list(props.classify)]
        if (props.classify === 0) requests.push(articleApi.stateCounts())
        const [categoryData, stateData] = await Promise.all(requests)
        categoryStore.data = categoryData.list
        categoryStore.count = categoryData.count
        articleState.value = stateData || []
    } catch (error) {
        articleState.value = []
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '获取分类失败' })
    }
}
/**
 * @description 切换分组
 */
const changeCategory = (id:string|number,type:string)=>{
    // type 区分全部、发布状态、未分类和普通分类
    if(id+type != selected.value){
        selected.value = id+type
        emits('nowCategory',{id,type})
    }
}
/**
 * @description 新建按钮的cancel（取消）方法和confirm（确定）方法
 */
const proxy: any = getCurrentInstance()?.proxy
function cancel() {
    inputValue.value = ''
}
async function confirm() {
    if(inputValue.value){
        try {
            // 新建后重新获取数量，确保顶部统计同步
            await categoryApi.add({
                name: String(inputValue.value),
                classify: props.classify,
                moment: new Date().toISOString(),
            })
            await getCategory()
            inputValue.value = ''
            proxy.$message({ type: 'primary', message: '插入成功' })
        } catch (error) {
            proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '新建失败' })
        }
    }else{
        proxy.$message({ type: 'primary', message: '请输入' })
    }
}
// 生命周期
onMounted(()=>{
    getCategory()
})
</script>
<style scoped lang="less">
.category{
    width: 100%;
    padding: @space-l @space-xl;
    border-radius: @radius-l;
    background-color: @bg-color-l;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .yk-text{
        cursor: pointer;
    }
    .category-menu{
        padding: 0 @space-l;
        background: @bg-color-m;
        border-radius: @radius-r;
        line-height: 32px;
        // 禁止用户选中文字
        user-select: none;
        cursor: pointer;
        &.category-menu-selected{
            background: @pcolor-1;
            color: @pcolor;
            font-weight: 500;
        }
    }
}
</style>
