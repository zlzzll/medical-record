<script setup lang="ts">
import { ref } from 'vue';
// import axios from 'axios';
import { UserInfo } from '../types/types';
import { useUserStore } from '../store/index'
import { ElMessage } from 'element-plus';
import axiosService from "../utils/axios-test"
const userStore = useUserStore()

const userInfo = ref<UserInfo>({
    id: 0,
    userName: '',
    email: '',
    organization: '',
    avatarUrl: ''
})

//利用本地缓存初始化userInfo
if (userStore.$state.userInfo) {
    userInfo.value = {
        id: userStore.$state.userInfo.id,
        userName: userStore.$state.userInfo.userName,
        email: userStore.$state.userInfo.email,
        organization: userStore.$state.userInfo.organization,
        avatarUrl: userStore.$state.userInfo.avatarUrl
    };
}

const isEditing = ref(false);
const showAvatarDialog = ref(false);
const selectedFile = ref<File | null>(null);
const avatarPreview = ref('');


// 进入编辑模式
const enterEditMode = () => {
    isEditing.value = true;
};

// 保存用户信息
const saveUserInfo = async () => {
    // 若未修改任何信息，不执行保存操作
    if (userInfo.value.userName === userStore.$state.userInfo?.userName && userInfo.value.organization === userStore.$state.userInfo?.organization) {
        return;
    }

    // 若 userName 或 organization 为空，弹出提示并返回
    if (!userInfo.value.userName || !userInfo.value.organization) {
        ElMessage.error('用户名和机构不能为空');
        return;
    }

    // // 测试部分
    // userInfo.value.userName = userInfo.value.userName
    // userInfo.value.organization = userInfo.value.organization
    // localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    // userStore.updatUser()
    // isEditing.value = false;
    // return

    try {
        // 调用更新用户信息接口
        const res = await axiosService.post('/api/user/update', {
            userId: userStore.$state.userInfo?.id,
            userName: userInfo.value.userName,
            organization: userInfo.value.organization
        });
        if (res.data.code == 200) {
            // 若更新成功，更新本地用户信息
            userInfo.value.userName = userInfo.value.userName
            userInfo.value.organization = userInfo.value.organization
            localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
            userStore.updatUser()
            // localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
            ElMessage.success('保存用户信息成功');
        }

        // 关闭编辑模式
        isEditing.value = false;
    } catch (error) {
        ElMessage.error('保存用户信息失败：');
        console.error('保存失败:', error);
    }
};

// 打开头像上传对话框
const openAvatarDialog = () => {
    showAvatarDialog.value = true;
    selectedFile.value = null;
    avatarPreview.value = '';
};


// 处理文件选择
const handleFileSelect = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    // console.log(file);
    if (file) {
        selectedFile.value = file;
        //对上传的文件创建临时的链接
        avatarPreview.value = URL.createObjectURL(file);

        console.log(avatarPreview.value);
    }
};

// 上传头像
const uploadAvatar = async () => {
    if (!selectedFile.value) return;


    // //单机测试
    // if (avatarPreview.value && userStore.$state.userInfo?.avatarUrl) {
    //     // console.log("fdsfsdfsd")
    //     userStore.$state.userInfo.avatarUrl = avatarPreview.value;
    //     localStorage.setItem('userInfo', JSON.stringify(userStore.$state.userInfo))

    //     showAvatarDialog.value = false;
    //     //刷新页面以更新数据
    //     window.location.reload();
    //     ElMessage.success("头像上传成功！")
    //     return
    // }



    try {

        const formData = new FormData();
        formData.append('multipartFile', selectedFile.value);
        const jsonData = {
            userId: userStore.$state.userInfo?.id
        };
        // 将JSON转换为Blob并指定Content-Type
        const reqBlob = new Blob([JSON.stringify(jsonData)], {
            type: 'application/json'
        });
        formData.append('req', reqBlob);
        // 调用头像上传接口
        const response = await axiosService.post('/api/user/avatar/upload', formData);
        userStore.updatUser()
        showAvatarDialog.value = false;
        if (response.data.code == 200) {
            try {
                const info = await axiosService.post("/api/user/info", {
                    id: userStore.$state.userInfo?.id,
                })
                console.log("获取用户信息请求成功:！")
                console.log(info.data.data)

                // return
                if (info.data.code != 200) {
                    // ElMessage.error(response.data.msg);
                    return info.data.msg;
                }

                localStorage.setItem('userInfo', JSON.stringify(info.data.data));


            } catch {
                ElMessage.error("获取用户信息失败");

            }//刷新页面以更新数据
            window.location.reload();
            ElMessage.success("头像上传成功！")

        } else {
            ElMessage.error(response.data.msg)
        }
    } catch (error) {
        ElMessage.error('头像上传失败：' + error);
        console.error('头像上传失败:', error);
    }
};

