<script setup lang='ts'>
import { useRouter } from 'vue-router';
import { useUserStore } from '../store';
import { onMounted, ref } from 'vue';
import { DArrowRight, DArrowLeft, FullScreen, Rank } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const src = ref("https://tse3-mm.cn.bing.net/th/id/OIP-C.JCEcaQJVR_vC2kgt6BGZlAAAAA?rs=1&pid=ImgDetMain");

onMounted(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        src.value = JSON.parse(userInfo).avatarUrl;
    }
});

const navigateToProfile = () => {
    router.push('/setting');
};

const logout = () => {
    userStore.logout();
    router.push('/login');
};

const hiddenSidebar = () => {
    useUserStore().shouldShow = !useUserStore().shouldShow;
};

const isFullScreen =ref(false);
const FullScreens = () => {
    if (document.fullscreenElement) {
        isFullScreen.value = false;
        document.exitFullscreen();
    } else {
        isFullScreen.value = true;
        document.documentElement.requestFullscreen();
    }
};

const FullScreens2 = () => {
    useUserStore().shouldShowTopbar = false;
    useUserStore().shouldShow = false;
};
</script>

<template>
    <div class="topbar-container">
        <!-- 动态背景层 -->
        <div class="bg-animation-layer">
            <div v-for="n in 3" :key="n" class="bubble"></div>
        </div>

        <div class="logo-section">
            <div class="logo-wrapper">
                <svg t="1744207789193" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="1461" width="40" height="40">
                    <path
                        d="M778.26048 40.96h-532.48a61.50144 61.50144 0 0 0-61.44 61.44v778.24a20.48 20.48 0 0 0 20.48 20.48h614.4a20.48 20.48 0 0 0 20.48-20.48V102.4a61.50144 61.50144 0 0 0-61.44-61.44z"
                        fill="#ECEFF8" p-id="1462"></path>
                    <path
                        d="M819.24096 860.16H204.8a20.48 20.48 0 0 0-20.48 20.48v40.96a61.50144 61.50144 0 0 0 61.44 61.44h532.50048a61.50144 61.50144 0 0 0 61.44-61.44v-40.96a20.48 20.48 0 0 0-20.48-20.48zM428.38016 770.048l-35.00032-80.22016A181.61664 181.61664 0 0 0 409.62048 614.4a184.32 184.32 0 1 0-184.32 184.32h184.32a20.48 20.48 0 0 0 18.75968-28.672z"
                        fill="#6EA5FF" p-id="1463"></path>
                    <path d="M512.02048 133.12m-30.72 0a30.72 30.72 0 1 0 61.44 0 30.72 30.72 0 1 0-61.44 0Z"
                        fill="#6EA5FF" p-id="1464"></path>
                    <path
                        d="M286.72 593.92H163.84a20.48 20.48 0 1 1 0-40.96h122.88a20.48 20.48 0 1 1 0 40.96zM286.72 675.84H163.84a20.48 20.48 0 1 1 0-40.96h122.88a20.48 20.48 0 1 1 0 40.96z"
                        fill="#ECEFF8" p-id="1465"></path>
                    <path
                        d="M471.04 286.72h-184.32a20.48 20.48 0 1 1 0-40.96h184.32a20.48 20.48 0 1 1 0 40.96zM471.04 389.12h-122.88a20.48 20.48 0 0 1 0-40.96h122.88a20.48 20.48 0 1 1 0 40.96zM737.30048 798.72h-225.28a20.48 20.48 0 0 1 0-40.96h225.28a20.48 20.48 0 1 1 0 40.96z"
                        fill="#D7DCEF" p-id="1466"></path>
                    <path
                        d="M550.8096 263.74144a20.45952 20.45952 0 0 1 28.75392 0.18432l131.2768 131.21536a20.48 20.48 0 0 1-1.16736 30.02368l-143.36 122.83904a20.48 20.48 0 0 1-33.792-15.5648V307.28192a60.14976 60.14976 0 0 1 18.28864-43.52zM804.74112 395.14112l131.2768-131.21536a20.45952 20.45952 0 0 1 28.75392-0.2048A60.14976 60.14976 0 0 1 983.04 307.28192V532.48a20.48 20.48 0 0 1-33.792 15.54432l-143.36-122.83904a20.48 20.48 0 0 1-1.14688-30.0032z"
                        fill="#6EA5FF" p-id="1467"></path>
                    <path
                        d="M539.68896 516.9152l143.36-122.83904a20.48 20.48 0 0 1 27.79136 1.06496L757.76 442.10176l46.96064-46.91968a20.45952 20.45952 0 0 1 27.79136-1.08544l143.36 122.83904a20.48 20.48 0 0 1 7.14752 15.54432v20.48a61.48096 61.48096 0 0 1-61.44 61.39904h-156.63104l-96.768 77.4144a20.48 20.48 0 0 1-33.28-15.99488v-61.41952h-40.96a61.48096 61.48096 0 0 1-61.44-61.41952v-20.48a20.48 20.48 0 0 1 7.168-15.52384z"
                        fill="#D7DCEF" p-id="1468"></path>
                    <path
                        d="M880.5376 435.2l-48.00512-41.12384a20.45952 20.45952 0 0 0-27.79136 1.06496l-46.96064 46.94016-46.94016-46.94016a20.48 20.48 0 0 0-27.81184-1.06496l-47.98464 41.12384 79.29856 79.27808a61.41952 61.41952 0 0 0 86.89664 0z"
                        fill="#6EA5FF" p-id="1469"></path>
                    <path
                        d="M550.42048 264.11008a60.29312 60.29312 0 0 1 43.54048-18.26816H921.6a60.29312 60.29312 0 0 1 43.56096 18.26816 20.48 20.48 0 0 1-0.2048 28.75392l-192.69632 192.65536a20.48 20.48 0 0 1-28.95872 0L550.62528 292.864a20.48 20.48 0 0 1-0.2048-28.75392z"
                        fill="#D7DCEF" p-id="1470"></path>
                </svg>
                <div class="title">
                    <h2>电子病历撰写系统</h2>
                    <p>病历撰写数字化平台</p>
                </div>
            </div>

            <div class="action-buttons">
                <el-tooltip effect="dark" :content="useUserStore().shouldShow ? '收起侧边栏' : '展开侧边栏'" placement="bottom">
                    <button class="action-btn" @click="hiddenSidebar">
                        <el-icon :size="20">
                            <DArrowLeft v-if="useUserStore().shouldShow" />
                            <DArrowRight v-else />
                        </el-icon>
                    </button>
                </el-tooltip>

                <el-tooltip effect="dark" :content=" isFullScreen?'退出全屏':'全屏' "  placement="bottom">
                    <button class="action-btn" @click="FullScreens">
                        <el-icon :size="18">
                            <FullScreen />
                        </el-icon>
                    </button>
                </el-tooltip>

                <el-tooltip effect="dark" content="简洁模式" placement="bottom">
                    <button class="action-btn" @click="FullScreens2">
                        <el-icon :size="18">
                            <Rank />
                        </el-icon>
                    </button>
                </el-tooltip>
            </div>
        </div>

        <div class="user-section">
            <div class="user-info" @click="navigateToProfile">
                <el-tooltip effect="dark" content="个人信息" placement="bottom">
                    <div class="avatar">
                        <img :src="src" alt="User Avatar" />
                    </div>
                </el-tooltip>
                <span class="username">{{ userStore.$state.userInfo?.userName }}</span>
            </div>

            <el-tooltip effect="dark" content="退出登录" placement="bottom">
                <button class="logout-btn" @click="logout">
                    <el-icon>
                        <SwitchButton />
                    </el-icon>
                </button>
            </el-tooltip>
        </div>
    </div>
