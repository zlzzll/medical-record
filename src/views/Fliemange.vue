<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useRoute } from 'vue-router';
import { MyFile } from "../types/types";
import router from "../router";
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from "../store";
import formatDate from "../tools/formatDate";
import axiosService from "../utils/axios-test"
import { Search } from '@element-plus/icons-vue'
const userId = ref()

export default defineComponent({
    name: "FileManagement",
    setup() {
        const route = useRoute();
        const currentPage = ref(1);
        const showPage = ref(1);
        const pageSize = 10;
        const inpval = ref();
        const filteredFiles = ref<MyFile[]>([]);
        // 多定义一个inpvals的原因是按钮的激活判断inpval == showPage，如果直接给输入框绑定inpval会导致用户没有点击跳转按钮就使得按钮因为输入的数据实时变化而激活，
        // 所以要多定义一个变量用于存输入的内容，在需要变化inpval 的时候再变化
        const inpvals = ref('');

        // 控制操作下拉菜单的显示
        const showActionMenu = ref<number | null>(null);

        const paginatedTemplates = computed(() => {
            return filteredFiles.value;
        });

        const totalPages = ref(100)
        const totalNum = ref()


        const filters = ref({
            id: "", //文件id
            filename: "",
            templateName: "", //关联模板名
            author: "", //模板作者
            //都是自己的文件，不需要判断是不是a类型，是不是能删除
            modifyDate: "",
        });

        onMounted(async () => {
            const userStore = useUserStore();
            userId.value = userStore.$state.userInfo?.id
            // filteredTemplates.value = testdata().templateFiles;
            // console.log(currentPage.value)
            try {
                const res = await axiosService.post("/api/record/page", {
                    currentPage: currentPage.value,
                    pageSize: pageSize
                })
                //正则表达式格式数据，便于展示

                console.log(res.data.data.data)

                filteredFiles.value = res.data.data.data
                console.log(filteredFiles.value)
                totalPages.value = res.data.data.totalPage
                totalNum.value = res.data.data.totalNum
            } catch (e) {
                console.error(e)
            }
        });
        // 检查URL参数，如果有则应用筛选条件
        onMounted(() => {
            const queryName = route.query.name as string;
            if (queryName) filters.value.templateName = queryName;
        });



        //日期处理函数，将时间戳转化为具体对应的年月日以及精确的AM和PM
        function customParse(dateStr: string) {
            const date = new Date(dateStr); // 转换为 Date 对象
            return date.getTime(); // 获取时间戳（毫秒级）
        }

        const gotoFileCreate = () => {
            router.push('/createfile');
        };

        const applyFilters = () => {
            // console.log(filters.value)
            try{
                if(filters.value.id == '' && filters.value.author == '' && filters.value.filename == '' && filters.value.templateName == '' && filters.value.modifyDate == '') {
                updatePage(currentPage.value, pageSize)
            }
            else if (filters.value.id || filters.value.author || filters.value.filename || filters.value.templateName || filters.value.modifyDate) {
                console.log(filters.value)
                updatePage(currentPage.value, pageSize, Number(filters.value.id), filters.value.filename, filters.value.templateName, filters.value.author, customParse(filters.value.modifyDate))
            }
            // filteredFiles.value = result;
            currentPage.value = 1;
            ElMessage.success('获取数据成功！')
            }catch{
                ElMessage.error('获取数据失败！')
            }
        };

        const resetFilters = () => {
            filters.value = {
                id: '',
                filename: '',
                templateName: '',
                author: '',
                modifyDate: '',
            };
            currentPage.value = 1;
            updatePage(currentPage.value, pageSize)
        };

        // 切换操作菜单的显示状态
        const toggleActionMenu = (id: number) => {
            if (showActionMenu.value === id) {
                showActionMenu.value = null;
            } else {
                showActionMenu.value = id;
            }
        };

        //文件操作


        //文件列表刷新的函数


        // 查看文件详情（GET）
        const viewFileDetails = async (caseId: any) => {
            try {
                const fileMappings = JSON.parse(localStorage.getItem('fileMappings') || '{}');
                const fileData = fileMappings[caseId];

                if (!fileData) {
                    ElMessage.error('未找到文件信息');
                    return;
                }

                const encodedFileUrl = encodeURIComponent(fileData.fileUrl);
                const encodedFileName = encodeURIComponent(fileData.fileName);

                // **进入 FileEditor 之前，先存入缓存**
                localStorage.setItem("fileEditorData", JSON.stringify({
                    templateId: fileData.templateId,
                    caseId,
                    fileName: fileData.fileName,
                    fileUrl: fileData.fileUrl
                }));

                // 跳转到文件编辑页面
                window.location.href = `/FileEditor?caseId=${caseId}&fileName=${encodedFileName}&fileUrl=${encodedFileUrl}`;
                ElMessage.success('文件详情获取成功');
            } catch (error) {
                ElMessage.error('获取文件详情失败');
                console.error('Error fetching file details:', error);
            }
        };



        // 删除文件（DELETE）
        const deleteFile = async (id: number) => {
            try {
                await ElMessageBox.confirm('确定要删除该文件吗？', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                });

                const response = await axiosService.post(`/api/record/delete`,
                    {
                        id: id
                    }
                );
                if (response.data.code == 200) {
                    ElMessage.success('文件删除成功');
                } else {
                    ElMessage.error('文件删除失败');
                    ElMessage.error(response.data.msg);
                }

                // 刷新文件列表
                // fetchFileList();
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('文件删除失败');
                    console.error('Error deleting file:', error);
                }
            }
            showActionMenu.value = null;
        };

        // 下载文件（POST）
        const downloadFile = async (id: number, name: string) => {
            console.log('开始下载文件:', id);

            try {
                // 第一步：获取直接下载链接
                const { data } = await axiosService.get<{
                    code: number;
                    data: string;  // 这里已经是直接下载的URL
                    msg: string;
                }>(`/api/record/download/${id}`);

                // 验证接口响应状态
                if (data.code !== 200 || !data.data) {
                    ElMessage.error(data.msg || '获取下载链接失败');
                    return;
                }

                // 第二步：直接使用下载链接
                const link = document.createElement('a');
                link.href = data.data;  // 直接使用后端返回的下载地址
                link.target = '_blank'; // 新标签页打开（可选）
                link.download = `${name}`; // 默认文件名，可根据需要调整

                // 静默触发下载
                document.body.appendChild(link);
                link.click();
                link.remove();

                ElMessage.success('文件下载已开始');

            } catch (error) {
                // 精简错误处理
                console.error('下载异常:', error);
            } finally {
                showActionMenu.value = null;
            }
        };

        // 重命名文件
        const renameFile = async (id: number, filename: string) => {
            try {
                const { value: newName } = await ElMessageBox.prompt(
                    '请输入新病历名',
                    '重命名病历',
                    {
                        confirmButtonText: '确认',
                        cancelButtonText: '取消',
                        inputPattern: /\S+/, // 非空验证
                        inputErrorMessage: '病历名不能为空'
                    }
                );
                const regex = /\.[^.]*$/;
                const match = filename.match(regex);
                const typename = match ? match[0] : null;

                const response = await axiosService.post(`/api/record/rename`, {
                    id: id,
                    aiCaseName: newName + typename,
                });
                if (response.data.code == 200) {
                    ElMessage.success('重命名成功');
                } else {
                    ElMessage.error(response.data.msg);
                }

                // 刷新模板列表
                // fetchFileList();
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('重命名失败');
                    console.error('Error renaming file:', error);
                }
            }
            showActionMenu.value = null;
        };





        // 页面跳转脚本实现
        function changePage(event: any) {
            const value = event.target.innerText;

            // 注意这里innerText是字符串，直接赋值会导致数据类型变化
            currentPage.value = Number(value)
            console.log('Clicked value:', value); // 输出: Clicked value: 1

        }
        function prevPage() {
            // 先清空
            inpval.value = ''
            if (currentPage.value > 1) {
                currentPage.value--
                if (currentPage.value % 4 == 0) {
                    showPage.value = showPage.value - 4
                }
            }
        }
        function nextPage() {
            // 先清空
            inpval.value = ''
            if (currentPage.value < totalPages.value) {
                currentPage.value++
                if (currentPage.value >= showPage.value + 4) {
                    showPage.value = currentPage.value
                }
            }
        }
        function gotoPage() {
            if (inpvals.value == '') {
                return
            }
            inpval.value = inpvals.value
            // 先清空输入框
            inpvals.value = ''

            // 输入判断
            if (inpval.value <= 0 || inpval.value > totalPages.value) {
                return
            }
            currentPage.value = inpval.value

            // 在currentPage更新之后，立即要想到更新showPage变量
            if (inpval.value < showPage.value) {
                showPage.value = (Math.trunc(inpval.value / 4) - 1) * 4 + 1
            }
            if (inpval.value > showPage.value + 3) {
                showPage.value = Math.trunc(inpval.value / 4) * 4 + 1
            }
        }

        //更新页面的函数
        const updatePage = async (currentPage: number, pageSize: number, id?: number, fuzzyFileName?: string, fuzzyTemplateName?: string, authorName?: string, updateTimeStart?: number) => {
            const configData: any = {
                currentPage,
                pageSize
            };

            // 检查每个可选参数是否被传入，如果传入则添加到 configData
            if (id && id != 0) configData.id = id;
            if (fuzzyFileName && fuzzyFileName != "") configData.fuzzyFileName = fuzzyFileName;
            if (authorName && authorName != '') configData.authorName = authorName;
            if (fuzzyTemplateName && fuzzyTemplateName != '') configData.fuzzyTemplateName = fuzzyTemplateName;
            if (updateTimeStart) configData.timeRange = {beginTimeMs:updateTimeStart, endTimeMs: updateTimeStart+86400000};
            console.log("请求的数据：")
            console.log(configData)

            try {

                const res = await axiosService.post("/api/record/page", configData)
                if (res.data.code != 200) {
                    ElMessage.error(res.data.msg)
                    return;
                }


                filteredFiles.value = res.data.data.data
                totalPages.value = res.data.data.totalPage
                totalNum.value = res.data.data.totalNum


            } catch (e) {
                ElMessage.error("网络请求失败")
                console.log("data:" + configData)
                console.error(e);
            }
        };
        // 监听 currentPage 的变化，随时更新页面数据
        watch(
            () => currentPage.value,
            (newPage, oldPage) => {
                if (oldPage != undefined) {
                    console.log(`页码从 ${oldPage} 变为 ${newPage}`);
                    updatePage(newPage, pageSize);
                }
            },
            { immediate: true } // 立即执行一次，确保初始值也被处理
        );




        return {
            filters,
            paginatedTemplates,
            currentPage,
            showPage,
            inpval,
            inpvals,
            totalPages,
            showActionMenu,
            gotoFileCreate,
            toggleActionMenu,
            viewFileDetails,
            deleteFile,
            downloadFile,
            renameFile,
            gotoPage,
            formatDate,
            applyFilters,
            resetFilters,
            changePage,
            prevPage,
            nextPage,
            userId,
            Search,
            totalNum,
            updatePage,
            pageSize
        };
    },
});
</script>

