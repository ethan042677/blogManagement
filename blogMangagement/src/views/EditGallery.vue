<template>
    <div class="edit-gallery">
        <ItemTop :name="'新建摄影图库'"/>
        <yk-space style="width: 100%;">
            <UploadGallery />
            <div class="edit-gallery-form"></div>
        </yk-space>
    </div>
</template>

<script lang="ts" setup>
import ItemTop from '../components/ItemTop.vue';
import UploadGallery from '../components/gallery/UploadGallery.vue';
</script>

<style lang="less" scoped>
.edit-gallery{
    padding: @space-xl 80px;

    &-form{
        background: @bg-color-l;
        height: 400px;
        width: 440px;
        flex: none;
        border-radius: @radius-m;
    }
}
</style>