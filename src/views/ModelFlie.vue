<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from 'vue-router';
import { TemplateFile } from "../types/types";

import { useUserStore } from "../store";
import formatDate from "../tools/formatDate";
import { ElMessage, ElMessageBox } from 'element-plus';
import axiosService from "../utils/axios-test"

const userId = ref()


export default defineComponent({
    name: "FileManagement",
    setup() {
        const router = useRouter();

        //筛选框内容
        const filters = ref({
            id: "",
            templateName: "",
            author: "",
            category: "",
            modifyDate: "",
        });

        const filteredTemplates = ref<TemplateFile[]>([]);
        const currentPage = ref(1);
        const showPage = ref(1);
        const pageSize = 10;
        const inpval = ref();
        // 多定义一个inpvals的原因是按钮的激活判断inpval == showPage，如果直接给输入框绑定inpval会导致用户没有点击跳转按钮就使得按钮因为输入的数据实时变化而激活，
        // 所以要多定义一个变量用于存输入的内容，在需要变化inpval 的时候再变化
        const inpvals = ref('');

        const paginatedTemplates = computed(() => {
            const start = (currentPage.value - 1) * pageSize;
            return filteredTemplates.value.slice(start, start + pageSize);
        });

        const totalPages = ref(100)
        onMounted(async () => {
            const userStore = useUserStore();
            userId.value = userStore.$state.userInfo?.id
            console.log("idid:")
            console.log(userId.value)
            // filteredTemplates.value = testdata().templateFiles;
            console.log(currentPage.value)
            try {
                const res = await axiosService.post("/api/template/page", {
                    currentPage: currentPage.value,
                    pageSize: pageSize
                })
                //正则表达式格式数据，便于展示
                if (Array.isArray(res.data.data.data)) {
                    res.data.data.data.forEach((item: TemplateFile) => {
                        item.category = item.category.replace(/^case_/, '') + "类";
                    });
                }
                console.log(res.data.data.data)

                filteredTemplates.value = res.data.data.data
                console.log(filteredTemplates.value)
                totalPages.value = res.data.totalPage
            } catch (e) {
                console.error(e)
            }
        });


        const updatePage = async (currentPage: number, pageSize: number, id?: number, fuzzyTemplateName?: string, authorName?: string, category?: string, updateTimeStart?: number) => {
            const configData: any = {
                currentPage,
                pageSize
            };

            // 检查每个可选参数是否被传入，如果传入则添加到 configData
            if (id && id != 0) configData.id = id;
            if (fuzzyTemplateName && fuzzyTemplateName != "") configData.fuzzyTemplateName = fuzzyTemplateName;
            if (authorName && authorName != '') configData.authorName = authorName;
            if (category && category != '') configData.category = category;
            if (updateTimeStart) configData.updateTimeStart = updateTimeStart;

            console.log(configData)


            try {
                console.log(112233)
                const res = await axiosService.post("/api/template/page", configData)
                if (res.data.code != 200) {
                    ElMessage.error(res.data.msg)
                    return;
                }
                //正则表达式格式数据，便于展示
                // 正确方式：遍历数组中的每个模板对象，修改其 category 字段
                if (Array.isArray(res.data.data.data)) {
                    res.data.data.data.forEach((item: TemplateFile) => {
                        item.category = item.category.replace(/^case_/, '') + "类";
                    });
                }
                filteredTemplates.value = res.data.data.data;
                totalPages.value = res.data.data.totalPage;



            } catch (e) {
                ElMessage.error("网络请求失败")
                console.error(e);
            }
        };

        //日期处理函数，将时间戳转化为具体对应的年月日以及精确的AM和PM
        function customParse(dateStr: string) {
            const date = new Date(dateStr); // 转换为 Date 对象
            return date.getTime(); // 获取时间戳（毫秒级）
        }

        const applyFilters = () => {
            if (filters.value.id || filters.value.author || filters.value.category || filters.value.modifyDate || filters.value.templateName) {
                console.log(filters.value)
                updatePage(currentPage.value, pageSize, Number(filters.value.id), filters.value.templateName, filters.value.author, filters.value.category, customParse(filters.value.modifyDate))
            }

            currentPage.value = 1;
        };

        const goToCreateTemplate = () => {
            router.push('/create-template');
        };
        const resetFilters = () => {
            filters.value = {
                id: "",
                templateName: "",
                author: "",
                category: "",
                modifyDate: "",
            };

            currentPage.value = 1;
        };


        //模板操作

        // const viewFileDetails = async (id: number) => {
        //     const fileUrl = 'jwszcrtgqhz.feishu.cn/wiki/DE5owiKNKiUa2XkadeEcQWvHnRf';
        //     console.log('文件URL:', fileUrl);

        //     // 生成带参数的 URL
        //     const encodedFileUrl = encodeURIComponent(fileUrl);
        //     window.location.href = `/Editor?id=${id}&fileUrl=${encodedFileUrl}`;

        //     // 显示成功提示
        //     ElMessage.success('模板详情获取成功');

        //     shouldShow.value = null;
        // };

        const viewFileDetails = async (id: number, name: string) => {
            try {
                const response = await axiosService.get(`/api/template/download/${id}`);
                console.log(response, "zhixxx")


                if (response.data.code === 200) {
                    console.log('模板详情:', response.data);
                    const fileUrl = response.data.data;
                    console.log('新的文件URL:', fileUrl);
                    const encodedFileUrl = encodeURIComponent(fileUrl);
                    // 跳转到 /Editor+URL

                    window.location.href = `/Editor?id=${id}&name=${name}&fileUrl=${encodedFileUrl}`;

                    // 显示成功提示
                    ElMessage.success('模板详情获取成功');
                } else {
                    ElMessage.error(response.data.msg);
                }
            } catch (error) {
                ElMessage.error('获取模板详情失败');
                console.error('Error fetching file details:', error);
            }

            shouldShow.value = null;
        };


        // 删除模板（DELETE）
        const deleteFile = async (id: number) => {
            try {
                await ElMessageBox.confirm('确定要删除该模板吗？', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                });

                const response = await axiosService.post(`/api/template/delete`,
                    {
                        id: id
                    }
                );
                if (response.data.code == 200) {
                    ElMessage.success('模板删除成功');
                } else {
                    ElMessage.error(response.data.msg);
                }

                // 刷新模板列表
                // fetchFileList();
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('模板删除失败');
                    console.error('Error deleting file:', error);
                }
            }
            shouldShow.value = null;
        };

        // 下载模板（POST）


        const downloadFile = async (id: number, name: string) => {
            console.log('开始下载文件:', id);

            try {
                // 第一步：获取直接下载链接
                const { data } = await axiosService.get<{
                    code: number;
                    data: string;  // 这里已经是直接下载的URL
                    msg: string;
                }>(`/api/template/download/${id}`);
console.log(data )
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
                shouldShow.value = null;
            }
        };

        // 重命名模板
        const renameFile = async (id: number, templatename: string) => {
            try {
                const { value: newName } = await ElMessageBox.prompt(
                    '请输入新模板名',
                    '重命名模板',
                    {
                        confirmButtonText: '确认',
                        cancelButtonText: '取消',
                        inputPattern: /\S+/, // 非空验证
                        inputErrorMessage: '模板名不能为空'
                    }
                );
                const regex = /\.[^.]*$/;
                const match = templatename.match(regex);
                const typename = match ? match[0] : null;

                const response = await axiosService.post(`/api/template/rename`, {
                    id: id,
                    templateName: newName + typename,
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
            shouldShow.value = null;
        };



        // 跳转到模板管理页面并应用筛选条件的按钮
        const goToFileManage = (template: TemplateFile) => {
            router.push({
                path: '/filemanage',
                query: {
                    name: template.templateName,
                }
            });
        };


        //下拉框展示
        const shouldShow = ref()
        const showMenu = (id: number) => {
            if (shouldShow.value === id) {
                shouldShow.value = null;
            } else {
                shouldShow.value = id;
            }
        }

        // 页面跳转脚本实现
        function changePage(event: any) {
            const value = event.target.innerText;

            // 注意这里innerText是字符串，直接赋值会导致数据类型变化
            currentPage.value = Number(value)

            // console.log('Clicked value:', value); // 输出: Clicked value: 1

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
        // 挂载时候发请求加载初始页面

        onUnmounted(() => {
            console.log("卸载了")
        })



        //暴露数据
        return {
            filters,
            userId,
            paginatedTemplates,
            currentPage,
            showMenu,
            shouldShow,
            showPage,
            goToCreateTemplate,
            inpval, inpvals,
            totalPages,
            gotoPage,
            applyFilters,
            resetFilters,
            changePage,
            prevPage,
            nextPage,
            formatDate,
            goToFileManage,
            viewFileDetails,
            deleteFile,
            downloadFile,
            renameFile,
        };
    },
});



</script>

<template>
    <div class="file-management">
        <header class="header">
            <h2>模板模板</h2>
            <p>现存模板如下</p>

            <button class="create-template-btn" @click="goToCreateTemplate">创建模板</button>
            <hr style="max-width: 1200px; ">
        </header>

        <div class="filter-container">
            <div class="filter-group">
                <div class="filter-item">
                    <label>ID:</label>
                    <input type="text" v-model="filters.id" placeholder="输入ID">
                </div>
                <div class="filter-item">
                    <label>模板名称:</label>
                    <input type="text" v-model="filters.templateName" placeholder="输入模板名称">
                </div>
                <div class="filter-item">
                    <label>作者:</label>
                    <input type="text" v-model="filters.author" placeholder="输入作者">
                </div>
                <div class="filter-item">
                    <label>类别:</label>
                    <select v-model="filters.category">
                        <option value="">全部</option>
                        <option value="a类">a类</option>
                        <option value="b类">b类</option>
                    </select>
                </div>
                <div class="filter-item">
                    <label>修改日期:</label>
                    <input type="date" v-model="filters.modifyDate">
                </div>


                <div class="filter-item filter-actions">
                    <button class="btn query" @click="applyFilters">查询</button>
                    <button class="btn reset" @click="resetFilters">
                        <svg t="1740899657675" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="1471" width="200" height="200">
                            <path
                                d="M130 562.5c0-19.33 15.67-35 35-35s35 15.67 35 35C200 735.089 339.911 875 512.5 875S825 735.089 825 562.5 685.089 250 512.5 250c-19.33 0-35-15.67-35-35s15.67-35 35-35C723.749 180 895 351.251 895 562.5S723.749 945 512.5 945 130 773.749 130 562.5z"
                                fill="#2F54EB" p-id="1472"></path>
                            <path
                                d="M482.657 214.747l79.355 79.356c10.74 10.74 10.74 28.151 0 38.89-10.74 10.74-28.151 10.74-38.89 0l-85.573-85.572c-18.045-18.045-18.045-47.302 0-65.348l85.766-85.766c10.74-10.74 28.152-10.74 38.891 0 10.74 10.74 10.74 28.151 0 38.89l-79.55 79.55z"
                                fill="#2F54EB" p-id="1473"></path>
                        </svg>
                        重置</button>
                </div>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>模板</th>
                        <th>作者</th>
                        <th style="position: relative;top: 10px;">分类<span class="help-icon"
                                style="position: relative;left: 120px;bottom: 30px; " title="a类为超级模板，用户不能操作该模板；
a类模板提交json，上传该模板的模板有严格的格式校验；">?</span></th>
                        <th>修改时间</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="paginatedTemplates.length === 0">
                        <td colspan="5" class="no-data">暂无相关数据</td>
                    </tr>
                    <tr v-else v-for="template in paginatedTemplates" :key="template.id">
                        <td>{{ template.id }}</td>
                        <td>{{ template.templateName }}</td>
                        <td>{{ template.authorName }}</td>
                        <td><span class="category-tag">{{ template.category }}</span></td>
                        <td>{{ formatDate(template.updateTime).split(" ")[0] }}
                            <div style="font-size: smaller; color: gray;">
                                {{ formatDate(template.updateTime).split(" ")[1] }}
                                {{ formatDate(template.updateTime).split(" ")[2] }}
                            </div>
                        </td>
                        <td style=" width: 50px;height: 50px; ">
                            <button style="align-items: center; " class="goto" @click="goToFileManage(template)">
                                <svg t="1740899969657" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                    xmlns="http://www.w3.org/2000/svg" p-id="4149" width="200" height="200">
                                    <path
                                        d="M584.533333 512l-302.933333 302.933333L341.333333 874.666667l302.933334-302.933334 59.733333-59.733333-59.733333-59.733333L341.333333 145.066667 281.6 209.066667l302.933333 302.933333z"
                                        fill="#1296db" p-id="4150"></path>
                                </svg>
                            </button>
                        </td>
                        <td class="action-cell">
                            <div class="act">
                                <button @click="showMenu(template.id)">
                                    <svg t="1740900353387" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                        xmlns="http://www.w3.org/2000/svg" p-id="12391" width="200" height="200">
                                        <path
                                            d="M319 256.43c-22.57 0-43.59-13.14-54.88-32.69A63.37 63.37 0 0 1 319 128.69h577a63.37 63.37 0 0 1 54.88 95.06c-11.28 19.55-32.31 32.69-54.88 32.69z"
                                            p-id="12392" fill="#8a8a8a"></path>
                                        <path d="M126.5 192.56m-63.5 0a63.5 63.5 0 1 0 127 0 63.5 63.5 0 1 0-127 0Z"
                                            p-id="12393" fill="#8a8a8a"></path>
                                        <path
                                            d="M319 577.43c-22.57 0-43.59-13.14-54.88-32.69A63.37 63.37 0 0 1 319 449.69h577a63.37 63.37 0 0 1 54.88 95.06c-11.28 19.55-32.31 32.69-54.88 32.69z"
                                            p-id="12394" fill="#8a8a8a"></path>
                                        <path d="M126.5 513.56m-63.5 0a63.5 63.5 0 1 0 127 0 63.5 63.5 0 1 0-127 0Z"
                                            p-id="12395" fill="#8a8a8a"></path>
                                        <path
                                            d="M319 896.43c-22.57 0-43.59-13.14-54.88-32.69A63.37 63.37 0 0 1 319 768.69h577a63.37 63.37 0 0 1 54.88 95.06c-11.28 19.55-32.31 32.69-54.88 32.69z"
                                            p-id="12396" fill="#8a8a8a"></path>
                                        <path d="M126.5 832.56m-63.5 0a63.5 63.5 0 1 0 127 0 63.5 63.5 0 1 0-127 0Z"
                                            p-id="12397" fill="#8a8a8a"></path>
                                    </svg>

                                </button>
                                <div class="action-menu" :class="{ show: shouldShow === template.id }">
                                    <div v-if="template.category == `b类` && template.authorId == userId"
                                        class="action-item" style="background-color:orangered;"
                                        @click="deleteFile(template.id)">
                                        <i class="delete-icon"></i>
                                        <span>删除</span>
                                    </div>
                                    <div class="action-item" style="background-color:#409eff;"
                                        @click="viewFileDetails(template.id, template.templateName)">
                                        <i class="view-icon"></i>
                                        <span>查看</span>
                                    </div>
                                    <div v-if="template.category == `b类` && template.authorId == userId"
                                        class="action-item" style="background-color:greenyellow;"
                                        @click="renameFile(template.id, template.templateName)">
                                        <i class="rename-icon"></i> <!-- 修正图标类名 -->
                                        <span>重命名</span>
                                    </div>
                                    <div class="action-item" style="background-color:palevioletred;"
                                        @click="downloadFile(template.id, template.templateName)">
                                        <i class="download-icon"></i>
                                        <span>下载</span>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 底部的那个页面跳转按钮 -->
        <div class="pagination" v-if="totalPages > 0">
            <button :disabled="currentPage === 1" @click="prevPage">&lt;</button>
            <button @click="changePage($event)" :class="{ active: showPage === currentPage || inpval == showPage }">{{
                showPage }}</button>
            <button @click="changePage($event)" v-if="showPage + 1 <= totalPages"
                :class="{ active: currentPage === showPage + 1 || inpval == showPage + 1 }">{{ showPage + 1
                }}</button>
            <button @click="changePage($event)" v-if="showPage + 2 <= totalPages"
                :class="{ active: currentPage === showPage + 2 || inpval == showPage + 2 }">{{ showPage + 2
                }}</button>
            <button @click="changePage($event)" v-if="showPage + 3 <= totalPages"
                :class="{ active: currentPage === showPage + 3 || inpval == showPage + 3 }">{{ showPage + 3
                }}</button>
            <!-- <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span> -->
            <button :disabled="currentPage === totalPages" @click="nextPage">></button>
            <div>
                <input type="text" style="width: 60px; " v-model="inpvals"> <button @click="gotoPage">Go</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 添加一个简单的 active 状态样式 */
button.active {
    background-color: #6eb9fb;
    /* 绿色背景 */
    color: white;
    /* 白色文字 */
}

/* 图标基础样式 */
.icon {
    width: 20px;
    height: 20px;
    padding: 0;
}

/* 模板管理区域整体布局 */
.file-management {
    min-height: 100vh;
    padding: 2vw;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    /* 启用垂直滚动条 */
    overflow: hidden;
}

.create-template-btn {
    background: #409eff;
    color: white;
    position: relative;
    left: 88%;
    border: none;
    padding: 1.5vh 2.5vh;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;

}

/* 页面头部样式 */
.header {
    width: 100%;
    margin-bottom: 4vh;
    position: relative;
    left: 2vw;
    max-width: 1400px;
}

/* 筛选容器基础样式 */
.filter-container {
    padding: 2vw;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    /* box-sizing: border-box; */
    position: relative;
    left: 6vw;
}

/* 筛选组布局 */
.filter-group {
    position: relative;
    right: 100px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 6px;
}

/* 筛选项布局 */
.filter-item {
    position: relative;
    display: flex;
    flex-direction: column;
    /* gap: 4px; */
}

/* 标签样式 */
label {
    font-size: 12px;
    color: #606266;
}

/* 输入框和选择框基础样式 */
input,
select {
    padding: 8px 10px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    width: 200px;
}

/* 筛选操作按钮区域 */
.filter-actions {
    width: 100vh;
    height: 5vh;
    display: flex;
    position: relative;
    top: 1.3vh;
    flex-direction: row;
    align-items: center;
}

/* 按钮基础样式 */
.btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 80px;
    transition: all 0.2s;
}

/* 查询按钮样式 */
.btn.query {
    background: #409eff;
    color: white;
    border: none;
}

/* 重置按钮样式 */
.btn.reset {
    background: #f4f4f5;
    color: #606266;
    border: 1px solid #d3d4d6;
}

/* 按钮悬停效果 */
.btn:hover {
    opacity: 0.9;
}

/* 表格容器样式 */
.table-container {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    /* overflow: visible;    */

    /* 允许菜单溢出 */
}

/* 表格基础样式 */
table {
    width: 100%;
    border-collapse: collapse;
}

/* 表头样式 */
th {
    background: #f5f7fa;
    color: #909399;
    font-weight: 500;
    padding: 12px;
    text-align: center;
}

/* 表格单元格样式 */
td {
    width: 250px;
    padding-bottom: 6px;
    padding-top: 6px;
    padding-left: 20px;
    padding-right: 20px;
    border-top: 1px solid #ebeef5;
    color: #606266;
    text-align: center;

}

/* 分类标签样式 */
.category-tag {
    display: inline-block;
    padding: 4px 8px;
    background: #ecf5ff;
    color: #409eff;
    border-radius: 4px;
    font-size: 12px;
}

/* 无数据提示样式 */
.no-data {
    text-align: center;
    padding: 24px;
    color: #909399;
}

/* 分页组件样式 */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
}

