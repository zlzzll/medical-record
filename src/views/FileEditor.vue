<template>
  <div style="display: flex;width: 100%;">
    <div id="app2">
      <button @click="exportToWord"
        style="position: absolute;margin-top: 10px;z-index: 10;margin-left: 510px;border-color: black;height: 35px;font-size: 14px;padding: 0px 12px;width: 98px;">导出并保存</button>
      <!-- <h1>TinyMCE in Vue</h1> -->
      <textarea id="editor" v-model="form.content"></textarea>
    </div>
    <div style="margin-left: 1200px;margin-top: 20px;">
      <button @click="back" style="border-color: black;">返回</button>
      <!-- <div style="background: #44d5a9;width: 300px;height: 600px;margin-top: 10px;">AI</div> -->
      <div class="ai-container">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <div class="loading-text">AI正在思考中...</div>
        </div>

        <!-- AI生成结果 -->
        <div v-else class="results-container">
          <div v-for="(record, index) in aiRecords" :key="index" class="result-card" @click="handleRecordClick(index)">
            <div class="card-header">
              <div class="ai-icon">AI</div>
              <div class="card-title">生成方案 {{ index + 1 }}</div>
            </div>
            <div class="card-content">
              {{ record.displayText }}
              <span class="typing-cursor"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axiosService from "../utils/axios-test"
import { defineComponent, nextTick, onMounted, reactive, ref } from "vue";
import axios from "axios";
import { saveAs } from "file-saver";
// import { useRoute } from 'vue-router';
import docx2html from "docx2html";
import mammoth from "mammoth";
import PizZip from "pizzip";
// import {  onMounted, nextTick } from 'vue';

const htmlContent = ref('');
const fileContent = ref(""); // 响应式变量，存储文件内容

export default defineComponent({
  name: 'FileEditor',
  setup() {
    const form = reactive({
      content: "",
    });

    //AI
    let debounceTimer = null;
    const isLoading = ref(false)
    const aiRecords = reactive([])

    // 模拟数据
    const mockData = [
      "患者主诉持续性头痛伴恶心，查体显示血压升高（160/95mmHg），建议进行头颅CT检查及24小时动态血压监测，暂予硝苯地平控释片30mg qd降压治疗。",
      "根据患者心电图ST段压低及胸痛症状，考虑不稳定型心绞痛可能，建议立即查心肌酶谱、肌钙蛋白，并行冠脉造影评估，给予阿司匹林300mg负荷量，硝酸甘油舌下含服。"
    ]

    const typeText = (text, index) => {
      let charIndex = 0
      aiRecords[index].displayText = ''

      const typing = setInterval(() => {
        if (charIndex < text.length) {
          aiRecords[index].displayText += text.charAt(charIndex)
          charIndex++
        } else {
          clearInterval(typing)
        }
      }, 30) // 调整速度
    }

    const generateMedicalRecord = async () => {
      try {
        isLoading.value = true
        aiRecords.length = 0 // 清空旧数据

        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 1500))

        // 填充模拟数据
        mockData.forEach((text, index) => {
          aiRecords.push({
            fullText: text,
            displayText: ''
          })
          setTimeout(() => typeText(text, index), index * 500) // 错开打印时间
        })
      } finally {
        isLoading.value = false
      }
    }
    const handleRecordClick = (index) => {
      const editor = window.tinymce.get("editor")
      if (editor) {
        try {
          editor.focus()
          editor.insertContent(aiRecords[index].fullText + "<br>")
          const selection = editor.selection
          selection.collapse(false)
        } catch (e) {
          console.error("内容插入失败:", e)
        }
      }

      console.groupCollapsed(`点击第 ${index + 1} 个生成方案`)
      console.log('序号:', index + 1)
      console.log('完整内容:', aiRecords[index].fullText)
      console.log('当前显示:', aiRecords[index].displayText)
      console.groupEnd()
    }
    // const generateMedicalRecord = async () => {
    //   try {
    //     const editorInstance = window.tinymce.get("editor");
    //     if (!editorInstance) {
    //       console.error("TinyMCE 未初始化");
    //       return;
    //     }

    //     const content = editorInstance.getContent() || "";
    //     if (!content.trim()) {
    //       console.warn("病历文本为空");
    //       return;
    //     }

    //     console.log("发送 AI 生成病历请求:", content);
    //     const response = await axiosService.post("/api/record/ai/generate", {
    //       text: content,
    //     });

    //     console.log("AI 生成病历:", response.data);
    //   } catch (error) {
    //     console.error("病历生成失败:", error);
    //   }
    // };

    // 监听 TinyMCE 变化
    const setupEditorListener = (editor) => {
      let lastCursorPos = null

      editor.on("click keyup", (e) => {
        lastCursorPos = editor.selection.getRng()
      })

      editor.on("change input keyup", () => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(generateMedicalRecord, 1000)
      })
    }

    const loadTinyMCE = () => {
      return new Promise((resolve, reject) => {
        if (window.tinymce) return resolve()

        const script = document.createElement('script')
        script.src = '/tinymce/tinymce.min.js'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }
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
        width: '109%',
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
      return src.startsWith('http') ? match : match.replace(src, '<url id="cvnl16ij4eglsjudn39g" type="url" status="failed" title="" wc="0">http://example.com/default-image.jpg</url>  ');
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
  let filename = "exported_document.docx"; // 默认文件名
  saveAs(blob, filename); // 下载 Word 文件

  // 延迟上传，确保文件下载完
  setTimeout(() => {
    uploadTemplate(blob, filename);
  }, 1000);

  // 保存到 localStorage
  const savedContents = JSON.parse(localStorage.getItem("savedContents") || '{}');
  savedContents[caseId] = content;
  localStorage.setItem("savedContents", JSON.stringify(savedContents));

  ElMessage.success("内容已保存");
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
        const response = await axiosService.post("/api/template/save", formData, {
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
      back,
      isLoading,
      aiRecords,
      generateMedicalRecord,
      handleRecordClick
    };
  }



});
</script>

<style>
.ai-container {
  background: #f5f9fc;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 128, 0.08);
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
  border-top-color: #44d5a9;
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
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 128, 0.06);
  transition: transform 0.2s;
}

.result-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.8rem;
}

.ai-icon {
  background: #44d5a9;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
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
}

.typing-cursor {
  display: inline-block;
  width: 8px;
  height: 1.2em;
  background: #44d5a9;
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


#app2 {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: absolute;
  top: 10px;
  /* background: #000; */
  margin-left: 20px;
}
</style>