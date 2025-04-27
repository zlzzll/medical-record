<template>
  <div class="template-management">
    <!-- 背景装饰元素 -->
    <div class="decorative-elements">
      <div class="circle-blue"></div>
      <div class="circle-light-blue"></div>
      <div class="wave-pattern"></div>
    </div>

    <!-- 主容器 -->
    <div class="main-container">
      <!-- 头部区域 - 重新设计 -->
      <div class="header-section">
        <div class="header-content">
          <div class="title-wrapper">
            <h1 class="page-title">
              <span class="title-text">用户管理</span>
              <span class="title-highlight"></span>
            </h1>
            <p class="page-subtitle">管理者可进行用户管理 <span class="blink-dot">·</span></p>
          </div>
          <div class="header-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon>
                  <Files />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalUsers }}</div>
                <div class="stat-label">总用户数</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-grid">
          <div class="filter-item">
            <label>用户 ID</label>
            <el-input placeholder="输入用户 ID" :clearable="true" class="filter-input" v-model="search.userId" />
          </div>
          <div class="filter-item">
            <label>用户名称</label>
            <el-input placeholder="输入用户名称" :clearable="true" class="filter-input" v-model="search.userName" />
          </div>
          <div class="filter-item">
            <label>用户邮箱</label>
            <el-input placeholder="输入用户邮箱" :clearable="true" class="filter-input" v-model="search.userEmail" />
          </div>
          <div class="filter-item">
            <label>状态</label>
            <el-select :clearable="true" placeholder="选择类别" class="filter-select" v-model="search.status">
              <el-option label="正常" value="正常" />
              <el-option label="停用" value="停用" />
            </el-select>
          </div>
          <div class="filter-item">
            <label>注册日期</label>
            <el-date-picker type="date" placeholder="选择日期" class="filter-date" v-model="search.registerDate" />
          </div>
          <div class="filter-actions">
            <el-button type="primary" class="query-btn" @click="queryUsers">
              查询
            </el-button>
            <el-button class="reset-btn" @click="resetSearch">
              <el-icon>
                <Refresh />
              </el-icon>
              重置
            </el-button>
          </div>
        </div>
      </div>

      <!-- 表格区域 - 重新设计 -->
      <div class="table-section">
        <div class="table-header">
          <h3 class="table-title">用户列表</h3>
          <div class="table-actions">
            <el-tooltip content="刷新数据" placement="top">
              <el-button circle @click="refreshData">
                <el-icon>
                  <Refresh />
                </el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>

        <div class="table-container">
          <el-table style="width: 100%" stripe empty-text="暂无相关数据" class="modern-table" :data="filteredUsers">
            <el-table-column prop="id" label="用户 ID" width="160" align="center">
              <template #default="{ row }">
                <div class="id-cell">{{ row.id }}</div>
              </template>
            </el-table-column>

            <el-table-column prop="userName" label="用户名称" width="250">
              <template #default="{ row }">
                <div class="template-name-cell">
                  <el-icon class="template-icon">
                    <Collection />
                  </el-icon>
                  <span class="name-text">{{ row.userName }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="userEmail" label="用户邮箱" width="220">
              <template #default="{ row }">
                <div class="author-cell">
                  <span class="author-name">{{ row.userEmail }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="220" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : 'primary'" class="category-tag" effect="light" round>
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="注册时间" width="160">
              <template #default="{ row }">
                <div class="time-cell">
                  <div class="date">{{ formatDate(row.registerTime) }}</div>
                  <div class="time">
                    <el-icon class="time-icon">
                      <Clock />
                    </el-icon>
                    <span>{{ formatTime(row.registerTime) }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-tooltip content="查看详情" placement="top">
                    <el-button circle size="small" class="action-btn view-btn">
                      <el-icon>
                        <View />
                      </el-icon>
                    </el-button>
                  </el-tooltip>

                  <el-dropdown trigger="click" placement="right-start">
                    <el-button circle size="small" class="more-btn">
                      <el-icon>
                        <More />
                      </el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu class="action-menu">
                        <el-dropdown-item class="menu-item delete" @click="deleteUser(row)">
                          <el-icon>
                            <Delete />
                          </el-icon>
                          <span>删除</span>
                        </el-dropdown-item>
                        <el-dropdown-item class="menu-item rename" @click="changeStatus(row)">
                          <el-icon>
                            <Edit />
                          </el-icon>
                          <span>{{ row.status === '正常' ? '停用' : '启用' }}</span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  setup() {
    // 用户数据
    const users = reactive([
      { id: 1, userName: '张琳', userEmail: '24545637@qq.com', status: '正常', registerTime: new Date(2025, 3, 1, 10, 8) },
      { id: 2, userName: '陈兵', userEmail: '325436647@qq.com', status: '正常', registerTime: new Date(2025, 3, 15, 14, 35) },
      { id: 3, userName: '王涵', userEmail: '32543764@qq.com', status: '正常', registerTime: new Date(2025, 3, 10, 9, 12) },
      { id: 4, userName: '周博', userEmail: '56848645@qq.com', status: '正常', registerTime: new Date(2025, 3, 20, 16, 41) },
      { id: 5, userName: '张丁野', userEmail: '36546798@qq.com', status: '正常', registerTime: new Date(2025, 4, 5, 11, 21) },
      { id: 6, userName: '向阳', userEmail: '790956456@qq.com', status: '正常', registerTime: new Date(2025, 4, 15, 13, 3) }
    ])

    // 搜索结果
    const filteredUsers = ref([...users])

    // 总用户数
    const totalUsers = computed(() => users.length)

    // 搜索框
    const search = reactive({
      userId: '',
      userName: '',
      userEmail: '',
      status: '',
      registerDate: ''
    })

    // 查询用户
    const queryUsers = () => {
      let result = users.filter(user => {
        if (search.userId && user.id.toString() !== search.userId) return false
        if (search.userName && !user.userName.includes(search.userName)) return false
        if (search.userEmail && !user.userEmail.includes(search.userEmail)) return false
        if (search.status && user.status !== search.status) return false
        if (search.registerDate && user.registerTime.toDateString() !== search.registerDate.toDateString()) return false
        return true
      })
      filteredUsers.value = result
    }

   // 重置搜索
   const resetSearch = () => {
      Object.keys(search).forEach(key => {
        search[key] = ''
      })
      filteredUsers.value = [...users]
    }

    // 刷新数据
    const refreshData = () => {
      filteredUsers.value = [...users]
      ElMessage.success('数据刷新成功')
    }

    // 格式化日期
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // 格式化时间
    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }

    // 删除用户
    const deleteUser = (row) => {
      const index = users.findIndex(user => user.id === row.id)
      if (index !== -1) {
        users.splice(index, 1)
        ElMessage.success('用户删除成功')
        refreshData()
      }
    }

    // 修改用户状态
    const changeStatus = (row) => {
      const index = users.findIndex(user => user.id === row.id)
      if (index !== -1) {
        users[index].status = users[index].status === '正常' ? '停用' : '正常'
        ElMessage.success(`用户状态已修改为 ${users[index].status}`)
        refreshData()
      }
    }
    return {
      users,
      filteredUsers,
      totalUsers,
      search,
      queryUsers,
      resetSearch,
      refreshData,
      formatDate,
      formatTime
    }
  }
}
</script>


<style scoped>
/* 让按钮点击后不产生黑边 */
button {
  outline: none;
}


.template-management {
  min-height: 100vh;
  padding: 2rem;
  /* padding-top: 1rem; */
  position: relative;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-x: hidden;
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

.wave-pattern {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="%232196f3" opacity=".05"/></svg>');
  background-size: cover;
  opacity: 0.3;
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

/* 主容器 */
.main-container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(33, 150, 243, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 头部区域 - 新设计 */
.header-section {
  padding: 2rem;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.header-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="3" fill="white" opacity="0.1"/><circle cx="50" cy="30" r="4" fill="white" opacity="0.1"/><circle cx="80" cy="20" r="3" fill="white" opacity="0.1"/><circle cx="30" cy="60" r="5" fill="white" opacity="0.1"/><circle cx="70" cy="70" r="3" fill="white" opacity="0.1"/></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.title-wrapper {
  max-width: 600px;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 600;
  margin: 0;
  position: relative;
  display: inline-block;
  color: white;
}

.title-text {
  position: relative;
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-highlight {
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  z-index: 1;
  transform: skewX(-15deg);
  animation: highlight-pulse 3s ease-in-out infinite;
}

@keyframes highlight-pulse {

  0%,
  100% {
    opacity: 0.3;
    width: 100%;
  }

  50% {
    opacity: 0.5;
    width: 110%;
  }
}

.page-subtitle {
  font-size: 1rem;
  margin: 0.75rem 0 0;
  color: rgba(255, 255, 255, 0.85);
  position: relative;
}

.blink-dot {
  animation: blink 2s infinite;
  opacity: 0;
}

@keyframes blink {

  0%,
  100% {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }
}

/* 统计卡片 */
.header-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
}

.stat-icon {
  margin-right: 0.75rem;
  font-size: 1.5rem;
  color: white;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1;
  color: white;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}






.btn-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.1) 100%);
  transform: translateX(-100%) skewX(-15deg);
  transition: all 0.6s ease;
  z-index: -1;
}



.btn-text {
  position: relative;
  z-index: 1;
}

.btn-icon {
  margin-left: 0.5rem;
  transition: all 0.3s ease;
}



/* 表格区域 */
.table-section {
  padding: 1.5rem 2rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2196F3;
  margin: 0;
  position: relative;
  padding-left: 1rem;
}

.table-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 1.2rem;
  background: linear-gradient(to bottom, #2196F3, #64B5F6);
  border-radius: 2px;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

/* 表格样式 */
:deep(.modern-table) {
  --el-table-border-color: rgba(0, 0, 0, 0.05);
  --el-table-header-bg-color: #f5f9ff;
  --el-table-header-text-color: #2196F3;
  --el-table-row-hover-bg-color: #f0f7ff;
}

:deep(.modern-table .el-table__header th) {
  font-weight: 600;
  letter-spacing: 0.5px;
  background-color: #f5f9ff !important;
}

:deep(.modern-table .el-table__body tr:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
  transition: all 0.3s ease;
}

/* 自定义单元格样式 */
.id-cell {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #2196F3;
  background: rgba(33, 150, 243, 0.1);
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.template-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.template-icon {
  color: #2196F3;
  font-size: 1.2rem;
}

.name-text {
  font-weight: 500;
  transition: all 0.3s ease;
}

.author-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}


.author-name {
  font-weight: 500;
}

.category-tag {
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.category-tag:hover {
  transform: scale(1.05);
}

.time-cell {
  display: flex;
  flex-direction: column;
}

.date {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.time {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #78909c;
}

.time-icon {
  margin-right: 0.25rem;
  font-size: 0.9rem;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(33, 150, 243, 0.2);
  transform: scale(1.1);
}

.view-btn:hover {
  color: white;
  background: #2196F3;
}

.more-btn {
  background: rgba(158, 158, 158, 0.1);
  color: #9e9e9e;
  transition: all 0.3s ease;
}

.more-btn:hover {
  background: rgba(158, 158, 158, 0.2);
  transform: scale(1.1);
}

/* 下拉菜单 */
.action-menu {
  padding: 0.5rem 0;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: none;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  margin: 0.25rem 0;
  border-radius: 8px;
}

.menu-item:hover {
  background: rgba(33, 150, 243, 0.05);
}

.menu-item.delete {
  color: #f44336;
}

.menu-item.view {
  color: #2196f3;
}

.menu-item.rename {
  color: #4caf50;
}

.menu-item.download {
  color: #9c27b0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .header-stats {
    width: 100%;
    justify-content: space-between;
  }


}

@media (max-width: 768px) {
  .template-management {
    padding: 1rem;
  }

  .header-section {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .table-section {
    padding: 1rem;
  }

  :deep(.modern-table) {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .header-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-card {
    width: 100%;
  }
}

/* 筛选区域样式 */
.filter-section {
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid rgba(33, 150, 243, 0.1);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-item label {
  font-size: 0.9rem;
  color: #2196F3;
  font-weight: 500;
  margin-left: 0.25rem;
}

.filter-input {
  width: 100%;
}

.filter-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid rgba(33, 150, 243, 0.3);
  transition: all 0.3s ease;
  box-shadow: none;
}

.filter-input :deep(.el-input__wrapper:hover) {
  border-color: #2196F3;
  box-shadow: 0 0 0 1px #2196F3;
}

.filter-input :deep(.el-input__wrapper.is-focus) {
  border-color: #2196F3;
  box-shadow: 0 0 0 1px #2196F3;
}

.filter-select {
  width: 100%;
}

.filter-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid rgba(33, 150, 243, 0.3);
  transition: all 0.3s ease;
  box-shadow: none;
}

.filter-select :deep(.el-input__wrapper:hover) {
  border-color: #2196F3;
  box-shadow: 0 0 0 1px #2196F3;
}

.filter-date {
  width: 100%;
}

.filter-date :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid rgba(33, 150, 243, 0.3);
  transition: all 0.3s ease;
  box-shadow: none;
}

.filter-date :deep(.el-input__wrapper:hover) {
  border-color: #2196F3;
  box-shadow: 0 0 0 1px #2196F3;
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
  align-self: flex-end;
  margin-bottom: 0.15rem;
  margin-left: 1rem;
}

.query-btn {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  border: none;
  color: white;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  margin-left: 18px;
}

.query-btn:hover {
  background: linear-gradient(135deg, #1976D2, #1565C0);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
}

.query-btn:active {
  transform: translateY(0);
}

.reset-btn {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
  border: none;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-left: -5px;
}

.reset-btn:hover {
  background: rgba(33, 150, 243, 0.2);
  color: #1976D2;
  transform: translateY(-2px);
}

.reset-btn:active {
  transform: translateY(0);
}


/* 响应式调整 */
@media (max-width: 1200px) {
  .filter-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .filter-actions {
    grid-column: span 3;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-actions {
    grid-column: span 2;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    grid-column: span 1;
    justify-content: center;
  }
}
</style>