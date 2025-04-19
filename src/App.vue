<script setup lang="ts">
import { useRouter } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import { useUserStore } from './store';
import Topbar from './components/Topbar.vue';
import { ArrowDownBold } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();

// 判断当前路由是否需要显示侧边栏
const shouldShowSidebar = () => {
  const publicRoutes = ['Login', 'Register', 'ForgotPassword', 'Email', 'Wrong', 'Editor', 'FileEditor'];
  return !publicRoutes.includes(router.currentRoute.value.name as string);
};
</script>

<template>
  <div class="app-layout">
    <!-- 顶部栏 -->
    <Topbar v-if="shouldShowSidebar() && userStore.shouldShowTopbar" class="topbar" />
    
    <div class="content-container">
      <!-- 侧边栏 -->
      <Sidebar 
        v-if="shouldShowSidebar() && userStore.shouldShow" 
        class="sidebar"
      />
      
      <!-- 主内容区 -->
      <main class="main-content" :class="{ 'full-width': !(shouldShowSidebar() && userStore.shouldShow) }">
        <!-- 简洁模式下的顶部栏显示按钮 -->
        <div 
          v-if="!userStore.shouldShowTopbar" 
          class="show-topbar-btn"
        >
          <el-button 
            @click="userStore.shouldShowTopbar = true"
            type="primary"
            circle
          >
            <el-icon><ArrowDownBold /></el-icon>
          </el-button>
        </div>
        
        <!-- 路由视图 -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background-color: #f5f7fa;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.content-container {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 60px); /* 减去顶部栏高度 */
}

.sidebar {
  flex-shrink: 0;
  height: calc(100vh - 60px); /* 减去顶部栏高度 */
  position: sticky;
  top: 60px; /* 顶部栏高度 */
  overflow-y: auto;
}

.main-content {
  flex: 1;
  min-height: calc(100vh - 60px); /* 减去顶部栏高度 */
  overflow-y: auto;
  /* padding: 20px; */
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
  transition: all 0.3s ease;
}

.main-content.full-width {
  background: #ffffff;
}

.show-topbar-btn {
  position: fixed;
  top: 10px;
  right: 20px;
  z-index: 1001;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
  }
  
  .main-content {
    min-height: auto;
    padding: 15px;
  }
}
</style>

<style>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);

  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #909399;
}
</style>