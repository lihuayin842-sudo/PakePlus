window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })
// ====================== 全局存储初始化 ======================
// 收藏列表默认空，设置默认参数
const DEFAULT_DATA = {
  bookmarks: [],
  config: {
    theme: "light",    // light / dark 明暗主题
    autoRefresh: false, // 自动刷新页面
    fontSize: 100       // 页面缩放百分比
  }
};

// 读取本地存储数据，无数据则初始化
function loadLocalData() {
  const save = localStorage.getItem("webAppData");
  if (!save) {
    localStorage.setItem("webAppData", JSON.stringify(DEFAULT_DATA));
    return DEFAULT_DATA;
  }
  return JSON.parse(save);
}

// 保存数据到本地
function saveLocalData(data) {
  localStorage.setItem("webAppData", JSON.stringify(data));
}

let appData = loadLocalData();

// ====================== 收藏夹核心方法 ======================
// 添加当前页面到收藏
function addBookmark(title, url) {
  const exist = appData.bookmarks.find(item => item.url === url);
  if (exist) {
    alert("该网址已收藏！");
    return;
  }
  appData.bookmarks.push({ title, url, time: Date.now() });
  saveLocalData(appData);
  alert("收藏成功");
  renderBookmarkList();
}

// 删除指定收藏
function delBookmark(url) {
  appData.bookmarks = appData.bookmarks.filter(item => item.url !== url);
  saveLocalData(appData);
  renderBookmarkList();
}

// 渲染收藏列表到侧边面板
function renderBookmarkList() {
  const listBox = document.getElementById("bookmarkList");
  if (!listBox) return;
  listBox.innerHTML = "";
  if (appData.bookmarks.length === 0) {
    listBox.innerHTML = "<div style='padding:10px;color:#999'>暂无收藏</div>";
    return;
  }
  appData.bookmarks.forEach(item => {
    const itemDom = document.createElement("div");
    itemDom.style = "display:flex;justify-content:space-between;padding:8px 10px;border-bottom:1px solid #eee;";
    itemDom.innerHTML = `
      <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.title}</span>
      <div>
        <button class="openUrl" data-url="${item.url}" style="margin-right:4px">打开</button>
        <button class="delUrl" data-url="${item.url}" style="color:red">删除</button>
      </div>
    `;
    listBox.appendChild(itemDom);
  });
  // 绑定列表按钮点击事件
  document.querySelectorAll(".openUrl").forEach(btn => {
    btn.onclick = () => window.location.href = btn.dataset.url;
  });
  document.querySelectorAll(".delUrl").forEach(btn => {
    btn.onclick = () => delBookmark(btn.dataset.url);
  });
}

// ====================== 设置面板逻辑 ======================
// 保存设置
function saveConfig(key, val) {
  appData.config[key] = val;
  saveLocalData(appData);
  applyConfig();
}

// 应用设置到页面
function applyConfig() {
  // 明暗主题
  document.body.style.background = appData.config.theme === "dark" ? "#111" : "#fff";
  document.body.style.color = appData.config.theme === "dark" ? "#eee" : "#222";
  // 字体缩放
  document.body.style.zoom = appData.config.fontSize / 100;
}

// ====================== 页面UI面板（悬浮侧边栏） ======================
function buildPanelUI() {
  // 外层侧边容器
  const panel = document.createElement("div");
  panel.id = "appSidePanel";
  panel.style = `
    position:fixed;top:0;left:0;width:260px;height:100vh;background:#f8f8f8;
    box-shadow:2px 0 8px #0002;z-index:99999;overflow:auto;
    transform:translateX(-240px);transition:transform 0.3s;
  `;
  panel.innerHTML = `
    <div style="text-align:right;padding:6px;border-bottom:1px solid #ddd;">
      <button id="togglePanel">展开面板</button>
    </div>
    <div style="padding:10px">
      <h4>收藏夹</h4>
      <button id="addCurrentPage" style="width:100%;padding:6px;margin-bottom:8px">收藏当前页面</button>
      <div id="bookmarkList"></div>

      <hr style="margin:16px 0">
      <h4>软件设置</h4>
      <div style="margin:8px 0">
        <label>主题：</label>
        <select id="setTheme">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </div>
      <div style="margin:8px 0">
        <label>页面缩放：</label>
        <input type="range" id="setFontSize" min="80" max="130" value="${appData.config.fontSize}">
        <span id="fontSizeText">${appData.config.fontSize}%</span>
      </div>
      <button id="clearAllBookmark" style="margin-top:10px;color:red">清空全部收藏</button>
    </div>
  `;
  document.body.appendChild(panel);

  // 面板展开/收起
  const toggleBtn = document.getElementById("togglePanel");
  toggleBtn.onclick = () => {
    const trans = panel.style.transform === "translateX(0px)" ? "-240px" : "0px";
    panel.style.transform = `translateX(${trans})`;
    toggleBtn.innerText = trans === "0px" ? "收起面板" : "展开面板";
  };

  // 收藏当前页面按钮
  document.getElementById("addCurrentPage").onclick = () => {
    const title = document.title || "未命名页面";
    const url = window.location.href;
    addBookmark(title, url);
  };

  // 设置-主题切换
  const themeSel = document.getElementById("setTheme");
  themeSel.value = appData.config.theme;
  themeSel.onchange = () => saveConfig("theme", themeSel.value);

  // 设置-缩放滑块
  const sizeSlider = document.getElementById("setFontSize");
  const sizeText = document.getElementById("fontSizeText");
  sizeSlider.oninput = () => {
    sizeText.innerText = sizeSlider.value + "%";
  };
  sizeSlider.onchange = () => saveConfig("fontSize", Number(sizeSlider.value));

  // 清空全部收藏
  document.getElementById("clearAllBookmark").onclick = () => {
    if (confirm("确定清空所有收藏？无法恢复")) {
      appData.bookmarks = [];
      saveLocalData(appData);
      renderBookmarkList();
    }
  };

  // 初始化渲染列表、应用配置
  renderBookmarkList();
  applyConfig();
}

// ====================== 页面加载完成自动执行 ======================
window.addEventListener("load", () => {
  // 延迟创建面板，避免和原网页冲突
  setTimeout(buildPanelUI, 800);
});
