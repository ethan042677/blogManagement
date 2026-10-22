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
            <yk-avatar :img-url="avatarUrl"></yk-avatar>
            <!-- 暗黑模式 -->
            <div><yk-theme /></div>
            <yk-button @click="logout">退出</yk-button>
        </yk-space>
        <Message :active="active" @close="changeMessage(false)"/>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Message from './reply/Message.vue';
import { useAuthStore } from '../store/auth';
import avatarUrl from '../assets/vite.svg';
//路由实例：返回总览页面和退出后跳转
const router = useRouter();
// 登录状态
const auth = useAuthStore();
// 点击品牌区域返回总览页
const backHome = ()=>{
    router.push('/');
}

//控制私信抽屉弹出
const active = ref<boolean>(false)
// 打开或关闭私信抽屉
const changeMessage = (boo:boolean)=>{
    active.value = boo;
}
// 退出登录并清除本地 token
const logout = async () => {
    auth.logout()
    await router.replace('/login')
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
