<template>
    <div class="category">
        <yk-space wrap>
            <!-- 分组：全部 -->
            <div class="category-menu" :class="{'category-menu-selected':selected== '-1all'}" @click="changeCategory(-1,'all')">
                全部 {{ categoryStore.count }}
            </div>
            <!-- 分组：文章发布状态 -->
            <div class="category-menu" v-for="item in articleState.data" :key="item.id" :class="{'category-menu-selected':selected==item.id +'articleState'}" @click="changeCategory(item.id,'articleState')">
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
            <CategoryMessage />
            <template #footer>
                <yk-button @click="showModal">确定</yk-button>
            </template>
        </yk-modal>
    </div>
</template>
<script setup lang="ts">
import { onMounted,ref,getCurrentInstance } from 'vue';
import { category,articleState } from '../../mock/data';
import { useCategoryStore } from '../../store/category';
import  CategoryMessage  from './CategoryMessage.vue'

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
const getCategory = ()=>{
    categoryStore.data = category.data.list;
    categoryStore.count = category.data.count;
}
/**
 * @description 切换分组
 */
const changeCategory = (id:string|number,type:string)=>{
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
function confirm() {
    if(inputValue.value){
        //模拟数据
        const obj = {
            id:"-2",
            name:inputValue.value,
            value:0
        }
        categoryStore.data.push(obj)
        inputValue.value = ''
        proxy.$message({ type: 'primary', message: '插入成功' })
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