<template>
    <div class="file-management">
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
                            <span class="title-text">病历资料</span>
                            <span class="title-highlight"></span>
                        </h1>
                        <p class="page-subtitle">高效管理您的病历文档资源 <span class="blink-dot">·</span></p>
                    </div>
                    <div class="header-stats">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <el-icon><DocumentCopy /></el-icon>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ totalNum }}</div>
                                <div class="stat-label">总文件数</div>
                            </div>
                        </div>
                    </div>
                </div>

                <el-button type="primary" class="create-file-btn" @click="gotoFileCreate">
                    <span class="btn-text">创建病历</span>
                    <el-icon class="btn-icon">
                        <Plus />
                    </el-icon>
                    <span class="btn-effect"></span>
                </el-button>
            </div>

            <!-- 筛选区域 -->
            <div class="filter-section">
                <div class="filter-grid">
                    <div class="filter-item">
                        <label>ID</label>
                        <el-input v-model="filters.id" placeholder="输入ID" :clearable="true" class="filter-input" />
                    </div>
                    <div class="filter-item">
                        <label>文档名称</label>
                        <el-input v-model="filters.filename" placeholder="输入文档名称" :clearable="true" class="filter-input"/>
                    </div>
                    <div class="filter-item">
                        <label>关联模板</label>
                        <el-input v-model="filters.templateName" placeholder="输入模板名称" :clearable="true" class="filter-input" />
                    </div>
                    <div class="filter-item">
                        <label>作者</label>
                        <el-input v-model="filters.author" placeholder="输入作者" :clearable="true" class="filter-input" />
                    </div>
                    <div class="filter-item">
                        <label>修改日期</label>
                        <el-date-picker v-model="filters.modifyDate" type="date" placeholder="选择日期"
                            class="filter-date" />
                    </div>
                    <div class="filter-actions">
                        <el-button type="primary" :icon="Search" @click="applyFilters" class="query-btn">
                            查询
                        </el-button>
                        <el-button @click="resetFilters" class="reset-btn">
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
                    <h3 class="table-title">文件列表</h3>
                    <div class="table-actions">
                        <el-tooltip content="刷新数据" placement="top">
                            <el-button circle @click="applyFilters">
                                <el-icon>
                                    <Refresh />
                                </el-icon>
                            </el-button>
                        </el-tooltip>
                    </div>
                </div>

                <div class="table-container">
                    <el-table :data="paginatedTemplates" style="width: 100%" stripe empty-text="暂无相关数据"
                        class="modern-table">
                        <el-table-column prop="id" label="ID" width="100" align="center">
                            <template #default="{ row }">
                                <div class="id-cell">{{ row.id }}</div>
                            </template>
                        </el-table-column>

                        <el-table-column prop="aiCaseName" label="文档名称" min-width="150">
                            <template #default="{ row }">
                                <div class="file-name-cell">
                                    <el-icon class="file-icon">
                                        <Document />
                                    </el-icon>
                                    <span class="name-text">{{ row.aiCaseName }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column prop="templateName" label="关联模板" width="350">
                            <template #default="{ row }">
                                <div class="template-cell">
                                    <el-tag type="info" effect="light" class="template-tag">
                                        {{ row.templateName }}
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column prop="authorName" label="作者" width="150">
                            <template #default="{ row }">
                                <div class="author-cell">
                                    <el-avatar :size="28" class="author-avatar">{{ row.authorName.charAt(0)
                                    }}</el-avatar>
                                    <span class="author-name">{{ row.authorName }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="修改时间" width="180">
                            <template #default="{ row }">
                                <div class="time-cell">
                                    <div class="date">{{ formatDate(row.updateTime).split(" ")[0] }}</div>
                                    <div class="time">
                                        <el-icon class="time-icon">
                                            <Clock />
                                        </el-icon>
                                        <span>{{ formatDate(row.updateTime).split(" ")[1] }} {{
                                            formatDate(row.updateTime).split(" ")[2] }}</span>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="操作" width="150" align="center">
                            <template #default="{ row }" >
                                <div class="action-buttons">
                                    <el-tooltip content="查看详情" placement="top">
                                        <el-button circle size="small" @click="viewFileDetails(row.id)"
                                            class="action-btn view-btn">
                                            <el-icon>
                                                <View />
                                            </el-icon>
                                        </el-button>
                                    </el-tooltip>

                                    <el-dropdown trigger="click" placement="bottom-start">
                                        <el-button circle size="small" class="more-btn">
                                            <el-icon>
                                                <More />
                                            </el-icon>
                                        </el-button>
                                        <template #dropdown>
                                            <el-dropdown-menu class="action-menu">
                                                <el-dropdown-item v-if="row.authorId == userId"
                                                    @click="deleteFile(row.id)" class="menu-item delete">
                                                    <el-icon>
                                                        <Delete />
                                                    </el-icon>
                                                    <span>删除</span>
                                                </el-dropdown-item>
                                                <el-dropdown-item v-if="row.authorId == userId"
                                                    @click="renameFile(row.id, row.aiCaseName)"
                                                    class="menu-item rename">
                                                    <el-icon>
                                                        <Edit />
                                                    </el-icon>
                                                    <span>重命名</span>
                                                </el-dropdown-item>
                                                <el-dropdown-item @click="downloadFile(row.id, row.aiCaseName)"
                                                    class="menu-item download">
                                                    <el-icon>
                                                        <Download />
                                                    </el-icon>
                                                    <span>下载</span>
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

            <!-- 分页区域 -->
            <!-- 分页区域 -->
            <div class="pagination-section">
                <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="totalPages * pageSize"
                    layout="prev, pager, next, jumper" background class="custom-pagination" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 让按钮点击后不产生黑边 */
button {
  outline: none;
}


/* 与模板管理页面相同的全局样式 */
.file-management {
    min-height: 100vh;
    padding: 2rem;
    position: relative;
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    overflow-x: hidden;
}

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

/* 头部区域 */
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

/* 创建病历按钮 */
.create-file-btn {
    position: relative;
    overflow: hidden;
    padding: 0.85rem 1.75rem;
    font-weight: 500;
    border: none;
    background: rgba(255, 255, 255, 0.9);
    color: #1976D2;
    box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
    transition: all 0.3s ease;
    z-index: 1;
}

.create-file-btn:hover {
    background: white;
    color: #1565C0;
    box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
    transform: translateY(-2px);
}

.create-file-btn:active {
    transform: translateY(0);
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

.create-file-btn:hover .btn-effect {
    transform: translateX(100%) skewX(-15deg);
}

.btn-text {
    position: relative;
    z-index: 1;
}

.btn-icon {
    margin-left: 0.5rem;
    transition: all 0.3s ease;
}

.create-file-btn:hover .btn-icon {
    transform: rotate(90deg);
}

/* 筛选区域 */
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
}

.reset-btn:hover {
    background: rgba(33, 150, 243, 0.2);
    color: #1976D2;
    transform: translateY(-2px);
}

.reset-btn:active {
    transform: translateY(0);
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

.file-name-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.file-icon {
    color: #2196F3;
    font-size: 1.2rem;
}

.name-text {
    font-weight: 500;
    transition: all 0.3s ease;
}

.template-cell {
    display: flex;
    align-items: center;
}

.template-tag {
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.template-tag:hover {
    transform: scale(1.05);
}

.author-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.author-avatar {
    background: linear-gradient(135deg, #64B5F6, #2196F3);
    color: white;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
}

.author-name {
    font-weight: 500;
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

/* 分页区域样式 */
.pagination-section{
    display: flex;
    align-self: center;
    justify-self: center;
    padding-bottom: 1.5rem;
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

    .create-file-btn {
        width: 100%;
        margin-top: 1rem;
    }

    .filter-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .filter-actions {
        grid-column: span 3;
        justify-content: flex-end;
    }
}

@media (max-width: 768px) {
    .file-management {
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

    .filter-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .filter-actions {
        grid-column: span 2;
        justify-content: flex-end;
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

    .filter-grid {
        grid-template-columns: 1fr;
    }

    .filter-actions {
        grid-column: span 1;
        justify-content: center;
    }
}
</style>