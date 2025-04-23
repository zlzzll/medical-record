<template>
  <div style="display: flex;width: 100%;height: 100%;background-color: #eff3fd;">
    <div id="app2">
      <button @click="back"
        style="border-color: black;height: 35px;position: absolute;margin-top: 10px;z-index: 10;margin-left: 380px;width: 70px;">
        <p style="margin-top: -4px;font-size: 14px;">返回</p>
      </button>
      <button @click="exportToWord"
        style="position: absolute;margin-top: 10px;z-index: 10;margin-left: 471px;border-color: black;height: 35px;font-size: 14px;padding: 0px 12px;width: 98px;">导出并保存</button>
      <textarea id="editor" v-model="form.content"></textarea>
    </div>

    <!-- aicontainer -->
    <div :style="{
      marginLeft: isFolded ? '1130px' : '1130px',
      marginTop: '20px',
      transition: 'all 0.3s ease'
    }" class="aicontainer" v-if="!isFolded">
      <div class="ai-container">
        <!-- 顶部栏 -->
        <div class="top-bar">
          <div class="ai-icon"><img src="../assets/ai.png" alt="" style="width: 32px;"></div>
          <div class="ai-name">MediWrite病历智联笔</div>
          <!-- 折叠按钮 -->
          <div v-if="!isFolded" @click="toggleFold">
            <p style="font-size: 22px; margin-left: 80px; cursor: pointer;" title="关闭智联笔">x</p>
          </div>
        </div>
        <!-- 横线 -->
        <!-- <hr> -->
        <!-- 内容框 -->
        <div class="content-container">
          <!-- 对话记录 -->
          <div v-for="(message, index) in messages" :key="index" class="message-card">
            <div v-if="message.type === 'user'" class="user-card">
              <div class="user-content">
                <div class="user-text"
                  style="background-color:white; color: #1a3a5f; padding: 8px; border-radius: 10px;width: 300px;margin-left: 42px;margin-top: 10px;font-size: 14px;">
                  {{ message.text }}
                </div>
              </div>
            </div>
            <div v-else class="ai-card" style="display: flex;">
              <div class="ai-avatar">
                <img src="../assets/ai.png" alt="AI Avatar" style="width: 28px; height: 28px; ">
              </div>
              <div class="ai-content">
                <div class="ai-text" @click="handleRecordClick(index)"
                  style="background-color:#d9e3fd; color: #333333; padding: 8px; border-radius: 10px; width: 298px; margin-left: -5px; margin-top: 10px; font-size: 14px; border: 1px #ccc;">
                  {{ message.text }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 底部输入框 -->
        <div class="bottom-bar" id="input-with-button">
          <input type="text" placeholder="有什么问题需要智联笔帮忙？" v-model="userInput" @keyup.enter="handleUserInput">
          <button @click="handleUserInput" class="sendbutton">发送</button>
        </div>
      </div>
    </div>

    <!-- 小按钮（折叠后显示） -->
    <button v-if="isFolded" @click="toggleFold" class="assistant-button">
      <img src="../assets/ai.png" alt="" style="width: 29px;margin-left: -10px;">
      <span class="assistant-text">病历智联笔</span>
    </button>
  </div>
</template>

<script>
import axiosService from "../utils/axios-test";
import { saveAs } from "file-saver";
import mammoth from "mammoth";
import { defineComponent, nextTick, onMounted, reactive, ref, watch } from "vue";
export default defineComponent({
  name: 'FileEditor',
  setup() {
    const isFolded = ref(false);
    const messages = reactive([]);
    const form = reactive({
      content: '',
    });
    const isLoading = ref(false);
    const userInput = ref('');
    const canGenerateMedicalRecord = ref(true); // 控制是否可以调用 generateMedicalRecord
    const mockData = [
      " 处方：1、黄葵胶囊每粒装0.43g(相当于饮片2g) 共15盒 口服 3次/日 一次5.0粒  2、叶酸片0.4mg 共1盒 口服 1次/日 一次2.0片   3、坎地沙坦酯片8mg 共4盒 口服 1次/日 一次8.0mg",
      "①定期监测血压： 建议每日早晚定时测量血压，并记录血压变化，便于评估药物疗效；若出现头晕、头痛、视力模糊、胸闷等症状，应及时就医。② 腰痛管理： 建议避免长时间久坐或弯腰负重；可适当进行热敷或康复锻炼，如医生许可，可做核心肌群强化训练；必要时可就诊康复科或骨科进一步评估是否存在腰椎病变。③饮食与生活方式调整： 低盐低脂饮食，多食富含叶酸的绿叶蔬菜、全谷类；控制体重，适度运动（如快走、游泳），每周不少于3次，每次30分钟；保持规律作息，避免精神紧张和过度劳累。④定期复查：每3个月建议复查血压、肾功能、电解质；每半年检查叶酸水平及血常规，评估治疗效果"
    ];

    const toggleFold = () => {
      isFolded.value = !isFolded.value;
      const editor = window.tinymce.get("editor");
      if (editor) {
        const editorContainer = editor.getContainer();
        if (editorContainer) {
          editorContainer.style.width = isFolded.value ? '143%' : '105%';
        }
      }
      const backButton = document.querySelector('#app2 button:nth-child(1)');
      const exportButton = document.querySelector('#app2 button:nth-child(2)');
      if (backButton) {
        backButton.style.marginLeft = isFolded.value ? '790px' : '380px';
      }
      if (exportButton) {
        exportButton.style.marginLeft = isFolded.value ? '870px' : '471px';
      }
    };

    const typeText = (text, index) => {
      let charIndex = 0;
      messages[index].text = '';

      const typing = setInterval(() => {
        if (charIndex < text.length) {
          messages[index].text += text.charAt(charIndex);
          charIndex++;
        } else {
          clearInterval(typing);
        }
      }, 30);
    };

    // 从 localStorage 中加载之前的对话
    const loadMessages = () => {
      const savedMessages = localStorage.getItem('aiChatHistory');
      if (savedMessages) {
        messages.push(...JSON.parse(savedMessages));
      }
    };

    // 保存对话到 localStorage
    const saveMessages = () => {
      localStorage.setItem('aiChatHistory', JSON.stringify(messages));
    };
    // 监听消息更新并自动滚动到底部
    watch(messages, () => {
      nextTick(() => {
        scrollToBottom();
      });
    }, { deep: true });

    // 滚动到底部的函数
    const scrollToBottom = () => {
      const contentContainer = document.querySelector('.content-container');
      if (contentContainer) {
        contentContainer.scrollTop = contentContainer.scrollHeight;
      }
    };
    // 页面加载时清空聊天记录
    onMounted(() => {
      // 清空 messages 数组
      messages.splice(0, messages.length);
      scrollToBottom();
    });

    // 用户发送消息
    const handleUserInput = (isClickInsert = false) => {
      if (!userInput.value.trim()) {
        console.warn("输入为空！");
        return;
      }

      // 添加用户输入到消息列表
      messages.push({
        type: 'user',
        text: userInput.value
      });
      generateMedicalRecord(userInput.value);
      // generateMedicalRecord(mockData[1]); // 用户输入时返回第二条数据
      // console.log(userInput.value)
      // 清空输入框
      userInput.value = '';
    };

    const generateMedicalRecord = async (content) => {
      try {
        isLoading.value = true;

        // 获取编辑器内容
        const editor = window.tinymce.get("editor");
        const editorContent = editor ? editor.getContent() : '';

        // 检查内容是否为空
        const textToSend = content !== undefined ? content : editorContent;
        if (!textToSend.trim()) throw new Error("文本内容不能为空");

        // 创建枚举值映射
        const enumMap = {
          "主诉": "complaints",
          "现病史": "current_history",
          "既往史": "recent_history",
          "诊断": "diagnosis",
          "建议": "advice"
        };

        // 处理前两个字符
        const firstTwoChars = textToSend.length >= 2
          ? textToSend.substring(0, 2) === "主诉"
            ? "主诉"
            : textToSend.substring(0, 3) === "现病史"
              ? "现病史"
              : textToSend.substring(0, 3) === "既往史"
                ? "既往史"
                : textToSend.substring(0, 4) === "初步诊断"
                  ? "诊断"
                  : textToSend.substring(0, 2) === "建议"
                    ? "建议"
                    : "现病史"
          : "现病史";

        // 获取对应的枚举值
        const textEnumValue = enumMap[firstTwoChars] || "current_history";

        // 添加加载状态
        messages.push({ type: 'ai', text: '正在加载......' });

        // 发送请求
        const response = await axiosService.post("/api/record/ai/generate", {
          text: textToSend,
          textEnum: textEnumValue // 使用枚举值
        });

        // 校验 API 响应
        if (!response.data.data || !Array.isArray(response.data.data.aiTextList)) {
          throw new Error("API 返回格式错误");
        }

        const aiTextList = response.data.data.aiTextList;
        if (aiTextList.length === 0) {
          throw new Error("AI 生成失败，请重试");
        }

        // 更新消息列表
        const updateLastMessage = (text) => {
          if (messages.length > 0 && messages[messages.length - 1].type === 'ai') {
            messages[messages.length - 1].text = text;
          }
        };

        // 清除加载状态
        if (messages[messages.length - 1].text === '正在加载......') {
          messages.pop();
        }

        // 添加 AI 生成内容
        aiTextList.forEach(item => {
          messages.push({ type: 'ai', text: item });
          saveMessages(); // 每次更新后保存
        });

      } catch (error) {
        console.error("病历生成失败:", error);
        const userErrorMessage = error.response?.data?.message || "请求错误，请重新尝试";
        if (messages.length > 0 && messages[messages.length - 1].type === 'ai') {
          messages[messages.length - 1].text = userErrorMessage;
        }
      } finally {
        isLoading.value = false;
      }
    };


    //点击粘贴
    const handleRecordClick = (index) => {
      const editor = window.tinymce.get("editor");
      if (editor) {
        try {
          // 获取AI生成的文本
          const aiText = messages[index].text;

          // 删除“主诉”或“现病史”后面的所有内容
          const cleanedText = aiText.replace(/(主诉|现病史).*/, '$1');

          editor.focus();
          editor.insertContent(cleanedText + "<br>");
          const selection = editor.selection;
          selection.collapse(false);
        } catch (e) {
          console.error("内容插入失败:", e);
        }
      }

      // 禁用 generateMedicalRecord
      canGenerateMedicalRecord.value = false;

      // 3秒后恢复 generateMedicalRecord
      setTimeout(() => {
        canGenerateMedicalRecord.value = true;
      }, 3000);
    };

    // 监听 TinyMCE 变化
    const setupEditorListener = (editor) => {
      let debounceTimer = null;
      let lastCursorPos;

      // 监听光标位置变化
      editor.on("click keyup", (e) => {
        if (editor.selection && editor.selection.getRng) {
          lastCursorPos = editor.selection.getRng();
        }
      });

      // 监听内容变化
      editor.on("change input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (canGenerateMedicalRecord.value) {
            const currentNode = editor.selection.getNode();
            const currentText = extractCurrentSectionContent(currentNode);

            // 判断光标是否在“主诉”或“现病史”后面
            if (isCursorAfterKeywords(editor, currentNode, ["现病史","既往史","初步诊断","建议"])) {
              generateMedicalRecord(currentText);
            }
          }
        }, 3000);
      });
    };

    // 判断光标是否在指定关键词后面
    const isCursorAfterKeywords = (editor, node, keywords) => {
      if (!editor || !editor.selection || !editor.selection.getRng) {
        return false; // 如果 editor 或 selection 不存在，直接返回 false
      }

      const textContent = node.textContent;
      const selectionRange = editor.selection.getRng();
      const lastCursorPos = selectionRange.startOffset;

      // 遍历关键词，检查光标是否在关键词后面
      for (const keyword of keywords) {
        const keywordIndex = textContent.indexOf(keyword);
        if (keywordIndex !== -1 && lastCursorPos > keywordIndex + keyword.length) {
          return true;
        }
      }

      return false;
    };

    // 提取当前部分的文本内容
    const extractCurrentSectionContent = (node) => {
      // 获取光标所在的节点
      const currentNode = node;

      // 获取当前节点的文本内容
      const currentText = currentNode.textContent;

      // 提取特定部分的文本内容
      // 这里可以根据需要进行文本处理，比如去除多余的空格和换行符
      const cleanedText = currentText.replace(/\s+/g, ' ').trim();

      return cleanedText;
    };

    const loadTinyMCE = () => {
      return new Promise((resolve, reject) => {
        if (window.tinymce) return resolve();

        const script = document.createElement('script');
        script.src = '/tinymce/tinymce.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };
    // 提取 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const caseId = urlParams.get('caseId');
    const fileUrl = urlParams.get('fileUrl');

    // 缓存状态
    const fileContent = ref(null); // 缓存内容
    const htmlContent = ref(null); // HTML 内容

    // 页面加载时
    onMounted(async () => {
      // 1. 优先从缓存中获取内容
      const savedContents = JSON.parse(localStorage.getItem("savedContents") || '{}');
      const cachedContent = savedContents[caseId];

      if (cachedContent) {
        fileContent.value = cachedContent; // 使用缓存内容
        console.log("使用缓存内容:", cachedContent);
      } else {
        // 2. 如果没有缓存，调用 convertWordToHtml 获取内容
        await convertWordToHtml(); // 等待 HTML 数据加载
      }

      // 3. 初始化 TinyMCE 编辑器
      loadTinyMCE().then(() => {
        nextTick(() => {
          window.tinymce.init({
            selector: '#editor',
            license_key: 'gpl',
            language: 'zh_CN',
            width: '105%',
            height: '700px',
            menubar: true,
            statusbar: true,
            branding: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
              'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media',
              'table', 'help', 'wordcount', 'emoticons', 'autosave', 'quickbars', 'codesample'
            ],
            toolbar: [
              'code formatselect fontselect fontsizeselect forecolor backcolor bold italic underline strikethrough link alignment outdent indent bullist numlist blockquote subscript superscript removeformat table image media importword charmap pagebreak formatpainter cut copy undo redo restoredraft searchreplace fullscreen'
            ],
            toolbar_sticky: true,
            content_css: '/path/to/content.css',
            content_style: `
          h2 { position: relative; z-index: 99; }
          h2::before {
            content: "";
            display: block;
            width: 200px;
            height: 8px;
            position: absolute;
            bottom: 6px;
            left: -4px;
            z-index: -1;
            border-radius: 4px 0 0 4px;
            background: linear-gradient(90deg, #F6AFB0 0%, #FFFFFF 100%);
          }
        `,
            images_upload_handler: (blobInfo, success, failure) => {
              const xhr = new XMLHttpRequest();
              xhr.withCredentials = false;
              xhr.open('POST', '/your-backend-endpoint');
              xhr.onload = () => {
                if (xhr.status === 200) {
                  success(xhr.responseText);
                } else {
                  failure('HTTP Error: ' + xhr.status);
                }
              };
              xhr.onerror = () => {
                failure('Image upload failed due to a network error.');
              };
              xhr.send(blobInfo.blob());
            },
            setup: (editor) => {
              editor.on('init', () => {
                if (fileContent.value) {
                  editor.setContent(fileContent.value); // 设置内容
                }
                setupEditorListener(editor); // 你自己的监听器
              });
            }
          });
        });
      }).catch(error => {
        console.error('Failed to load TinyMCE:', error);
      });
    });

    // 转换 Word 到 HTML
    const convertWordToHtml = async () => {
      try {
        if (!fileUrl) {
          throw new Error("fileUrl 参数缺失");
        }

        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`文件获取失败: ${response.status} ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer: buffer });
        let processedHtml = htmlResult.value;

        // 替换 img 的 src，防止相对路径无法显示
        processedHtml = processedHtml.replace(/<img[^>]+src="([^">]+)"/g, (match, src) => {
          return src.startsWith('http') ? match : match.replace(src, 'http://example.com/default-image.jpg </url>  ');
        });

        htmlContent.value = processedHtml;
        fileContent.value = processedHtml; // 缓存 HTML
        console.log("转换后的 HTML:", processedHtml);
      } catch (err) {
        console.error("文档转换失败:", err);
      }
    };

    // 导出到 Word
    const exportToWord = async () => {
      const content = window.tinymce.get("editor").getContent(); // 获取 HTML 内容
      const blob = new Blob(["\ufeff" + content], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // 从 URL 查询参数中获取 fileName
      const urlParams = new URLSearchParams(window.location.search);
      const fileNameParam = urlParams.get("fileName") || "exported_document.docx"; // 默认文件名

      // 确保 fileNameParam 是字符串
      if (typeof fileNameParam !== "string") {
        throw new Error("fileNameParam must be a string");
      }

      // 设置文件名
      const filename = fileNameParam.endsWith(".docx") ? fileNameParam : `${fileNameParam}.docx`;

      saveAs(blob, filename); // 下载 Word 文件

      // 延迟上传，确保文件下载完
      setTimeout(() => {
        uploadTemplate(blob, filename);
      }, 1000);

      // 保存到 localStorage
      const savedContents = JSON.parse(localStorage.getItem("savedContents") || '{}');
      savedContents[caseId] = content;
      localStorage.setItem("savedContents", JSON.stringify(savedContents));
    };

    // 辅助函数：获取 URL 参数
    const getQueryParam = (key) => {
      const params = new URLSearchParams(window.location.search);
      return params.get(key);
    };

    const uploadTemplate = async (fileBlob, filename) => {
      // 验证文件扩展名是否是 .docx
      const fileExtension = filename.split('.').pop().toLowerCase();
      if (fileExtension !== 'docx') {
        ElMessage.error('只能上传 DOCX 文件');
        return; // 如果文件不是 .docx，直接停止上传
      }

      // 创建 FormData 对象
      let formData = new FormData();
      formData.append("multipartFile", fileBlob, filename);

      const templateID = caseId;
      formData.append(
        "req",
        new Blob([JSON.stringify(templateID)], { type: "application/json" })
      );

      try {
        // 发送 POST 请求上传文件
        const response = await axiosService.post("/api/record/save", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        // 成功时的响应
        console.log("文件保存成功:", response.data);

      } catch (error) {
        // 上传失败时的错误处理
        console.error("文件保存失败:", error);
      }
    };
    const back = () => {
      window.location.href = '/filemanage'
    };

    return {
      form,
      exportToWord,
      userInput,
      messages,
      back,
      isLoading,
      generateMedicalRecord,
      handleRecordClick,
      toggleFold,
      handleUserInput,
      isFolded,
    };
  }
});
</script>



<style scoped>
.sendbutton {
  font-size: 14px;
}

.sendbutton:hover {
  opacity: 0.8;
}

/* 助手按钮样式 */
.assistant-button {
  position: fixed;
  right: -15px;
  bottom: 70px;
  z-index: 100;
  width: 115px;
  height: 40px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image:
    linear-gradient(to bottom left, #a895f8, #5f7df7, #7cb4f9),
    url('../assets/ai.png');
  background-size: cover, contain;
  background-repeat: no-repeat, no-repeat;
  background-position: center, center;
  transition: all 0.3s ease;
}


.assistant-button:hover {
  opacity: 0.8;
}

.assistant-text {
  color: white;
  font-size: 16px;
  margin-left: 2px;
}

.aicontainer {
  margin-left: 1130px;
  margin-top: 20px;
}



.top-bar {
  margin-top: -32px;
  display: flex;
  align-items: center;
  padding: 10px;
  color: rgb(8, 8, 8);
  /* background: #342a5d; */
  background-image:
    linear-gradient(to bottom left, #b8a9f2, #b7c3f5, #97c3f9);
  width: 388px;
  height: 83px;
  margin-left: -32px;
  border-radius: 10px 10px 0 0;
}

.ai-icon {
  /* width: 35px;
  height: 35px; */
  /* background-color: #4a57f6; */
  /* border-radius: 100px; */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  margin-left: 25px;
  /* background-image:
    linear-gradient(to bottom left, #a895f8, #5f7df7, #7cb4f9),
    url('../assets/ai.png'); */
}


.ai-name {
  font-weight: bold;
  font-size: 18px;
}

.content-container {
  width: 360px;
  margin-left: -12px;
  height: calc(100% - 90px);
  overflow-y: auto;
}

.result-card {
  margin-left: -25px;
  border-radius: 10px;
  display: flex;
}


.card-title {
  font-weight: bold;
  margin-left: 10px;
}

.card-content {
  word-wrap: break-word;
}

.typing-cursor {
  display: inline-block;
  margin-left: 5px;
  animation: blink 1s infinite;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.bottom-bar {
  margin-top: 10px;
  width: 350px;
  display: flex;
  padding: 5px;
  color: white;
}

.bottom-bar input {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 10px;
  height: 40px;
  width: 345px;
  margin-left: -12px;
}

.bottom-bar button {
  background-color: #4a57f6;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 0 5px 5px 0;
  cursor: pointer;
  width: 50px;
  height: 30px;
  border-radius: 20px;
  margin-top: 5px;
}


.ai-container {
  background: #f5f9fc;
  padding: 2rem;
  border-radius: 6px;
  width: 390px;
  height: 692px;
  margin-top: -6px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #e3f2fd;
  border-radius: 50%;
  border-top-color: #4a57f6;
  animation: spin 1s ease-in-out infinite;
}

.loading-text {
  margin-top: 1rem;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 500;
}

.results-container {
  display: grid;
  gap: 1.5rem;
}

.result-card {
  border-radius: 12px;
  padding-left: 1.5rem;
  padding-top: 1rem;
  padding-right: 1.5rem;
}

.result-card:hover {
  /* opacity: 0.8; */
}


.card-title {
  margin-left: 1rem;
  font-size: 1.2rem;
  color: #2c3e50;
  font-weight: 600;
}

.card-content {
  line-height: 1.6;
  color: #4a5568;
  font-size: 1rem;
  min-height: 80px;
  white-space: pre-wrap;
  font-size: 14px;
  padding: 10px;
}

.card-header {
  margin-left: -5px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 128, 0.06);
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.8rem;
  border-radius: 10px;
}

.ai-avatar {
  margin-right: 1rem;
  margin-top: 10px;
}

.ai-content {
  width: 290px;
  flex: 1;
}

.card-content {
  display: flex;
  align-items: flex-start;
  word-wrap: break-word;
}

.typing-cursor {
  margin-left: 5px;
  animation: blink 1s infinite;
}

@key blinkframes {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.typing-cursor {
  display: inline-block;
  width: 8px;
  height: 1.2em;
  background: #4a57f6;
  margin-left: 2px;
  animation: blink 1s step-end infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

#input-with-button {
  position: relative;
  display: inline-block;
}

#input-with-button input[type="text"] {
  padding-right: 60px;
  /* 按钮宽度 + 一定的间距 */
}

#input-with-button button {
  position: absolute;
  right: 20px;
  /* 调整按钮距离输入框的位置 */
  top: 5px;
  padding: 5px 10px;
}

#app2 {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: absolute;
  top: 10px;
  margin-left: 20px;
}
</style>