</script>

<template>
    <div class="settings-container">
        <!-- 背景装饰元素 -->
        <div class="decorative-elements">
            <div class="circle-blue"></div>
            <div class="circle-light-blue"></div>
        </div>

        <!-- 主内容区 -->
        <div class="main-content">
            <!-- 头部标题 -->
            <div class="header-section">
                <h1 class="page-title">
                    <span class="title-text">个人信息</span>
                    <span class="title-highlight"></span>
                </h1>
            </div>

            <!-- 头像设置 -->
            <div class="avatar-section">
                <div class="avatar-card">
                    <div class="avatar-wrapper">
                        <img class="avatar" :src="userInfo.avatarUrl" alt="用户头像" />
                        <el-button class="edit-button" @click="openAvatarDialog">
                            <el-icon>
                                <CameraFilled />
                            </el-icon>
                            <span>更换头像</span>
                        </el-button>
                    </div>
                </div>
            </div>

            <!-- 个人信息表单 -->
            <div class="form-section">
                <div class="form-card">
                    <div class="form-item">
                        <label>用户名</label>
                        <div class="form-content">
                            <el-input v-if="isEditing" v-model="userInfo.userName" :clearable="true" class="form-input" />
                            <span v-else class="form-value">{{ userInfo.userName }}</span>
                        </div>
                    </div>

                    <div class="form-item">
                        <label>所属组织</label>
                        <div class="form-content">
                            <el-input v-if="isEditing" v-model="userInfo.organization" :clearable="true" class="form-input" />
                            <span v-else class="form-value">{{ userInfo.organization }}</span>
                        </div>
                    </div>

                    <div class="form-item">
                        <label>邮箱</label>
                        <div class="form-content">
                            <span class="form-value">{{ userInfo.email }}</span>
                            <el-tooltip content="邮箱用于绑定账户，无法修改" placement="top">
                                <el-icon class="help-icon">
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
                <template v-if="!isEditing">
                    <el-button type="primary" @click="enterEditMode" class="edit-btn">
                        <el-icon>
                            <Edit />
                        </el-icon>
                        <span>编辑信息</span>
                    </el-button>
                </template>
                <template v-else>
                    <el-button @click="isEditing = false" class="cancel-btn">
                        <el-icon>
                            <Close />
                        </el-icon>
                        <span>取消</span>
                    </el-button>
                    <el-button type="primary" @click.prevent="saveUserInfo" class="save-btn">
                        <el-icon>
                            <Check />
                        </el-icon>
                        <span>保存修改</span>
                    </el-button>
                </template>
            </div>
        </div>

        <!-- 头像上传对话框 -->
        <el-dialog v-model="showAvatarDialog" title="上传新头像" width="500px" class="avatar-dialog">
            <div class="dialog-content">
                <div class="avatar-preview">
                    <img v-if="avatarPreview" :src="avatarPreview" alt="预览" />
                    <div v-else class="avatar-placeholder">
                        <el-icon>
                            <Picture />
                        </el-icon>
                        <span>选择图片预览</span>
                    </div>
                </div>

                <label class="file-upload-btn">


                    <el-icon>
                        <Upload />
                    </el-icon>
                    <span>选择文件<input type="file" accept="image/*" @change="handleFileSelect"></span>

                </label>
                <div class="dialog-actions">
                    <el-button @click="showAvatarDialog = false">取消</el-button>
                    <el-button type="primary" :disabled="!selectedFile" @click.prevent="uploadAvatar">
                        上传头像
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<style scoped>
/* 让按钮点击后不产生黑边 */
button {
  outline: none;
}


