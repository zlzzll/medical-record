<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
// import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axiosService from "../utils/axios-test"
import { TemplateFile } from '../types/types';
import { DocumentAdd } from '@element-plus/icons-vue';

// const router = useRouter();
const fileName = ref('');
const templateId = ref('');
// 2. 创建axios实例（网页5/网页9）


// 3. 响应式数据
const options = ref<TemplateFile[]>([])
const currentPage = ref(1)
const loading = ref(false)
const hasMore = ref(true)

// 4. 数据获取方法（网页6/网页9）
const fetchData = async (page: number) => {
  try {
    const response = await axiosService.post("/api/template/page", {
      currentPage: currentPage.value,
      pageSize: page
    })
    return response.data.data.data
  } catch (error) {
    console.error('请求失败:', error)
    return []
  }
}

// 5. 初始化加载（网页7）
const loadFirstPage = async () => {
  if (options.value.length > 0 || loading.value) return

  loading.value = true
  options.value = await fetchData(10)
  currentPage.value = 2
  loading.value = false
  console.log(options.value)
}

// 6. 滚动处`理
const handleScroll = async (e: Event) => {
  const target = e.target as HTMLSelectElement
  const { scrollTop, scrollHeight, clientHeight } = target

  // 滚动到底部阈值判断（距底部50px触发）
  if (scrollHeight - (scrollTop + clientHeight) < 50
    && !loading.value
    && hasMore.value
  ) {
    loading.value = true
    const newData = await fetchData(currentPage.value)

    options.value = [...options.value, ...newData]
    hasMore.value = newData.length >= 10 // 根据实际接口调整
    currentPage.value++
    loading.value = false
  }
}

const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
const handleSubmit = async () => {
  const typename = ".docx";
  if (!fileName.value) {
    ElMessage.warning('请输入文件名称');
    return;
  }

  try {
    const response = await axiosService.post("/api/record/create", {
      templateId: templateId.value,
      aiCaseName:  `${fileName.value}__${userInfo.organization}${typename}` 
    });

    const caseId = response.data.data.caseId;
    if (!caseId) {
      ElMessage.error('创建病历失败，没有返回 caseId');
      return;
    }

    let fileUrl = localStorage.getItem(`fileUrl_${templateId.value}`);
    if (!fileUrl) {
      const fileResponse = await axiosService.get(`/api/template/download/${templateId.value}`);
      if (fileResponse.data.code === 200) {
        fileUrl = fileResponse.data.data;
        localStorage.setItem(`fileUrl_${templateId.value}`, fileUrl || '');
      } else {
        ElMessage.error('获取文件 URL 失败');
        return;
      }
    }

    const fullFileName = fileName.value + typename;

    // 存入本地映射
    const fileMappings = JSON.parse(localStorage.getItem('fileMappings') || '{}');
    fileMappings[caseId] = { templateId: templateId.value, fileName: fullFileName, fileUrl };
    localStorage.setItem('fileMappings', JSON.stringify(fileMappings));

    // 存入localStorage缓存
    localStorage.setItem('currentFileData', JSON.stringify({
      templateId: templateId.value,
      caseId,
      fileName: fullFileName,
      fileUrl
    }));

    // 跳转到文件编辑页面
    const encodedFileName = encodeURIComponent(fullFileName);
    const encodedFileUrl = encodeURIComponent(fileUrl || '');
    window.location.href = `/FileEditor?caseId=${caseId}&fileName=${encodedFileName}&fileUrl=${encodedFileUrl}`;

    ElMessage.success('病历文件创建成功');
  } catch (e) {
    console.error(e);
    ElMessage.error('病历文件创建失败');
  }
};




// 7. 生命周期管理（网页3）
onMounted(() => {
  const selectEl = document.querySelector('select')
  selectEl?.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  const selectEl = document.querySelector('select')
  selectEl?.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="create-container">
    <div class="background-pattern"></div>
    
    <div class="create-card">
      <div class="card-header">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="url(#paint0_linear)"/>
            <path d="M14 2V8H20" fill="#E3F2FD"/>
            <path d="M12 18V12" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M9 15H15" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <defs>
              <linearGradient id="paint0_linear" x1="4" y1="12" x2="20" y2="12" gradientUnits="userSpaceOnUse">
                <stop stop-color="#2196F3"/>
                <stop offset="1" stop-color="#1976D2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div style="display: flex;flex-direction: column;">
          <h2>创建新病历</h2>
        <p>选择模板并命名您的病历</p>
        </div>
      </div>

      <div class="card-body">
        <div class="form-group">
          <label>模板类别 <span class="optional">(可选)</span></label>
          <el-select 
            v-model="templateId" 
            @click="loadFirstPage" 
            @scroll.passive="handleScroll" 
            class="template-select"
            placeholder="请选择模板"
          >
            <el-option v-for="item in options" :key="item.id" :value="item.id" :label="item.templateName" />
            <el-option v-if="loading" disabled>加载中...（已加载{{ options.length }}条）</el-option>
          </el-select>
        </div>

        <div class="form-group">
          <label>病历名称 <span class="required">*</span></label>
          <el-input 
            v-model="fileName" 
            placeholder="请输入病历名称" 
             :clearable="true"
            class="file-input"
          />
        </div>

        <el-button 
          type="primary" 
          @click="handleSubmit" 
          size="large" 
          class="submit-btn"
          :icon="DocumentAdd"
        >
          创建病历
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
  min-height: 100vh;
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
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  display: flex;
  flex-direction:column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.header-icon {
  width: 80px;
  height: 80px;
  margin: 0 1rem 1rem;
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
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #424242;
}

.required {
  color: #f44336;
  font-size: 0.8em;
}

.optional {
  color: #757575;
  font-size: 0.8em;
  font-style: italic;
}

.template-select {
  width: 100%;
}

.file-input {
  width: 100%;
}

.submit-btn {
  width: 100%;
  margin-top: 1.5rem;
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
}
</style>