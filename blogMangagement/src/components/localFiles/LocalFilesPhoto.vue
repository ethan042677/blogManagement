<template>
    <div class="files-photo">
        <yk-text>{{ props.data?.fileName }}.{{ props.data?.format }}</yk-text>
    </div>
</template>
<script lang="ts" setup>
import { type FileData } from '../../utils/interface';
import { onMounted } from 'vue';

//props接口
type FilePhotoProps = {
    data?:FileData,
}

const props = withDefaults(defineProps<FilePhotoProps>(),{

})


//生命周期
onMounted(()=>{

})
</script>

<style lang="less" scoped>

</style>