<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import axiosService from "../utils/axios-test"
import { DocumentAdd, Delete, QuestionFilled } from '@element-plus/icons-vue';

const router = useRouter();

// 响应式数据
const templateName = ref('');
const templateType = ref('b类');
const fileList = ref<File[]>([]);
const fileInput = ref<HTMLInputElement>();
const isDragging = ref(false);
const loading = ref(false);

// 文件处理逻辑
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  handleFile(input.files?.[0]);
  input.value = '';
};

const handleFile = (file: File | undefined) => {
  if (!file) return;

  if (!file.name.endsWith('.docx')) {
    ElMessage.error('请上传docx格式的文件');
    return;
  }

  // 单文件限制
  if (fileList.value.length >= 1) {
    fileList.value = [];
  }

  // 大小限制（50MB）
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    ElMessage.warning('文件大小不能超过50MB');
    return;
  }

  fileList.value.push(file);
};

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFile(files[0]);
    if (files.length > 1) {
      ElMessage.warning('每次只能上传一个文件');
    }
  }
};

const formatSize = (size: number) => {
  const MB = size / (1024 * 1024);
  return MB >= 1 ? `${MB.toFixed(1)} MB` : `${(size / 1024).toFixed(1)} KB`;
};

const removeFile = (index: number) => {
  fileList.value.splice(index, 1);
};

