<template>
    <nav class="login-nav">
        <yk-space align="center" :size="12" style="cursor: pointer;">
            <img class="logo" src="../assets/vite.svg" alt="logo">
            <span class="name">博客创作者中心</span>
        </yk-space>
    </nav>
</template>

<style lang="less" scoped>
.login-nav{
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