/* 全局样式 */
.settings-container {
    min-height: 100vh;
    padding: 2rem;
    position: relative;
    background: linear-gradient(135deg, #f5f9ff 0%, #e0ecff 100%);
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 背景装饰元素 */
.decorative-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
}

.circle-blue {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0) 70%);
    top: -100px;
    right: -100px;
    animation: float 8s ease-in-out infinite;
}

.circle-light-blue {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(100, 181, 246, 0.1) 0%, rgba(100, 181, 246, 0) 70%);
    bottom: 100px;
    left: -50px;
    animation: float 6s ease-in-out infinite 2s;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(5deg);
    }
}

/* 主内容区 */
.main-content {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(33, 150, 243, 0.1);
    padding: 2rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 头部标题 */
.header-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(33, 150, 243, 0.1);
}

.page-title {
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0;
    position: relative;
    display: inline-block;
    color: #2196F3;
}

.title-text {
    position: relative;
    z-index: 2;
}

.title-highlight {
    position: absolute;
    bottom: 5px;
    left: 0;
    width: 100%;
    height: 8px;
    background: rgba(33, 150, 243, 0.2);
    border-radius: 4px;
    z-index: 1;
}

/* 头像区域 */
.avatar-section {
    margin-bottom: 2rem;
}

.avatar-card {
    display: flex;
    justify-content: center;
    padding: 1.5rem;
    background: rgba(33, 150, 243, 0.05);
    border-radius: 12px;
    border: 1px dashed rgba(33, 150, 243, 0.2);
}

.avatar-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(33, 150, 243, 0.1);
}

.edit-button {
    background: rgba(33, 150, 243, 0.1);
    color: #2196F3;
    border: none;
}

.edit-button:hover {
    background: rgba(33, 150, 243, 0.2);
}

/* 表单区域 */
.form-section {
    margin-bottom: 2rem;
}

.form-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.05);
}

.form-item {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
}

.form-item:last-child {
    margin-bottom: 0;
}

.form-item label {
    width: 120px;
    font-weight: 500;
    color: #2196F3;
}

.form-content {
    flex: 1;
    display: flex;
    align-items: center;
}

.form-value {
    color: #555;
}

.help-icon {
    color: #78909c;
    cursor: help;
    margin-left: 0.5rem;
}

/* 操作按钮 */
.action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(33, 150, 243, 0.1);
}

.edit-btn,
.save-btn {
    background: linear-gradient(135deg, #2196F3, #1976D2);
    color: white;
}

.cancel-btn {
    background: rgba(33, 150, 243, 0.1);
    color: #2196F3;
}

/* 头像上传对话框 */
.avatar-dialog :deep(.el-dialog) {
    border-radius: 16px;
}

.avatar-dialog :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    margin: 0;
    padding: 1rem 1.5rem;
}

.avatar-dialog :deep(.el-dialog__title) {
    color: white;
}

.avatar-dialog :deep(.el-dialog__headerbtn) {
    color: white;
}

.dialog-content {
    padding: 1.5rem;
    text-align: center;
}

.avatar-preview {
    width: 200px;
    height: 200px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    overflow: hidden;
    border: 2px dashed rgba(33, 150, 243, 0.3);
}

.avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #78909c;
}

.file-upload-btn {
    display: inline-block;
    margin-bottom: 1.5rem;
}

.file-upload-btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: #f0f2f5;
    border-radius: 4px;
    cursor: pointer;
    margin: 1rem 0;
}

.file-upload-btn input {
    display: none;
}

.file-upload-btn:hover {
    background-color: #2196F3;
    color: #e0ecff;
    transform: scale(1.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dialog-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .settings-container {
        padding: 1rem;
    }

    .main-content {
        padding: 1.5rem;
    }

    .form-item {
        flex-direction: column;
        align-items: flex-start;
    }

    .form-item label {
        width: 100%;
        margin-bottom: 0.5rem;
    }

    .action-buttons {
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .page-title {
        font-size: 1.5rem;
    }

    .avatar-dialog :deep(.el-dialog) {
        width: 90%;
    }

    .avatar-preview {
        width: 150px;
        height: 150px;
    }
}
</style>