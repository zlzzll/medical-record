<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store';
import { ElMessage } from 'element-plus';



// 路由器实例
const router = useRouter();
// 用户存储
const userStore = useUserStore();

// 表单数据
const userName = ref('');
const password = ref('');
const loading = ref(false);

// 处理登录
const handleLogin = async () => {
  if (!userName.value || !password.value) {
    ElMessage.warning('请输入用户名和密码');
    return;
  }

  loading.value = true;
  try {
    const res = await userStore.login(userName.value, password.value);

    if (res == 200) {
      ElMessage.success('登录成功');
      router.push('/modelfile');
    } else {
      //请求失败的返回

      ElMessage.error(res);
    }
  } catch (error) {
    ElMessage.error('登录失败，请重试');
  } finally {
    loading.value = false;  //判断鼠标是否挪到登录按钮
    isHovered.value = false //判断鼠标是否挪到注册按钮
  }
};




// 跳转到注册页面
const handleRegister = () => {
  router.push('/register');
};



const isHovered = ref(false);
const isHovereds = ref(false);
// 获取元素（需类型断言为 HTMLElement）
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>电子病历撰写系统</h2>
        <p>病历撰写数字化平台</p>
      </div>
      <div class="login-form">
        <div class="form-item">
          <el-input type="text" v-model="userName" size="small" placeholder="请输入邮箱" :clearable="true">
            <template #prefix>
              <el-icon size="large"><Message /></el-icon>
              <!-- prefix 和 suffix 命名的插槽 -->
            </template>
          </el-input>
        </div>

        <div class="form-item">
          <el-input v-model="password" type="password" placeholder="请输入密码" show-password @keyup.enter="handleLogin"
            size="small" clearable="true">
            <template #prefix>
              <el-icon size="large"><Lock /></el-icon>
              <!-- prefix 和 suffix 命名的插槽 -->
            </template>
          </el-input>
        </div>

        <div class="forgot-password-link">
          <router-link to="/forgot-password"><span class="forgot-password-link-fonts">忘记密码？</span></router-link>
        </div>


        <div class="actions" :class="{ 'action2': isHovered, 'action3': isHovereds }">
          <div>
            <button v-if="!loading" :disabled="loading" @click="handleLogin" @mouseenter="isHovered = true"
              @mouseleave="isHovered = false" :class="{ 'login-btn': isHovered }">
              <span class="btn-text">登录</span>
            </button>
            <el-button type="primary" class="login-btn" loading v-if="loading">
              <template #loading>
                <div class="custom-loading">
                  <svg class="circular" viewBox="-10, -10, 50, 50">
                    <path class="path" d="
            M 30 15
            L 28 17
            M 25.61 25.61
            A 15 15, 0, 0, 1, 15 30
            A 15 15, 0, 1, 1, 27.99 7.5
            L 15 15
          " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)" />
                  </svg>
                </div>
              </template>
              登录中...
            </el-button>
          </div>
          <div>
            <button @click="handleRegister" @mouseenter="isHovereds = true" @mouseleave="isHovereds = false"
              :class="{ 'login-btn': isHovereds }">
              <span class="btn-text">注册</span>
            </button>
          </div>
        </div>


        <div class="login-tips">
          <!-- <p>提示： 用户名 doctor@126.com，密码 password</p> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg');
  background-repeat: no-repeat;
  background-position: center 110px;
  background-size: 100%;
  animation: fadeIn 0.8s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

p {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

.login-box {
  width: 600px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  animation: slideUp 0.6s ease;
  transform-origin: center;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h2 {
  font-size: 28px;
  color: #1890ff;
  margin-bottom: 10px;
  animation: fadeInDown 0.8s ease;
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header p {
  font-size: 14px;
  color: #999;
  animation: fadeInDown 0.8s ease;
  animation-delay: 0.3s;
  animation-fill-mode: both;
}

.login-form {
  /* text-align: center; */
  animation: fadeIn 0.8s ease;
  animation-delay: 0.5s;
  animation-fill-mode: both;
}

.form-btn {
  width: 520px;
  margin-top: 50px;
  margin-left: 100px;
}

.actions {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  margin-top: 20px;
}

.action2 {
  margin-left: 90px;
}

.action3 {
  margin-right: 90px;
}

.form-item {
  margin-bottom: 24px;
  animation: fadeInUp 0.8s ease;
  animation-delay: calc(0.4s + var(--index, 0) * 0.1s);
  height: 40px;
  display: flex;
  flex-direction: row;
}

.forgot-password-link {
  /*  text-align: right; 将其置于盒子右端 */
  text-align: right;
  margin-bottom: 20px;
  font-size: 14px;
  color: #ed644c;
  cursor: pointer;
}

.forgot-password-link-fonts {
  color: #4cb7ed;
  font-size: 14px;
  cursor: pointer;
}

.forgot-password-link-fonts:hover {
  text-decoration: underline;
  color: #ed644c;
  transition: color 0.3s;
}


/* .form-item:nth-child(1) {
  --index: 1;
}

.form-item:nth-child(2) {
  --index: 2;
}

.form-item:nth-child(3) {
  --index: 3;
} */

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 18px;
  color: #333;
}

.form-item input {
  width: 380px;
  height: 40px;
  padding: 0 15px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;
}

.form-item input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.login-btn {
  width: 250px;
  height: 40px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.register-btn {
  position: relative;
  bottom: 60px;
  left: 370px;
}

.find-btn {
  padding: 0;
  position: relative;
  left: 370px;
  bottom: 50px;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.login-btn:hover::before {
  width: 300px;
  height: 300px;
}

.login-btn:hover {
  background-color: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.other-btn {
  width: 250px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 20px;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.login-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-tips {
  text-align: center;
  font-size: 12px;
  color: #999;
  animation: fadeIn 0.8s ease;
  animation-delay: 0.7s;
  animation-fill-mode: both;


}

.el-button .custom-loading .circular {
  margin-right: 6px;
  width: 18px;
  height: 18px;
  animation: loading-rotate 2s linear infinite;
}

.el-button .custom-loading .circular .path {
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: var(--el-button-text-color);
  stroke-linecap: round;
}

.el-input {
  height: 40px;

}
</style>