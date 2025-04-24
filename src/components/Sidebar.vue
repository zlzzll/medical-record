<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue';
import { User, Notebook, Document, Unlock, FolderAdd, DocumentAdd } from '@element-plus/icons-vue';

const route = useRoute()
const router = useRouter();
const src = ref("https://tse3-mm.cn.bing.net/th/id/OIP-C.JCEcaQJVR_vC2kgt6BGZlAAAAA?rs=1&pid=ImgDetMain");

onMounted(() => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    src.value = JSON.parse(userInfo).avatarUrl;
  }
});

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div v-if="!route.path.includes('/Editor') && !route.path.includes('/FileEditor')" class="sidebar">
    <div class="menu">
      <div class="menu-item" @click="navigateTo('/modelfile')" :class="{ active: route.path === '/modelfile' }">
        <el-icon>
          <Notebook />
        </el-icon>
        <span class="menu-text">模板管理</span>
      </div>

      <div class="menu-item" @click="navigateTo('/create-template')" :class="{ active: route.path === '/create-template' }">
        <el-icon>
          <FolderAdd />
        </el-icon>
        <span class="menu-text">创建模板</span>
      </div>
      
      <div class="menu-item" @click="navigateTo('/filemanage')" :class="{ active: route.path === '/filemanage' }">
        <el-icon>
          <Document />
        </el-icon>
        <span class="menu-text">病历管理</span>
      </div>

      <div class="menu-item" @click="navigateTo('/createfile')" :class="{ active: route.path === '/createfile' }">
        <el-icon>
          <DocumentAdd />
        </el-icon>
        <span class="menu-text">创建病历</span>
      </div>
      
      <div class="menu-item" @click="navigateTo('/permissions')" :class="{ active: route.path === '/permissions' }">
        <el-icon>
          <Unlock />
        </el-icon>
        <span class="menu-text">用户管理</span>
      </div>
      
      <div class="menu-item" @click="navigateTo('/setting')" :class="{ active: route.path === '/setting' }">
        <el-icon>
          <User />
        </el-icon>
        <span class="menu-text">个人信息</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

/* 侧边栏主容器 */
.sidebar {
  width: clamp(80px, 20vw, 220px);
  height: 100vh;
  background: linear-gradient(135deg, #1a2b3c 0%, #2c3e50 100%);
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.2);
  z-index: 10;
  position: relative;
  overflow: hidden;
}

/* 添加动态背景效果 */
.sidebar::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(24, 144, 255, 0.1) 0%, transparent 70%);
  animation: gradientRotate 15s linear infinite;
  z-index: -1;
}

@keyframes gradientRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 菜单项样式 */
.menu {
  flex: 1;
  padding: 2vh 0;
  overflow-y: auto;
  /* 移除滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.menu::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Opera */
}

.menu-item {
  height: clamp(40px, 6vh, 50px);
  display: flex;
  align-items: center;
  padding: 0 clamp(10px, 1.5vw, 20px);
  margin: 0 10px 8px;
  font-size: clamp(12px, 1.1vw, 14px);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  position: relative;
  overflow: hidden;
}

.menu-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: all 0.6s ease;
}

.menu-item:hover::after {
  left: 100%;
}

.menu-item i {
  margin-right: clamp(8px, 1vw, 12px);
  font-size: clamp(16px, 1.5vw, 18px);
  transition: all 0.3s ease;
}

.menu-text {
  transition: all 0.3s ease;
  white-space: nowrap; /* 防止文字换行 */
  overflow: hidden;
  text-overflow: ellipsis; /* 文字过长时显示省略号 */
}

/* 悬停效果 */
.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.menu-item:hover i {
  color: #1890ff;
  transform: scale(1.1);
}

.menu-item:hover .menu-text {
  color: #fff;
  text-shadow: 0 0 5px rgba(24, 144, 255, 0.5);
}

/* 激活状态 */
.menu-item.active {
  background: linear-gradient(90deg, rgba(24, 144, 255, 0.3) 0%, rgba(24, 144, 255, 0.1) 100%);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
  color: #fff;
  border-left: 3px solid #1890ff;
}

.menu-item.active i {
  color: #1890ff;
}

/* 响应式设计 - 修改为始终显示文字 */
@media (max-width: 768px) {
  .sidebar {
    width: clamp(150px, 30vw, 220px); /* 调整最小宽度确保文字可见 */
  }
  
  .menu-item {
    padding: 0 10px; /* 保持适当的内边距 */
  }
  
  .menu-text {
    display: inline; /* 确保文字始终显示 */
  }
  
  .menu-item i {
    margin-right: 8px; /* 保持图标和文字的间距 */
  }
}
</style>