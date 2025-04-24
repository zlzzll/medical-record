<template>
  <div id="app1">
    <button @click="exportToWord"
      style="position: absolute;margin-top: 10px;z-index: 10;margin-left: 595px;border-color: black;">导出并保存</button>
    <textarea id="editor" v-model="form.content"></textarea>
    <div></div>
  </div>
</template>

<script>
import axiosService from "../utils/axios-test"
import { defineComponent, nextTick, onMounted, reactive, ref } from "vue";
import axios from "axios";
// import { useRoute } from 'vue-router';
import docx2html from "docx2html";
import mammoth from "mammoth";
import PizZip from "pizzip";
// import htmlDocx from "html-docx-js";
// import { saveAs } from "file-saver";

const htmlContent = ref('');
const fileContent = ref(""); // 响应式变量，存储文件内容
export default defineComponent({
  name: 'Editor',
  setup() {
    const form = reactive({
      content: "",
    });

    // 动态引入 TinyMCE
    const loadTinyMCE = () => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/tinymce/tinymce.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };
    // 提取 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const fileUrl = urlParams.get('fileUrl');
    const name = urlParams.get('name');

    // 控制台输出
    console.log('id:', id);
    console.log('fileUrl:', fileUrl);
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

        // 使用 Mammoth 提取 HTML 格式
        let htmlResult;
        try {
          htmlResult = await mammoth.convertToHtml({ arrayBuffer: buffer });
        } catch (err) {
          console.error(err)
        }


        let processedHtml = htmlResult.value;

        // 处理图片路径，防止相对路径无法显示
        processedHtml = processedHtml.replace(/<img[^>]+src="([^">]+)"/g, (match, src) => {
          return src.startsWith('http') ? match : match.replace(src, 'http://example.com/default-image.jpg');
        });

        htmlContent.value = processedHtml;
        fileContent.value = processedHtml; // **用 HTML 格式存储内容**
        console.log("转换后的 HTML:", fileContent.value);

      } catch (err) {
        // console.error("文档转换失败:", err);
      }
    };



    onMounted(async () => {
      await convertWordToHtml(); // 等待 HTML 数据加载

      loadTinyMCE().then(() => {
        // 富文本编辑器
        nextTick(() => {
          window.tinymce.init({
            // file_picker_callback: handleUploadFile,
            // file_picker_types: 'file image media',
            autosave_interval: '5000',
            autosave_prefix: 'tinymce-autosave-{path}{query}-{id}-',
            autosave_restore_when_empty: true,
            autosave_retention: '2m',
            selector: '#editor', // 选择器，指定哪个元素使用 TinyMCE
            license_key: 'gpl', // 许可密钥，如果是 GPL 版本则不需要设置
            language: 'zh_CN', // 语言设置
            width: '98%', // 编辑器宽度
            height: 680, // 编辑器高度
            menubar: true, // 是否显示菜单栏
            statusbar: true, // 是否显示状态栏
            branding: false, // 去除底部的 TinyMCE 广告
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
              'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media',
              'table', 'help', 'wordcount', 'emoticons', 'autosave', 'quickbars', 'codesample'
            ], // 启用的插件列表
            toolbar: [
              'code formatselect fontselect fontsizeselect forecolor backcolor bold italic underline strikethrough link alignment outdent indent bullist numlist blockquote subscript superscript removeformat table image media importword charmap pagebreak formatpainter cut copy undo redo restoredraft searchreplace fullscreen'
            ], // 工具栏按钮列表
            toolbar_sticky: true, // 工具栏固定在顶部
            content_css: '/path/to/content.css', // 自定义内容样式文件路径
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
              `, // 自定义编辑器内容的样式
            images_upload_handler: (blobInfo, success, failure) => {
              const xhr = new XMLHttpRequest();
              xhr.withCredentials = false;
              xhr.open('POST', '/your-backend-endpoint'); // 图片上传的后端接口
              xhr.onload = () => {
                if (xhr.status === 200) {
                  success(xhr.responseText); // 上传成功，返回图片 URL
                } else {
                  failure('HTTP Error: ' + xhr.status); // 上传失败，返回错误信息
                }
              };
              xhr.onerror = () => {
                failure('Image upload failed due to a network error.'); // 网络错误
              };
              xhr.send(blobInfo.blob()); // 发送图片数据
            },
            setup: (editor) => {
              editor.on('init', () => {
                if (fileContent.value) {
                  editor.setContent(fileContent.value); // 设置 TinyMCE 编辑器的内容
                }
              });
            }
          });
        });
      }).catch(error => {
        console.error('Failed to load TinyMCE:', error); // 处理 TinyMCE 加载失败的情况
      });
    });


    const exportToWord = async () => {
      const content = window.tinymce.get("editor").getContent(); // 获取 HTML 内容

      const blob = new Blob(["\ufeff" + content], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const filename = name.replace(/\.docx$/i, '') + ".docx"; // 避免重复 .docx
      saveAs(blob, filename); // 下载 Word 文件

      // 延迟上传，确保文件下载完
      setTimeout(() => {
        uploadTemplate(blob, filename);
      }, 1000);
    };



    const uploadTemplate = async (fileBlob, filename) => {
      const fileExtension = filename.split('.').pop().toLowerCase();
      if (fileExtension !== 'docx') {
        ElMessage.error('只能上传 DOCX 文件');
        return;
      }
      const file = new File([fileBlob], filename, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      // console.log("文件 MIME 类型:", file.type);
      let formData = new FormData();
      formData.append("multipartFile", file, filename);

      formData.append(
        "req",
        new Blob([JSON.stringify({ id })], { type: "application/json" })
      );

      try {
        const response = await axiosService.post("/api/template/save", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        console.log("模板保存成功:", response.data);
      } catch (error) {
        console.error("模板保存失败:", error);
      }
    };


    return {
      form,
      exportToWord
    };
  }



});
</script>

<style>
#app1 {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: -90px;
  height: 780px;
  /* background: #000; */
  padding-top: 105px;
  margin-left: 20px;
}
</style>