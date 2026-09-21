<template>
    <div class="upload-gallery">
        <yk-upload
            :upload-url="uploadUrl"
            :draggable="true"
            @handleSuccess="handleSuccess"
        ></yk-upload>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const uploadUrl = 'https://www.huohuo90.com:3005/upload'

/**成功的回调函数 */
const handleSuccess = (file:any)=>{
    
}
</script>

<style lang="less" scoped>
.upload-gallery{
    background: @bg-color-l;
    border-radius: @radius-m;
    padding: @space-xl;
    width: 100%;
}
</style>