</template>

<style scoped>
/* 让按钮点击后不产生黑边 */
button {
  outline: none;
}
/* 基础样式 */
.topbar-container {
    position: relative;
    height: 60px;
    background: linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    overflow: hidden;
}

/* 动态背景层 */
.bg-animation-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
}

.bubble {
    position: absolute;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    animation: float 15s infinite ease-in-out;
    filter: blur(20px);
}

@keyframes float {
    0% {
        transform: translateY(0) translateX(0);
        opacity: 0.1;
    }

    50% {
        transform: translateY(-100px) translateX(100px);
        opacity: 0.2;
    }

    100% {
        transform: translateY(-200px) translateX(0);
        opacity: 0.1;
    }
}

/* 顶部发光效果 */
.topbar-container::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 3s infinite linear;
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

/* 左侧logo区域 */
.logo-section {
    display: flex;
    align-items: center;
    gap: 20px;
}

.logo-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
}

.title h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    background: linear-gradient(to right, #ffffff, #e0f7fa);
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.5px;
}

.title p {
    margin: 2px 0 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
}

/* 操作按钮区域 */
.action-buttons {
    display: flex;
    align-items: center;
    gap: 12px;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.action-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:active {
    transform: translateY(0);
    box-shadow: none;
}

/* 右侧用户区域 */
.user-section {
    display: flex;
    align-items: center;
    gap: 16px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.user-info:hover {
    background: rgba(255, 255, 255, 0.1);
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
}

.avatar:hover {
    border-color: white;
    transform: scale(1.05);
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.username {
    font-size: 14px;
    font-weight: 500;
}

/* 退出按钮 */
.logout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.logout-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(15deg);
}

.logout-btn:active {
    transform: scale(0.95) rotate(15deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .topbar-container {
        padding: 0 16px;
    }

    .title p {
        display: none;
    }

    .username {
        display: none;
    }
}
</style>