/* 新增样式 */
.filter-row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
}

.filter-group {
    flex-grow: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
}

.filter-actions {
    flex-shrink: 0;
    display: flex;
    gap: 8px;
    margin-left: 12px;
}

/* 添加goto按钮的悬停效果 */
.goto {
    cursor: pointer;
    transition: transform 0.3s ease;
}

.goto:hover {
    transform: scale(1.2);
}

/* 操作按钮和下拉菜单样式 */
.action-cell {
    position: relative;
    width: 80px;
    /* 固定宽度防止错位 */
}

.act {
    position: relative;
    right: 10vh;
    display: flex;
    justify-content: center;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    background: #f0f2f5;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
}

.action-btn:hover {
    background: #e0e2e5;
}

/* 下拉菜单基础样式 */
.action-menu {
    position: absolute;
    top: 50%;
    /* 垂直居中 */
    right: -110px;
    /* 根据新位置调整 */
    width: 120px;
    background: transparent;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
    transform-origin: right center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    transform: translateX(20px) scale(0.95);
    pointer-events: none;
    /* 新增 */
}

/* 下拉菜单显示时的动画状态 */
.action-menu.show {
    opacity: 1;
    transform: translateX(0) scale(1);
    pointer-events: auto;
    /* 新增 */
}

/* 操作项基础样式 */
.action-item {
    color: white;
    display: flex;
    align-items: center;
    border-radius: 4px;
    padding: 10px 15px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    gap: 8px;
}

/* 操作项悬停动画 */
.action-item:hover {
    color: #000;
    transform: translateX(6px);
    background: rgba(255, 255, 255, 0.2) !important;
}

/* 操作项间分隔线 */
.action-item:not(:last-child)::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 10px;
    right: 10px;
    height: 1px;
    background: rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
}

/* 图标动画效果 */
.action-item i {
    transition: transform 0.3s ease;
}

.action-item:hover i {
    transform: scale(1.2);
}

/* 图标具体样式 */
.delete-icon::before {
    content: "×";
    font-weight: bold;
}

.view-icon::before {
    content: "👁️";
}

.rename-icon::before {
    content: "✎";
}

/* 背景色过渡增强 */
.action-item[style*="background-color:orangered"] {
    background-color: orangered !important;
}

.action-item[style*="background-color:#409eff"] {
    background-color: #409eff !important;
}

.action-item[style*="background-color:greenyellow"] {
    background-color: greenyellow !important;
}

/* 优化图标对齐 */
.action-item i {
    display: inline-block;
    width: 18px;
    height: 18px;
    text-align: center;
}
</style>