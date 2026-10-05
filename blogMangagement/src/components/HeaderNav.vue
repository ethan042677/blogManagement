<template>
    <div class="head-bar">
        <yk-space align="center" :size="12" style="cursor: pointer;" @click="backHome">
            <img class="logo" src="../assets/vite.svg" alt="logo">
            <span class="name">博客管理后台</span>
        </yk-space>
        <yk-space align="center" :size="24">
            <!--消息 -->
            <yk-badge is-dot>
                <IconMailOutline style="font-size: 20px;" @click="changeMessage(true)" />
            </yk-badge>
            <!--头像 -->
            <yk-avatar img-url="https://www.huohuo90.com:3003/user/6353b034dd4b583975e77fbe.png"></yk-avatar>
            <!-- 暗黑模式 -->
            <div><yk-theme /></div>
            <yk-button>退出</yk-button>
        </yk-space>
        <Message :active="active" @close="changeMessage(false)"/>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Message from './reply/Message.vue';
//router:返回总览页面
const router = useRouter();
const backHome = ()=>{
    router.push('/');
}

//控制私信弹出
const active = ref<boolean>(false)
const changeMessage = (boo:boolean)=>{
    active.value = boo;
}
</script>

<style lang="less" scoped>
.head-bar{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 64px;
    background: @bg-color-l;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 @space-xl;
    z-index: 10;
    .logo{
    width: 38px;
    height: 24px;
    }
    .name{
        font-size: 20px;
        font-weight: 600;
    }
}
</style>