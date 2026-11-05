<script setup lang="ts">
import ContentImage from '../components/ContentImage.vue'
</script>

<template>
  <div class="page-shell">
    <!-- 关于页是静态品牌内容，不依赖后台接口，也不会出现登录或私信入口 -->
    <section class="about-grid">
      <div class="portrait">
        <ContentImage alt="ethan肖像的抽象视觉" :tone="4" />
        <span>LIN YE · 2026</span>
      </div>
      <div>
        <div class="eyebrow">about · hello</div>
        <h1 class="editorial-title mt-4 text-[clamp(38px,4.4vw,54px)] leading-[1.28]">
          你好，我是ethan。<br>
          一个缓慢写作的开发者。
        </h1>
        <p class="about-copy">
          目前居住在上海，做前端开发，也维护这个叫“伊森随笔”的个人博客。这里记录设计、代码、摄影和那些还没有形成结论的生活片段。
        </p>
        <p class="about-copy">
          我希望它像一本可以随时翻开的个人杂志：每次来都能找到一篇值得读完的文章，而不是被更多入口和碎片信息追赶。
        </p>
        <div class="now-grid">
          <div>
            <span>NOW / 正在做</span>
            <b>打磨一个小而安静的阅读产品</b>
          </div>
          <div>
            <span>ELSEWHERE / 也可以在这里找到我</span>
            <b>GitHub · RSS · 邮件订阅</b>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.about-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
  gap: 58px;
  align-items: start;
  padding: 46px 0 24px;
}

.portrait {
  position: relative;
  min-height: 420px;
  overflow: hidden;
  border-radius: 4px;
}

.portrait > span {
  position: absolute;
  bottom: 16px;
  left: 18px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 10px;
  letter-spacing: 0.14em;
}

.about-copy {
  margin: 0 0 13px;
  color: #4d4f4b;
  font-family: "Songti SC", "STSong", serif;
  font-size: 14px;
  line-height: 1.95;
}

h1 + .about-copy {
  margin-top: 18px;
}

.now-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 28px;
}

.now-grid > div {
  min-height: 112px;
  padding: 15px;
  background: var(--paper-deep);
}

.now-grid span {
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.12em;
}

.now-grid b {
  display: block;
  margin-top: 8px;
  font-family: "Songti SC", "STSong", serif;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.55;
}

@media (max-width: 780px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 28px;
    padding-top: 32px;
  }

  .portrait {
    min-height: 320px;
  }
}

@media (max-width: 470px) {
  .now-grid {
    grid-template-columns: 1fr;
  }
}
</style>
