<template>
    <main class="login-page">
        <section class="login-card">
            <div class="login-brand">
                <img src="../assets/vite.svg" alt="blog logo">
                <div>
                    <p class="login-eyebrow">BLOG MANAGEMENT</p>
                    <h1>欢迎回来</h1>
                </div>
            </div>
            <p class="login-description">登录后管理文章、图库、文件与日记。</p>
            <form @submit.prevent="submit">
                <label>
                    <span>账号</span>
                    <input v-model.trim="form.name" autocomplete="username" placeholder="请输入账号">
                </label>
                <label>
                    <span>密码</span>
                    <input v-model="form.password" type="password" autocomplete="current-password" placeholder="请输入密码">
                </label>
                <p v-if="error" class="login-error">{{ error }}</p>
                <button type="submit" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
            </form>
            <p class="login-hint">本地演示账号：tom / 123456</p>
        </section>
    </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

// 路由实例，登录成功后跳转总览
const router = useRouter()
// 登录状态
const auth = useAuthStore()
// 登录请求状态
const loading = ref(false)
// 登录错误提示
const error = ref('')
// 登录表单数据
const form = reactive({
    name: 'tom',
    password: '123456',
})

// 提交登录：校验表单、获取 token 并进入后台
const submit = async () => {
    if (!form.name || !form.password) {
        error.value = '请输入账号和密码'
        return
    }
    loading.value = true
    error.value = ''
    try {
        await auth.login(form.name, form.password)
        await router.replace('/overview')
    } catch (reason) {
        error.value = reason instanceof Error ? reason.message : '登录失败'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped lang="less">
.login-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 32px;
    background:
        radial-gradient(circle at 15% 20%, rgba(43, 90, 237, .18), transparent 34%),
        radial-gradient(circle at 85% 80%, rgba(0, 201, 245, .18), transparent 32%),
        @bg-color-m;
}

.login-card {
    width: 420px;
    max-width: 100%;
    padding: 40px;
    border: 1px solid rgba(255, 255, 255, .75);
    border-radius: 24px;
    background: rgba(255, 255, 255, .88);
    box-shadow: 0 24px 80px rgba(34, 56, 120, .14);
    backdrop-filter: blur(18px);
}

.login-brand {
    display: flex;
    align-items: center;
    gap: 16px;

    img {
        width: 48px;
        height: 48px;
    }

    h1 {
        margin: 2px 0 0;
        font-size: 30px;
    }
}

.login-eyebrow {
    margin: 0;
    color: @font-color-s;
    font-size: 11px;
    letter-spacing: .16em;
}

.login-description {
    margin: 24px 0 28px;
    color: @font-color-s;
}

form {
    display: grid;
    gap: 18px;

    label {
        display: grid;
        gap: 8px;
        color: @font-color-m;
        font-size: 14px;
    }

    input {
        height: 46px;
        padding: 0 14px;
        border: 1px solid @line-color-s;
        border-radius: 12px;
        outline: none;
        background: #fff;
        color: @font-color-l;
        font: inherit;
        transition: border-color .2s, box-shadow .2s;

        &:focus {
            border-color: @pcolor;
            box-shadow: 0 0 0 4px @pcolor-1;
        }
    }

    button {
        height: 48px;
        border: 0;
        border-radius: 12px;
        background: @pcolor;
        color: #fff;
        font: inherit;
        font-weight: 600;
        cursor: pointer;

        &:disabled {
            cursor: wait;
            opacity: .65;
        }
    }
}

.login-error {
    margin: -6px 0 0;
    color: #d83b3b;
    font-size: 13px;
}

.login-hint {
    margin: 22px 0 0;
    color: @font-color-s;
    font-size: 12px;
    text-align: center;
}
</style>