// 提交逻辑
const handleSubmit = async () => {
  if (!templateName.value.trim()) {
    ElMessage.warning('请输入模板名称');
    return;
  }

  if (fileList.value.length === 0) {
    ElMessage.warning('请上传模板文件');
    return;
  }

  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/;
  if (!nameRegex.test(templateName.value) || templateName.value.includes('.')) {
    ElMessage.error('模板名称包含非法字符或点号');
    return;
  }

  try {
    loading.value = true;

    const formData = new FormData();
    if (templateType.value == 'b类') {
      templateType.value = 'case_b'
    }

    formData.append('multipartFile', fileList.value[0]);
    const jsonData = {
      templateName: templateName.value + ".docx",
      category: templateType.value
    };

    const reqBlob = new Blob([JSON.stringify(jsonData)], {
      type: 'application/json'
    });
    formData.append('req', reqBlob);

    const response = await axiosService.post('/api/template/upload', formData);

    if (response.data.code === 200) {
      ElMessage.success('模板创建成功');
      router.push('/modelfile');
    } else {
      throw new Error(response.data.message || '上传失败');
    }
  } catch (error) {
    let message = '请求失败，请稍后重试';
    if (axios.isAxiosError(error)) {
      if (error.response) {
        message = error.response.data.message || `服务器错误：${error.response.status}`;
      } else if (error.request) {
        message = '网络连接超时，请检查网络';
      }
    } else if (error instanceof Error) {
      message = error.message;
    }
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="create-container">
    <div class="background-pattern"></div>

    <div class="create-card">
      <div class="card-header">
        <div class="header-icon">
          <svg t="1744272484522" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3902" width="200" height="200"><path d="M778.24 552.96c-124.5184 0-225.28 100.7616-225.28 225.28s100.7616 225.28 225.28 225.28 225.28-100.7616 225.28-225.28-100.7616-225.28-225.28-225.28z m123.904 349.184c-32.9728 33.1776-77.0048 51.4048-123.904 51.4048s-90.7264-18.2272-123.904-51.4048c-33.1776-32.9728-51.4048-77.0048-51.4048-123.904s18.2272-90.7264 51.4048-123.904c32.9728-33.1776 77.0048-51.4048 123.904-51.4048s90.7264 18.2272 123.904 51.4048c33.1776 32.9728 51.4048 77.0048 51.4048 123.904s-18.2272 90.7264-51.4048 123.904z" p-id="3903" fill="#fbfbfb"></path><path d="M803.6352 678.0928h-50.176v75.1616h-74.9568v49.9712h74.9568v75.1616h50.176v-75.1616h75.1616v-49.9712h-75.1616zM798.72 20.48v204.8h204.8V20.48H798.72z m162.816 123.2896v40.96h-120.6272v-123.6992h40.96v50.7904l50.7904-50.7904 28.8768 28.8768-53.6576 53.6576h53.6576v0.2048zM173.6704 672.5632h363.52l20.48-40.3456H173.6704zM587.9808 488.6528H173.6704v40.3456h414.3104zM360.448 140.288h-96.6656v62.2592H497.8688v-62.464H401.2032V79.872h116.736v-59.392h-274.432v59.5968H360.448zM587.9808 344.2688H180.8384c-1.4336 0-3.072-0.4096-4.3008 0.2048-1.2288 0.4096-3.072 1.8432-3.072 2.6624-0.2048 12.6976-0.2048 25.3952-0.2048 38.0928H587.776v-40.96h0.2048zM679.1168 219.136v311.296l61.6448-18.432V198.2464c0-31.9488-26.2144-57.9584-57.9584-57.9584h-137.4208v62.2592h117.1456c9.0112 0 16.5888 7.3728 16.5888 16.5888z" p-id="3904" fill="#fbfbfb"></path><path d="M98.7136 924.672c-9.216 0-16.5888-7.5776-16.5888-16.5888V219.136c0-9.216 7.5776-16.5888 16.5888-16.5888h117.3504v-62.2592h-137.6256c-31.9488 0-57.9584 26.2144-57.9584 57.9584v729.7024c0 31.9488 26.2144 57.9584 57.9584 57.9584h528.384l-51.2-61.2352h-456.9088z" p-id="3905" fill="#fbfbfb"></path></svg>
        </div>
        <h2>创建新模板</h2>
        <p>设置模板信息并上传文件</p>
      </div>

      <div class="card-body">
        <div class="form-group">
          <label>模板类别 <el-tooltip content="当前仅有创建b类模板权限" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip></label>
          <el-select v-model="templateType" class="template-select" disabled>
            <el-option value="a类" label="a类 (不可用)" disabled />
            <el-option value="b类" label="b类" />
          </el-select>
        </div>

        <div class="form-group">
          <label>模板名称 <span class="required">*</span></label>
          <el-input v-model="templateName" placeholder="请输入模板名称" :clearable="true"  class="template-input" maxlength="50"
            show-word-limit />
        </div>

        <div class="form-group">
          <label>模板文件 <span class="required">*</span></label>
          <div class="upload-area" :class="{ 'dragging': isDragging }" @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false" @drop.prevent="handleDrop" @click="fileInput?.click()">
            <transition name="fade" mode="out-in">
              <div v-if="fileList.length === 0" class="upload-placeholder">
                <div class="upload-icon">
                  <el-icon :size="40">
                    <DocumentAdd />
                  </el-icon>
                </div>
                <p>点击或拖拽文件到此处上传</p>
                <small>仅支持 .docx 文件，最大 50MB</small>
              </div>

              <div v-else class="file-list">
                <div v-for="(file, index) in fileList" :key="index" class="file-item">
                  <div class="file-info">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatSize(file.size) }}</span>
                  </div>
                  <el-button type="danger" :icon="Delete" circle @click.stop="removeFile(index)" size="small" />
                </div>
              </div>
            </transition>
          </div>
          <input type="file" ref="fileInput" style="display: none" @change="handleFileChange" accept=".docx" />
        </div>

        <el-button type="primary" @click="handleSubmit" size="large" class="submit-btn" :loading="loading">
          {{ loading ? '提交中...' : '创建模板' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 让按钮点击后不产生黑边 */
button {
  outline: none;
}


.create-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 10% 20%, rgba(33, 150, 243, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 90% 30%, rgba(25, 118, 210, 0.1) 0%, transparent 25%),
    radial-gradient(circle at 50% 80%, rgba(13, 71, 161, 0.1) 0%, transparent 30%);
  z-index: 0;
}

.create-card {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(33, 150, 243, 0.2);
  overflow: hidden;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.create-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(33, 150, 243, 0.3);
}

.card-header {
  padding: 2rem 2rem 1rem;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
}

.header-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 1rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.card-header p {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-size: 1rem;
}

.card-body {
  padding-bottom:1rem;
  padding-left: 1rem;
  padding-right: 1rem ;
  margin-top: 15px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #424242;
  gap: 0.5rem;
}

.required {
  color: #f44336;
  font-size: 0.8em;
}

.template-select,
.template-input {
  width: 100%;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;

}

.upload-area.dragging {
  border-color: #2196F3;
  background-color: rgba(33, 150, 243, 0.05);
}

.upload-placeholder {
  color: #757575;
}

.upload-icon {
  margin-bottom: 1rem;
  color: #2196F3;
}

.upload-placeholder p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.upload-placeholder small {
  font-size: 0.8rem;
  color: #9e9e9e;
}

.file-list {
  width: 100%;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background: #f5f7fa;
  border-radius: 6px;
}

.file-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.file-size {
  font-size: 0.8rem;
  color: #757575;
}

.submit-btn {
  width: 100%;
  margin-top:0.5rem;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  border: none;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #1976D2 0%, #0d47a1 100%);
  transform: translateY(-2px);
}

.submit-btn:active {
  transform: translateY(0);
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
  .create-container {
    padding: 1rem;
  }
  
  .card-header {
    padding: 1.5rem 1rem 1rem;
  }
  
  .header-icon {
    width: 60px;
    height: 60px;
  }
  
  .card-body {
    padding: 1.5rem 1rem;
  }
  
  .upload-area {
    padding: 1.5rem;
    min-height: 150px;
  }
}
</style>